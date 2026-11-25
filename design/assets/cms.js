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

	/* Image key = the CDN file name without extension (what DH.src and imgName work with). */
	const IMG = {};
	const key = (a) => {
		if (!a?.url) return null;
		const k = a.url.split('/').pop().replace(/\.\w+$/, '');
		IMG[k] = { url: a.url, orig: (a.orig || '').replace(/\.\w+$/, '') };
		return k;
	};
	/* Ids without the "work-" prefix the import gave them, so they match works.js (and the URLs stay short). */
	const id = (v) => (v || '').replace(/^work-/, '');
	const video = (url) => {
		const u = String(url || '');
		const yt = u.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
		if (yt) return ['youtube', yt[1]];
		const vm = u.match(/vimeo\.com\/(\d+)(?:\/([\da-f]+))?/); /* vimeo.com/123 or, unlisted, vimeo.com/123/abcdef */
		return vm ? ['vimeo', vm[2] ? `${vm[1]}:${vm[2]}` : vm[1]] : null;
	};
	/* Links from the Studio: https only (no javascript: or data: in an href). */
	const https = (url) => { try { const x = new URL(url); return x.protocol === 'https:' ? x.href : ''; } catch { return ''; } };

	const adapt = ({ works, sections, profile: p }) => {
		if (!works?.length || !p) throw new Error('cms: empty dataset');
		if (!(p.photos || []).length) throw new Error('cms: profile without photos');
		window.WORKS = works.filter((w) => w.img?.url).map((w) => ({
			id: id(w.id), title: w.title, year: w.year ?? '', section: w.section, kind: w.kind || '', fan: w.fan || null, source: https(w.source),
			img: key(w.img), w: w.img.w, h: w.img.h,
			steps: (w.steps || []).filter((s) => s?.img?.url).map((s) => [s.label, key(s.img)]),
		}));
		window.SECTIONS = Object.fromEntries((sections || []).map((s) => [s.key, { lead: s.lead, featured: s.featured ? id(s.featured) : null, related: (s.related || []).map(id) }]));
		const a = p.award || {};
		window.PROFILE = {
			name: p.name, bio: p.bio, tvAlso: p.tvAlso || '',
			timeline: (p.timeline || []).map((j) => [j.when, j.where, j.what]),
			links: (p.links || []).map((l) => [l.label, https(l.url)]).filter(([label, url]) => label && url),
			photos: (p.photos || []).map((ph) => ({ img: key(ph.img), alt: ph.alt, caption: ph.caption || '' })),
			tv: (p.tv || []).filter((v) => video(v.video)).map((v) => ({ ...v, video: video(v.video), still: key(v.still) })),
			award: { ...a, source: https(a.source), video: video(a.video), still: key(a.still), making: (a.making || []).filter((m) => video(m.video)).map((m) => [video(m.video), m.label, key(m.still)]) },
		};
		window.DH_IMG = IMG;
		/* Section leads are UI strings in i18n.js; the Studio owns them now. */
		const extra = { pt: {}, en: {} };
		Object.entries(window.SECTIONS).forEach(([k, s]) => {
			if (!s.lead?.pt) return;
			extra.pt[`${k}.lead`] = s.lead.pt;
			extra.en[`${k}.lead`] = s.lead.en || s.lead.pt;
		});
		window.I18N.extend(extra);
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

	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
	fetch(`${API}?query=${encodeURIComponent(QUERY)}`, { signal: ctrl.signal })
		.then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
		.then(({ result }) => { adapt(result); window.DH_CMS = 'sanity'; boot(); })
		.catch(fallback)
		.finally(() => clearTimeout(timer));
})();
