/* Shared helpers: image URLs, icons, view transitions, the project card and the image viewer (a project's images,
   one after the other; it fades in and out, and a frame change is a short cross-fade). */
(() => {
	const { t, L, esc } = window.I18N;
	const BASE = document.documentElement.dataset.img || '../assets/img/';
	/* Sanity images come from the CDN (WebP/AVIF where supported, never upscaled); snapshot names are local files.
	   Read live: cms.js replaces the map in place when the Studio sends an edit. */
	const IMG = () => window.DH_IMG || {};
	const src = (name, w = 1800) => (IMG()[name] ? `${IMG()[name].url}?w=${w}&fit=max&auto=format` : `${BASE}${name}.jpg`);
	const WIDTHS = [480, 800, 1200, 1800, 2400];
	/* srcset for CDN images, up to the file's own width (the CDN never upscales: no point asking). */
	const srcset = (name, max = 2400) => {
		if (!IMG()[name]) return '';
		const ws = WIDTHS.filter((w) => w <= max);
		return ws.map((w) => `${src(name, w)} ${w}w`).join(', ');
	};
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* Projects by slug and by category, in the order Daniel set in the Studio. Rebuilt in place on an edit. */
	const CATS = ['character-design', 'illustrations', 'childrens-books', 'personal-art'];
	const bySlug = Object.create(null); /* ?project=constructor must not find Object's own properties */
	const byCat = {};
	const reindex = () => {
		Object.keys(bySlug).forEach((k) => delete bySlug[k]);
		CATS.forEach((c) => { byCat[c] = []; });
		window.PROJECTS.forEach((p) => { bySlug[p.slug] = p; byCat[p.category]?.push(p); });
		onReindex();
	};
	let onReindex = () => {}; /* set by the viewer below */

	/* The images of a project, in reading order: the cover, then every image block. */
	const images = (p) => [
		{ img: p.cover, w: p.w, h: p.h, caption: p.coverCaption, alt: p.coverAlt, edit: p.edit, key: 'cover' },
		...p.blocks.filter((b) => b.type === 'image'),
	];
	/* Alt text: Daniel's own description when there is one, else "<title>, image n". */
	const altOf = (p, im, n) => L(im.alt) || (n === 0 ? L(p.title) : t('image.of', L(p.title), n + 1));
	/* Click-to-edit outline for an image, inside the Studio only. */
	const editAttr = (x) => (x?.edit ? ` data-sanity="${esc(x.edit)}"` : '');
	/* lang="" for a text Daniel wrote in only the other language (his Behance texts are in English). */
	const langAttr = (v) => (window.I18N.langOf(v) !== window.I18N.lang ? ` lang="${window.I18N.langOf(v) === 'en' ? 'en' : 'pt-BR'}"` : '');

	const icon = {
		close: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
		prev: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		next: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4.5L13 10l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		arrow: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 10h12.5M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		back: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16.5 10H4M9 5l-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		out: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4.5h8.5V13M15 5l-9.5 9.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		plus: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
		images: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="5.5" width="11" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6.5 3h10a1 1 0 0 1 1 1v9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
		pause: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
		play: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4.5v11l8.5-5.5z" fill="currentColor"/></svg>',
	};

	/* View Transitions when available and motion is allowed. */
	const transition = (fn) => {
		if (reduced || !document.startViewTransition) { fn(); return Promise.resolve(); }
		const vt = document.startViewTransition(fn);
		/* a newer transition skips this one: every promise of it rejects, and none should reach the console */
		vt.ready.catch(() => {});
		vt.updateCallbackDone.catch(() => {});
		return vt.finished.catch(() => {});
	};

	/* Images fade in once decoded. */
	const fadeIn = (img) => {
		img.classList.add('is-loading');
		const done = () => img.classList.remove('is-loading');
		if (img.complete && img.naturalWidth) done();
		else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
	};
	const preload = (name, w = 1800) => { const i = new Image(); i.src = src(name, w); return i; };

	/* The URL of a route, keeping the language the visitor picked (when it is in the address). */
	const href = (params = {}) => {
		const url = new URL(location.pathname, location.origin);
		Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v));
		const lang = new URLSearchParams(location.search).get('lang');
		if (lang) url.searchParams.set('lang', lang);
		return url.pathname + url.search;
	};

	/* Project card on a category page: the cover, whole (no cropping), and a caption. */
	const card = (p, k = 0) => {
		const el = document.createElement('figure');
		el.className = 'card';
		el.style.setProperty('--r', (p.w / p.h).toFixed(3));
		const name = esc(L(p.title));
		const n = images(p).length;
		el.innerHTML = `
			<a class="card__open" href="${href({ project: p.slug })}" data-route aria-label="${t('open', name)}">
				<img class="card__img" src="${src(p.cover, 1200)}" srcset="${srcset(p.cover, 1800)}" sizes="(max-width: 599px) 92vw, (max-width: 1023px) 46vw, 32vw"${editAttr(p)} data-cover="${esc(p.slug)}" alt="" width="${p.w}" height="${p.h}" loading="lazy" decoding="async">
			</a>
			<figcaption class="card__caption">
				<span class="card__title">${name}</span>
				${p.year ? `<span class="card__meta">${esc(p.year)}</span>` : ''}
				${n > 1 ? `<span class="card__meta card__count">${icon.images}${t('images', n)}</span>` : ''}
				${p.fan ? `<span class="badge">${t('fan.badge', esc(p.fan))}</span>` : ''}
			</figcaption>`;
		fadeIn(el.querySelector('img'));
		return el;
	};

	/* ---------- viewer: a project's images, full screen ---------- */
	const dlg = document.querySelector('.viewer');
	let current = null; /* the project */
	let index = 0;
	let loadToken = 0;
	const v = dlg && {
		title: dlg.querySelector('.viewer__title'),
		count: dlg.querySelector('.viewer__count'),
		img: dlg.querySelector('.viewer__img'),
		canvas: dlg.querySelector('.viewer__canvas'),
		caption: dlg.querySelector('.viewer__caption'),
		steps: dlg.querySelector('.viewer__steps'),
		progress: dlg.querySelector('.viewer__progress'),
		prev: dlg.querySelector('.viewer__prev'),
		next: dlg.querySelector('.viewer__next'),
	};
	const imgName = (el) => el?.dataset.img || '';

	const fill = () => {
		const list = images(current);
		v.title.textContent = L(current.title);
		v.steps.innerHTML = list.length > 1
			? list.map((x, k) => `<button type="button" class="viewer__step" data-step="${k}" aria-label="${esc(altOf(current, x, k))}">
				<img class="viewer__thumb" src="${src(x.img, 480)}" alt="" loading="lazy" decoding="async"></button>`).join('')
			: '';
		v.steps.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => go(+b.dataset.step)));
		v.steps.hidden = list.length < 2;
		v.progress.hidden = list.length < 2;
		v.prev.hidden = list.length < 2;
		v.next.hidden = list.length < 2;
	};
	const mark = () => {
		const list = images(current);
		const x = list[index];
		v.img.alt = altOf(current, x, index);
		v.img.dataset.img = x.img;
		v.count.textContent = list.length > 1 ? `${index + 1}/${list.length}` : '';
		v.caption.textContent = L(x.caption);
		v.caption.hidden = !L(x.caption);
		v.steps.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-current', k === index ? 'step' : 'false'));
		v.progress.style.setProperty('--progress', String((index + 1) / list.length));
		v.steps.querySelector('[aria-current="step"]')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
	};

	/* Frame change: a short cross-fade (the next image is already decoded); nothing slides or wipes. */
	const swap = (nextSrc) => {
		if (reduced) { v.img.src = nextSrc; return; }
		v.canvas.querySelectorAll('.viewer__ghost').forEach((g) => g.remove());
		const ghost = v.img.cloneNode();
		ghost.className = 'viewer__img viewer__ghost';
		ghost.removeAttribute('style');
		ghost.alt = '';
		ghost.setAttribute('aria-hidden', 'true');
		v.canvas.append(ghost);
		v.img.src = nextSrc;
		const out = ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-out', fill: 'forwards' });
		out.finished.then(() => ghost.remove(), () => ghost.remove());
	};

	const go = (i) => {
		if (i === index) return;
		const list = images(current);
		const token = ++loadToken;
		const next = preload(list[i].img);
		next.decode().catch(() => {}).then(() => {
			if (token !== loadToken || !dlg.open) return;
			index = i;
			swap(next.src);
			mark();
		});
	};
	const walk = (dir) => {
		const n = images(current).length;
		if (n < 2) return;
		go((index + dir + n) % n);
	};

	/* Open project p at image i. The dialog fades in (CSS); the clicked picture, already decoded, shows at once and
	   the full size replaces it when ready. from: the clicked image. */
	const openViewer = (p, i = 0, from = null) => {
		if (!dlg || !p) return;
		current = p;
		index = i;
		fill();
		mark();
		const name = images(p)[i].img;
		const token = ++loadToken;
		const ready = from && from.complete && from.naturalWidth > 0;
		v.img.src = ready ? (from.currentSrc || from.src) : src(name);
		if (!ready) fadeIn(v.img);
		dlg.showModal();
		if (ready) {
			const full = preload(name);
			full.decode().catch(() => {}).then(() => { if (token === loadToken && dlg.open && imgName(v.img) === name) v.img.src = full.src; });
		}
	};

	/* Close: the dialog fades out (CSS). */
	const closeViewer = () => {
		if (!dlg?.open) return;
		++loadToken;
		v.canvas.querySelectorAll('.viewer__ghost').forEach((g) => g.remove());
		dlg.close();
	};

	if (dlg) {
		dlg.querySelector('.viewer__close').innerHTML = icon.close;
		v.prev.innerHTML = icon.prev;
		v.next.innerHTML = icon.next;
		dlg.querySelector('.viewer__close').addEventListener('click', closeViewer);
		v.prev.addEventListener('click', () => walk(-1));
		v.next.addEventListener('click', () => walk(1));
		dlg.addEventListener('click', (e) => { if (e.target === dlg) closeViewer(); });
		dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeViewer(); });
		dlg.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowRight') { e.preventDefault(); walk(1); }
			if (e.key === 'ArrowLeft') { e.preventDefault(); walk(-1); }
		});
		/* swipe on touch screens */
		let x0 = null;
		v.canvas.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
		v.canvas.addEventListener('pointerup', (e) => {
			if (x0 === null) return;
			const dx = e.clientX - x0;
			x0 = null;
			if (Math.abs(dx) > 40) walk(dx < 0 ? 1 : -1);
		});
		window.I18N.onChange(() => { if (current && dlg.open) { fill(); mark(); } });
	}

	/* An open viewer follows an edit from the Studio: same project (new object), or closes if it is gone. */
	onReindex = () => {
		if (!dlg?.open || !current) return;
		const p = bySlug[current.slug];
		if (!p) { closeViewer(); return; }
		current = p;
		index = Math.min(index, images(p).length - 1);
		fill();
		mark();
		const want = src(images(p)[index].img);
		if (v.img.getAttribute('src') !== want) v.img.src = want;
	};
	reindex();

	window.DH = { CATS, src, srcset, bySlug, byCat, reindex, images, altOf, editAttr, langAttr, card, openViewer, closeViewer, fadeIn, preload, icon, transition, href, reduced };
})();
