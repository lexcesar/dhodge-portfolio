/* Phone and tablet menu (<=1023px). It fades in over the page (200 ms) and out again (160 ms); one band per
   category, each with its first project's cover, still. Choosing a band goes through the site's own router: the
   menu closes inside the page's cross-fade. Reduced motion: no fade. Desktop (1024px and up) never sees it. */
(() => {
	const { I18N, DH, PROFILE, App } = window;
	const dlg = document.querySelector('[data-menu]');
	const trigger = document.querySelector('[data-menu-open]');
	if (!dlg || !trigger || !DH) return;
	const root = document.documentElement;
	const { t } = I18N;
	const { src, byCat, CATS } = DH;
	const $ = (s, r = dlg) => r.querySelector(s);
	const $$ = (s, r = dlg) => [...r.querySelectorAll(s)];
	const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
	const mqMenu = window.matchMedia('(max-width: 1023.98px)');
	const reduced = () => mqReduced.matches;
	const FADE = { in: 200, out: 160 };

	const closeBtn = $('[data-menu-close]');
	const scroller = $('[data-menu-scroll]');
	const bands = $$('[data-menu-cat], [data-menu-tile]');

	/* ---------- content from the site's own data ---------- */
	/* Each band shows its category's first cover (About: the first photo). */
	const makeArt = () => ({
		...Object.fromEntries(CATS.map((k) => [k, { url: byCat[k]?.[0] ? src(byCat[k][0].cover, 1200) : '' }])),
		about: { url: PROFILE.photos?.[0] ? src(PROFILE.photos[0].img, 1200) : '', portrait: true },
	});
	let ART = makeArt();

	const counts = () => $$('[data-menu-count]').forEach((el) => {
		const n = byCat[el.dataset.menuCount]?.length || 0;
		el.innerHTML = `<span aria-hidden="true">${n}</span><span class="sr-only">, ${t('projects', n)}</span>`;
	});
	/* Links and labels follow the language (the address keeps ?lang= when the visitor picked one). */
	const links = () => {
		$$('[data-menu-cat]').forEach((a) => { a.href = DH.href({ category: a.dataset.menuCat }); });
		$$('[data-menu-tile="about"]').forEach((a) => { a.href = DH.href({ page: 'about' }); });
		$$('[data-menu-home]').forEach((a) => { a.href = DH.href(); });
	};
	counts();
	links();
	I18N.onChange(() => { counts(); links(); });

	/* The covers load once: after the page's own images (idle time), or at the first touch on the button. */
	let built = false;
	const build = () => {
		if (built) return;
		built = true;
		bands.forEach((a) => {
			const art = ART[a.dataset.menuCat || a.dataset.menuTile];
			const box = $('[data-menu-art]', a);
			if (!art?.url || !box) { box?.replaceChildren(); return; }
			const img = document.createElement('img');
			img.alt = '';
			img.decoding = 'async';
			if (art.portrait) img.className = 'is-portrait';
			img.src = art.url;
			DH.fadeIn(img);
			box.replaceChildren(img);
		});
	};
	trigger.addEventListener('pointerdown', build, { once: true });
	trigger.addEventListener('focus', build, { once: true });
	/* Data the visitor asked us to save (Save-Data, prefers-reduced-data, a 2G link): only at the first touch. */
	const thrifty = () => {
		const c = navigator.connection;
		return !!(c?.saveData || /(^|-)2g$/.test(c?.effectiveType || '') || window.matchMedia('(prefers-reduced-data: reduce)').matches);
	};
	/* This script may run after the load event (cms.js injects it), so check. */
	const afterLoad = () => {
		if (!mqMenu.matches || thrifty()) return;
		if (window.requestIdleCallback) window.requestIdleCallback(build, { timeout: 4000 });
		else setTimeout(build, 3000);
	};
	if (document.readyState === 'complete') afterLoad();
	else window.addEventListener('load', afterLoad, { once: true });
	/* An edit in the Studio (visual editing): new covers, counts and links. */
	const refreshMenu = () => {
		ART = makeArt();
		counts();
		links();
		if (!built) return;
		built = false;
		build();
	};

	/* iOS only paints :active when a touch listener exists */
	document.addEventListener('touchstart', () => {}, { passive: true });

	/* When the bands do not fit (landscape), the bottom edge fades to say there is more. */
	const more = () => scroller.classList.toggle('has-more', scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 2);
	scroller.addEventListener('scroll', more, { passive: true });
	window.addEventListener('resize', () => { if (state !== 'closed') more(); });

	/* ---------- where am I: the category (or About) of the view on screen ---------- */
	const markCurrent = () => {
		const r = App?.route || {};
		const cat = r.name === 'category' ? r.key : r.name === 'project' ? DH.bySlug[r.slug]?.category : null;
		$$('[aria-current]').forEach((a) => a.removeAttribute('aria-current'));
		if (cat) $(`[data-menu-cat="${cat}"]`)?.setAttribute('aria-current', r.name === 'category' ? 'page' : 'true');
		if (r.name === 'about') $('[data-menu-tile="about"]')?.setAttribute('aria-current', 'page');
	};

	/* ---------- the fade: from wherever the opacity is, so a change of mind never jumps ---------- */
	let fadeAnim = null;
	const fadeTo = (to, ms) => {
		const from = fadeAnim ? +getComputedStyle(dlg).opacity : 1 - to;
		fadeAnim?.cancel();
		const a = dlg.animate([{ opacity: from }, { opacity: to }], { duration: reduced() ? 0 : ms, easing: 'ease-out', fill: 'both' });
		fadeAnim = a;
		return a.finished.then(() => fadeAnim === a, () => false);
	};
	const clearFade = () => { fadeAnim?.cancel(); fadeAnim = null; };

	/* ---------- state: closed -> opening -> open -> closing -> closed ---------- */
	let state = 'closed';
	let refocus = true;
	let byPointer = false;
	trigger.addEventListener('blur', () => delete trigger.dataset.quietFocus);
	trigger.addEventListener('keydown', () => delete trigger.dataset.quietFocus);
	let closedWaiters = [];
	const whenClosed = () => (state === 'closed' ? Promise.resolve() : new Promise((r) => closedWaiters.push(r)));

	/* A classic scrollbar (fine pointer, narrow window) disappears under overflow: hidden; keep its room. */
	const lock = () => {
		const gutter = window.innerWidth - root.clientWidth;
		if (gutter > 0) {
			root.style.paddingRight = `${gutter}px`;
			dlg.style.setProperty('--menu-gutter', `${gutter}px`);
		}
	};
	const unlock = () => { root.style.paddingRight = ''; dlg.style.removeProperty('--menu-gutter'); };

	const finishClose = () => {
		clearFade();
		state = 'closed';
		root.classList.remove('is-menu-open');
		trigger.setAttribute('aria-expanded', 'false');
		if (dlg.open) dlg.close();
		unlock();
		if (refocus) {
			/* focus always returns; the ring only shows if the menu was closed from a keyboard */
			if (byPointer) trigger.dataset.quietFocus = '';
			trigger.focus({ preventScroll: true });
		}
		closedWaiters.forEach((r) => r());
		closedWaiters = [];
	};

	/* Focus goes into the menu: onto the close button from a keyboard, onto the dialog itself from a touch (no
	   ring flashing on a finger tap; Tab then starts at the top of the menu). */
	const open = (e) => {
		if (state === 'open' || state === 'opening') return;
		const byKey = e && e.detail === 0;
		trigger.setAttribute('aria-expanded', 'true');
		if (state === 'closed') {
			build();
			markCurrent();
			lock();
			root.classList.add('is-menu-open');
			scroller.scrollTop = 0;
			dlg.showModal();
			more();
		}
		(byKey ? closeBtn : dlg).focus({ preventScroll: true });
		state = 'opening';
		fadeTo(1, FADE.in).then((ok) => { if (ok && state === 'opening') { clearFade(); state = 'open'; } });
	};

	const close = ({ focus = true, instant = false, pointer = false } = {}) => {
		if (state === 'closed') return;
		refocus = focus;
		byPointer = pointer;
		trigger.setAttribute('aria-expanded', 'false');
		if (instant) { finishClose(); return; }
		if (state === 'closing') return;
		state = 'closing';
		fadeTo(0, FADE.out).then((ok) => { if (ok && state === 'closing') finishClose(); });
	};

	/* The trigger and the close button sit on the same pixel: an impatient double tap would open and close
	   (or close and reopen). A second tap within DOUBLE ms is ignored; keys are never ignored. */
	const DOUBLE = 350;
	let lastTap = -Infinity;
	const tap = (e, fn) => {
		if (e.detail > 0) {
			const now = performance.now();
			if (now - lastTap < DOUBLE) return;
			lastTap = now;
		}
		fn();
	};
	trigger.addEventListener('click', (e) => tap(e, () => open(e)));
	closeBtn.addEventListener('click', (e) => tap(e, () => (state === 'closing' ? open(e) : close({ pointer: e.detail > 0 }))));
	dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
	/* closed by the browser without us (second Esc, etc.): sync */
	dlg.addEventListener('close', () => { if (state !== 'closed') { refocus = true; byPointer = false; finishClose(); } });
	mqMenu.addEventListener('change', () => { if (!mqMenu.matches) close({ instant: true, focus: false }); });

	/* Tab stays inside, and walks every link and button (Safari skips links by default; not here). */
	dlg.addEventListener('keydown', (e) => {
		if (e.key !== 'Tab') return;
		const list = $$('a[href], button:not([disabled])').filter((el) => el.getClientRects().length > 0);
		if (!list.length) return;
		e.preventDefault();
		const i = list.indexOf(document.activeElement);
		const next = i < 0 ? (e.shiftKey ? list.length - 1 : 0) : (i + (e.shiftKey ? -1 : 1) + list.length) % list.length;
		list[next].focus();
	});

	/* ---------- going somewhere ---------- */
	const focusTitle = () => document.getElementById('page-title')?.focus({ preventScroll: true });
	const go = async (a) => {
		if (state === 'closed') return;
		const url = new URL(a.href, location.href);
		if (url.pathname + url.search === location.pathname + location.search) {
			/* the page already on screen: the menu fades, the page goes back to its top */
			close({ focus: false });
			await whenClosed();
			window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
			focusTitle();
			return;
		}
		/* the router closes the menu inside the page's cross-fade and focuses the new title */
		App.navigate(url.href);
	};

	$$('a[data-menu-link]').forEach((a) => a.addEventListener('click', (e) => {
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; /* new tab */
		e.preventDefault();
		go(a);
	}));

	window.Menu = { open, close, refresh: refreshMenu, get state() { return state; } };
})();
