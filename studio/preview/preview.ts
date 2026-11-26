/* Visual editing for the static site, loaded by design/assets/cms.js only inside the Studio's Presentation tool.
   Data: @sanity/core-loader. Outside live mode it reads the public API (published); once the Studio connects, the
   Studio itself answers the query (drafts, with the editor's own login), so the site carries no token.
   Overlays: @sanity/visual-editing-standalone (no React on the page). Built by `pnpm build:preview` into
   design/assets/preview.js and preview.css, committed with the site (the site has no build step). */
import { createClient, stegaClean } from '@sanity/client/stega';
import { createQueryStore } from '@sanity/core-loader';
import { createDataAttribute, enableVisualEditing } from '@sanity/visual-editing-standalone';

type Start = { query: string; studioUrl: string; onData: (data: unknown) => void; onError: (e: unknown) => void };

/* Fields the site uses for logic (ids, keys, links, video ids): never stega-encoded. */
const SKIP = new Set([
	'id', 'key', '_key', '_type', 'slug', 'category', 'section', 'featured', 'related', 'url', 'orig', 'video', 'source', 'year', 'workYear', 'w', 'h',
	'linkedin', 'instagram', 'behance', 'bluesky', 'cara',
]);

/* Values the site uses for logic, without the invisible stega characters. */
/* The Studio tells the perspective once, when it changes, and not again to a page that reconnects after a reload:
   remember it for the session (Presentation's own ?sanity-preview-perspective= first, drafts by default). */
const PERSPECTIVE_KEY = 'sanity-live-text:perspective';
type Perspective = 'drafts' | 'published' | string[];
export function rememberedPerspective(): Perspective {
	try {
		const asked = new URLSearchParams(location.search).get('sanity-preview-perspective');
		if (asked) return asked.includes(',') ? asked.split(',') : (asked as Perspective);
		const kept = sessionStorage.getItem(PERSPECTIVE_KEY);
		if (kept) return JSON.parse(kept) as Perspective;
	} catch { /* storage blocked */ }
	return 'drafts';
}
export function keepPerspective(p: unknown): void {
	try { sessionStorage.setItem(PERSPECTIVE_KEY, JSON.stringify(p)); } catch { /* storage blocked */ }
}

export const clean = <T>(v: T): T => stegaClean(v) as T;
/* data-sanity value for things stega cannot mark (images). */
export const attrFor = (studioUrl: string) => (id: string, type: string, path: string) => createDataAttribute({ baseUrl: studioUrl, id, type, path }).toString();

export function start({ query, studioUrl, onData, onError }: Start) {
	const client = createClient({
		projectId: 'arbdqygj',
		dataset: 'production',
		apiVersion: '2025-02-19',
		useCdn: true,
		perspective: rememberedPerspective() as 'drafts',
		stega: {
			enabled: true,
			studioUrl,
			filter: (props) => {
				/* an empty string must stay empty (falsy): `en || pt` falls back on it */
				if (!props.value.trim()) return false;
				const last = props.resultPath[props.resultPath.length - 1];
				return typeof last === 'string' && SKIP.has(last) ? false : props.filterDefault(props);
			},
		},
	});
	const store = createQueryStore({ client, ssr: false });
	const debug = (window as unknown as { DH_LIVE: Record<string, unknown> }).DH_LIVE = { connected: false, updates: 0, perspective: null as unknown };
	store.enableLiveMode({
		client,
		onConnect: () => { debug.connected = true; },
		onDisconnect: () => { debug.connected = false; },
		onPerspective: (p) => { debug.perspective = p; keepPerspective(p); },
	});
	/* A query of its own per page load: with the same query and params, the Studio (sanity 6.25) goes on answering the
	   page that was there before a reload or a ?para= navigation, and edits stop showing. */
	const load = Math.random().toString(36).slice(2);
	store.createFetcherStore(query.replace(/\}\s*$/, ', "_load": $load }'), { load }).subscribe((state) => {
		if (state.error) onError(state.error);
		else if (state.data) { debug.updates = Number(debug.updates) + 1; debug.perspective = state.perspective ?? debug.perspective; onData(state.data); }
	});

	/* The site routes with the History API (design/site/app.js): it fires "dh:navigate" after its own pushState, and
	   draws the page again on "dh:route" (a navigation asked by the Studio's address bar) and on popstate. */
	enableVisualEditing({
		history: {
			subscribe: (navigate) => {
				const on = () => navigate({ type: 'push', url: location.href });
				addEventListener('popstate', on);
				addEventListener('dh:navigate', on);
				return () => { removeEventListener('popstate', on); removeEventListener('dh:navigate', on); };
			},
			update: (u) => {
				if (u.type === 'pop') { history.back(); return; }
				const url = new URL(u.url.replace(/%23/g, '#'), location.href);
				if (url.origin !== location.origin) return;
				if (url.href === location.href) return;
				if (u.type === 'push') history.pushState(null, '', url);
				else history.replaceState(null, '', url);
				dispatchEvent(new Event('dh:route'));
			},
		},
		/* Edits arrive through live mode; only the Studio's refresh button reloads the page. */
		refresh: (payload) => (payload.source === 'manual' ? false : Promise.resolve()),
	});
}
