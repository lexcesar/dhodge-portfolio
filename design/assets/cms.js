/* Content from Sanity (project arbdqygj, dataset production), read in the browser from the public API CDN, so an
   edit in the Studio shows up on the next page load, with no rebuild. The result becomes window.PROJECTS, window.HOME,
   window.PROFILE and window.DH_IMG (image key -> CDN url). While the dataset has no "project" documents yet (before the
   work -> project migration), or if the request fails or takes too long, the snapshot projects.js (written by the
   migration's dry run, same shape as the query) is used instead.
   This script then loads the runtime scripts listed in data-then, in order. */
(() => {
	const me = document.currentScript;
	const API = 'https://arbdqygj.apicdn.sanity.io/v2025-02-19/data/query/production';
	const TIMEOUT = 3000;
	const CATS = ['character-design', 'illustrations', 'childrens-books', 'personal-art'];
	const NETWORKS = [['linkedin', 'LinkedIn'], ['instagram', 'Instagram'], ['behance', 'Behance'], ['bluesky', 'Bluesky'], ['cara', 'Cara']];

	const img = '{ "url": url, "orig": originalFilename, "w": metadata.dimensions.width, "h": metadata.dimensions.height }';
	const QUERY = `{
		"projects": *[_type == "project" && defined(slug.current) && defined(category) && defined(title) && defined(cover.asset)] | order(orderRank) {
			"id": _id, title, "slug": slug.current, category, year, fan, source, intro,
			"cover": cover.asset->${img}, "coverAlt": cover.alt, "coverCaption": cover.caption,
			"blocks": blocks[]{ _key, _type, caption, text, "alt": image.alt, "img": image.asset->${img} }
		},
		"home": *[_id == "home"][0]{ roles, links, "logo": logo.asset->${img}, "hero": heroImage.asset->${img}, "heroAlt": heroImage.alt },
		"profile": *[_id == "profile"][0]{
			name, bio, tvAlso, timeline[]{ when, where, what },
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

	/* Image key: the CDN file name without extension (Sanity), or the local file name (snapshot). */
	let IMG = {}; /* a new map per result: the old one is the live window.DH_IMG, replaced in place by put() */
	const key = (a) => {
		if (!a) return null;
		if (a.name) return C(a.name);
		const url = C(a.url);
		if (!url) return null;
		const k = url.split('/').pop().replace(/\.\w+$/, '');
		IMG[k] = { url, orig: C(a.orig || '').replace(/\.\w+$/, '') };
		return k;
	};
	const video = (url) => {
		const u = String(C(url) || '');
		const yt = u.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
		if (yt) return ['youtube', yt[1]];
		const vm = u.match(/vimeo\.com\/(\d+)(?:\/([\da-f]+))?/); /* vimeo.com/123 or, unlisted, vimeo.com/123/abcdef */
		return vm ? ['vimeo', vm[2] ? `${vm[1]}:${vm[2]}` : vm[1]] : null;
	};
	/* Links from the Studio: https only (no javascript: or data: in an href). */
	const https = (url) => { try { const x = new URL(C(url)); return x.protocol === 'https:' ? x.href : ''; } catch { return ''; } };
	/* Localized text that is really empty (stega leaves invisible characters in an empty-looking value) counts as none. */
	const text = (v) => (v && (C(v.pt) || '').trim() + (C(v.en) || '').trim() ? v : null);
	/* click-to-edit only on documents that exist: never on the snapshot, whose ids are not in the dataset yet */
	let live = false;
	const attr = (id, type, path) => (P && live ? P.attr(id, type, path) : '');

	const adapt = ({ projects, home, profile: p }) => {
		if (!projects?.length || !home?.hero) throw new Error('cms: no projects in the dataset yet');
		IMG = {};
		const PROJECTS = projects.filter((x) => x?.cover && CATS.includes(C(x.category)) && C(x.slug)).map((x) => {
			const id = C(x.id);
			return {
				id, slug: C(x.slug), title: x.title, category: C(x.category), year: C(x.year) ?? '', fan: x.fan || '', source: https(x.source),
				intro: text(x.intro),
				cover: key(x.cover), w: x.cover.w, h: x.cover.h, coverAlt: text(x.coverAlt), coverCaption: text(x.coverCaption),
				edit: attr(id, 'project', 'cover'),
				blocks: (x.blocks || []).map((b) => {
					const type = C(b?._type);
					const k = C(b?._key);
					if (type === 'imageBlock' && b.img) {
						return { type: 'image', key: k, img: key(b.img), w: b.img.w, h: b.img.h, caption: text(b.caption), text: text(b.text), alt: text(b.alt),
							edit: attr(id, 'project', `blocks[_key=="${k}"].image`) };
					}
					if (type === 'textBlock' && text(b.text)) return { type: 'text', key: k, text: b.text };
					return null;
				}).filter(Boolean),
			};
		});
		const links = home.links || {};
		const HOME = {
			roles: text(home.roles),
			logo: key(home.logo), logoW: home.logo?.w, logoH: home.logo?.h, logoEdit: attr('home', 'home', 'logo'),
			hero: key(home.hero), heroW: home.hero.w, heroH: home.hero.h, heroAlt: text(home.heroAlt), heroEdit: attr('home', 'home', 'heroImage'),
			links: NETWORKS.map(([k, label]) => [label, https(links[k])]).filter(([, url]) => url),
		};
		const a = p?.award || {};
		const PROFILE = {
			name: C(p?.name) || 'Daniel Hodge', bio: p?.bio || '', tvAlso: p?.tvAlso || '',
			timeline: (p?.timeline || []).map((j) => [j.when, j.where, j.what]),
			photos: (p?.photos || []).filter((ph) => ph.img).map((ph) => ({ img: key(ph.img), alt: ph.alt, caption: ph.caption || '' })),
			tv: (p?.tv || []).filter((v) => video(v.video)).map((v) => ({ ...v, video: video(v.video), still: key(v.still) })),
			award: { ...a, source: https(a.source), video: video(a.video), still: key(a.still), making: (a.making || []).filter((m) => video(m.video)).map((m) => [video(m.video), m.label, key(m.still)]) },
		};
		/* In place: on a live update the runtime keeps the same objects it read at start. */
		put('PROJECTS', PROJECTS);
		put('HOME', HOME);
		put('PROFILE', PROFILE);
		put('DH_IMG', IMG);
	};

	const put = (name, value) => {
		const cur = window[name];
		if (cur === value) return;
		if (Array.isArray(cur)) cur.splice(0, cur.length, ...value);
		else if (cur && typeof cur === 'object') { Object.keys(cur).forEach((k) => delete cur[k]); Object.assign(cur, value); }
		else window[name] = value;
	};

	const add = (src) => new Promise((resolve, reject) => {
		const s = document.createElement('script');
		s.src = src;
		s.async = false; /* injected scripts run in insertion order */
		s.onload = resolve;
		s.onerror = reject;
		document.body.append(s);
	});
	let booted = false;
	const boot = () => {
		if (booted) return;
		booted = true;
		(me.dataset.then || '').split(/\s+/).filter(Boolean).forEach(add);
	};
	/* The snapshot: before the migration (no project in the dataset) or when Sanity does not answer. */
	const snapshot = (why, mode) => {
		if (booted) return Promise.resolve();
		console.info('cms: using projects.js', why?.message || why);
		const ready = window.DH_SNAPSHOT ? Promise.resolve() : add(me.dataset.snapshot);
		return ready.then(() => { live = false; adapt(window.DH_SNAPSHOT); window.DH_CMS = mode; boot(); })
			.catch((e) => {
				console.error('cms: no content', e);
				document.documentElement.classList.add('is-offline');
				const box = document.querySelector('.loading');
				if (box) box.textContent = window.I18N?.lang === 'en' ? 'The portfolio could not load. Please try again in a moment.' : 'O portfólio não carregou. Tente de novo daqui a pouco.';
			});
	};

	/* The page gets its height only after the content arrives: app.js restores the scroll, not the browser. */
	if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

	if (studioUrl) {
		/* Visual editing: first result boots the page; every later one (an edit in the Studio) re-renders it. */
		const css = document.createElement('link');
		css.rel = 'stylesheet';
		css.href = new URL('preview.css?v=6', me.src).href;
		document.head.append(css);
		let last = '';
		const timer = setTimeout(() => snapshot(new Error('preview: no data'), 'fallback'), TIMEOUT * 2);
		import(new URL('preview.js?v=6', me.src).href).then((mod) => {
			P = { clean: mod.clean, attr: mod.attrFor(studioUrl) };
			mod.start({
				query: QUERY,
				studioUrl,
				onData: (data) => {
					/* the Studio re-sends unchanged results (heartbeats, other documents): redraw only on a real change */
					const sig = JSON.stringify(data);
					if (sig === last) return;
					last = sig;
					live = true;
					try { adapt(data); } catch (e) {
						/* no project yet: the snapshot stands in (nothing on it is clickable until the migration runs) */
						clearTimeout(timer);
						if (!booted) snapshot(e, 'snapshot');
						return;
					}
					const first = !booted;
					window.DH_CMS = 'preview';
					clearTimeout(timer);
					if (first) { boot(); return; }
					window.DH?.reindex();
					window.DH_RERENDER?.();
				},
				onError: (e) => console.warn('cms preview:', e),
			});
		}).catch((e) => { clearTimeout(timer); snapshot(e, 'fallback'); });
		return;
	}

	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
	fetch(`${API}?query=${encodeURIComponent(QUERY)}`, { signal: ctrl.signal })
		.then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
		.then(({ result }) => {
			live = true;
			try { adapt(result); } catch (e) { return snapshot(e, 'snapshot'); }
			window.DH_CMS = 'sanity';
			boot();
		})
		.catch((e) => snapshot(e, 'fallback'))
		.finally(() => clearTimeout(timer));
})();
