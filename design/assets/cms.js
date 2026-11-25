/* Content from Sanity (project arbdqygj, dataset production), read in the browser from the public API CDN,
   so an edit in the Studio shows up on the next page load, with no rebuild. The result keeps the shapes the
   runtime already reads (window.WORKS, window.PROFILE) plus window.SECTIONS and window.DH_IMG. If the request
   fails or takes too long, works.js (the snapshot the dataset was imported from) is loaded instead.
   This script then loads the runtime scripts listed in data-then, in order. */
(() => {
	const me = document.currentScript;
	const API = 'https://arbdqygj.apicdn.sanity.io/v2025-02-19/data/query/production';
	const TIMEOUT = 3000;

	const img = '{ "url": url, "orig": originalFilename, "w": metadata.dimensions.width, "h": metadata.dimensions.height }';
	const QUERY = `{
		"works": *[_type == "work" && defined(image.asset->url) && defined(title.pt) && defined(section)] | order(orderRank) {
			"id": _id, title, year, section, kind, fan, source,
			"img": image.asset->${img},
			"steps": steps[defined(image.asset->url)]{ label, "img": image.asset->${img} }
		},
		"sections": *[_type == "section"]{ key, lead, "featured": featured._ref, "related": related[]._ref },
		"profile": *[_id == "profile"][0]{
			name, bio, tvAlso, timeline[]{ when, where, what }, links[]{ label, url },
			"photos": photos[defined(image.asset->url)]{ "img": image.asset->${img}, alt, caption },
			"tv": tv[]{ title, year, length, video, "still": still.asset->${img}, what, credit },
			award{ festival, year, work, workYear, prize, given, credits, about, video, source, "still": still.asset->${img},
				making[]{ label, video, "still": still.asset->${img} } }
		}
	}`;

	/* Inside the Studio's Presentation tool (an iframe opened by the Studio): load the visual editor, which also
	   brings drafts and live updates. Anywhere else, nothing of it is downloaded. */
	const STUDIO = /^(https:\/\/dhodge\.sanity\.studio|http:\/\/localhost:3333)(\/|$)/;
	const framed = window.top !== window.self;
	/* Presentation adds ?sanity-preview-perspective= to the URL it opens (and sends no referrer). Remembered for the
	   session, so a navigation inside the preview stays in preview. */
	const remembered = (() => { try { return sessionStorage.getItem('dh-studio'); } catch { return null; } })();
	const asked = new URLSearchParams(location.search).has('sanity-preview-perspective');
	const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
	const parent = location.ancestorOrigins?.[0];
	/* the hosted Studio can run inside the Sanity dashboard: any Sanity origin (or the local Studio) may be the parent */
	const SANITY = /^(https:\/\/([a-z0-9-]+\.)*sanity\.(studio|io)|http:\/\/localhost:3333)$/;
	const fromStudio = parent === undefined || SANITY.test(parent);
	const studioUrl = framed && fromStudio && (asked || remembered)
		? STUDIO.exec(parent || '')?.[1] || STUDIO.exec(document.referrer)?.[1] || remembered || (local || parent === 'http://localhost:3333' ? 'http://localhost:3333' : 'https://dhodge.sanity.studio')
		: null;
	if (studioUrl) try { sessionStorage.setItem('dh-studio', studioUrl); } catch { /* private mode */ }
	let P = null; /* the preview module, when loaded */
	const C = (v) => (P ? P.clean(v) : v); /* values used for logic, without stega */

	/* Image key = the CDN file name without extension (what DH.src and imgName work with). */
	let IMG = {}; /* a new map per result: the old one is the live window.DH_IMG, replaced in place by put() */
	const key = (a) => {
		const url = C(a?.url);
		if (!url) return null;
		const k = url.split('/').pop().replace(/\.\w+$/, '');
		IMG[k] = { url, orig: C(a.orig || '').replace(/\.\w+$/, '') };
		return k;
	};
	/* Ids without the "work-" prefix the import gave them, so they match works.js (and the URLs stay short). */
	const id = (v) => C(v || '').replace(/^work-/, '');
	const video = (url) => {
		const u = String(C(url) || '');
		const yt = u.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
		if (yt) return ['youtube', yt[1]];
		const vm = u.match(/vimeo\.com\/(\d+)(?:\/([\da-f]+))?/); /* vimeo.com/123 or, unlisted, vimeo.com/123/abcdef */
		return vm ? ['vimeo', vm[2] ? `${vm[1]}:${vm[2]}` : vm[1]] : null;
	};
	/* Links from the Studio: https only (no javascript: or data: in an href). */
	const https = (url) => { try { const x = new URL(C(url)); return x.protocol === 'https:' ? x.href : ''; } catch { return ''; } };

	const adapt = ({ works, sections, profile: p }) => {
		if (!works?.length || !p) throw new Error('cms: empty dataset');
		IMG = {};
		if (!(p.photos || []).length) throw new Error('cms: profile without photos');
		const WORKS = works.filter((w) => w.img?.url).map((w) => ({
			id: id(w.id), title: w.title, year: w.year ?? '', section: C(w.section),
			edit: P ? P.attr(C(w.id), 'work', 'image') : '', kind: w.kind || '', fan: w.fan || null, source: https(w.source),
			img: key(w.img), w: w.img.w, h: w.img.h,
			steps: (w.steps || []).filter((s) => s?.img?.url).map((s) => [s.label, key(s.img)]),
		}));
		const SECTIONS = Object.fromEntries((sections || []).map((s) => [C(s.key), { lead: s.lead, featured: s.featured ? id(s.featured) : null, related: (s.related || []).map(id) }]));
		const a = p.award || {};
		const PROFILE = {
			name: p.name, bio: p.bio, tvAlso: p.tvAlso || '',
			timeline: (p.timeline || []).map((j) => [j.when, j.where, j.what]),
			links: (p.links || []).map((l) => [l.label, https(l.url)]).filter(([label, url]) => label && url),
			photos: (p.photos || []).map((ph) => ({ img: key(ph.img), alt: ph.alt, caption: ph.caption || '' })),
			tv: (p.tv || []).filter((v) => video(v.video)).map((v) => ({ ...v, video: video(v.video), still: key(v.still) })),
			award: { ...a, source: https(a.source), video: video(a.video), still: key(a.still), making: (a.making || []).filter((m) => video(m.video)).map((m) => [video(m.video), m.label, key(m.still)]) },
		};
		/* In place: on a live update the runtime keeps the same objects it read at start. */
		put('WORKS', WORKS);
		put('SECTIONS', SECTIONS);
		put('PROFILE', PROFILE);
		put('DH_IMG', IMG);
		/* Section leads are UI strings in i18n.js; the Studio owns them now. */
		const extra = { pt: {}, en: {} };
		['games', 'animacao', 'livros', 'sketchbook'].forEach((k) => {
			const lead = SECTIONS[k]?.lead;
			/* null = back to the text in i18n.js (a lead cleared in the Studio) */
			extra.pt[`${k}.lead`] = lead?.pt || null;
			extra.en[`${k}.lead`] = lead?.pt ? lead.en || lead.pt : null;
		});
		window.I18N.extend(extra);
	};

	const put = (name, value) => {
		const cur = window[name];
		if (cur === value) return;
		if (Array.isArray(cur)) cur.splice(0, cur.length, ...value);
		else if (cur && typeof cur === 'object') { Object.keys(cur).forEach((k) => delete cur[k]); Object.assign(cur, value); }
		else window[name] = value;
	};

	const add = (src) => {
		const s = document.createElement('script');
		s.src = src;
		s.async = false; /* injected scripts run in insertion order */
		document.body.append(s);
		return s;
	};
	const boot = () => (me.dataset.then || '').split(/\s+/).filter(Boolean).forEach(add);
	const fallback = (why) => {
		console.warn('cms: using works.js', why);
		window.DH_CMS = 'fallback';
		add(me.dataset.fallback);
		boot();
	};

	/* The page gets its height only after the content arrives: main.js restores the scroll, not the browser. */
	if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
	window.addEventListener('pagehide', () => {
		try { sessionStorage.setItem(`dh-scroll:${location.pathname}${location.search}${location.hash}`, String(Math.round(window.scrollY))); } catch { /* private mode */ }
	});

	if (studioUrl) {
		/* Visual editing: first result boots the page; every later one (an edit in the Studio) re-renders it. */
		const css = document.createElement('link');
		css.rel = 'stylesheet';
		css.href = new URL('preview.css?v=2', me.src).href;
		document.head.append(css);
		let booted = false;
		let last = '';
		const timer = setTimeout(() => { if (!booted) { booted = true; fallback(new Error('preview: no data')); } }, TIMEOUT * 2);
		import(new URL('preview.js?v=2', me.src).href).then((mod) => {
			P = { clean: mod.clean, attr: mod.attrFor(studioUrl) };
			mod.start({
				query: QUERY,
				studioUrl,
				onData: (data) => {
					/* the Studio re-sends unchanged results (heartbeats, other documents): redraw only on a real change */
					if (window.DH_CMS === 'fallback') return;
					const sig = JSON.stringify(data);
					if (sig === last) return;
					last = sig;
					try { adapt(data); } catch (e) { console.warn('cms preview:', e); return; }
					window.DH_CMS = 'preview';
					if (!booted) { booted = true; clearTimeout(timer); boot(); return; }
					window.DH?.reindex();
					window.DH_RERENDER?.();
				},
				onError: (e) => console.warn('cms preview:', e),
			});
		}).catch((e) => { if (!booted) { booted = true; clearTimeout(timer); fallback(e); } });
		return;
	}

	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
	fetch(`${API}?query=${encodeURIComponent(QUERY)}`, { signal: ctrl.signal })
		.then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
		.then(({ result }) => { adapt(result); window.DH_CMS = 'sanity'; boot(); })
		.catch(fallback)
		.finally(() => clearTimeout(timer));
})();
