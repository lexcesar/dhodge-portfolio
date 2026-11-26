/* Phone and tablet menu (<=1023px): a pencil test.
   Opening: the four category inks flip down like pages, the stage sheet lands on them, and each category band
   rises with squash and stretch while its art runs through the first project's images (a pencil test).
   Closing lifts the sheet back up.
   Every animation is WAAPI with fill "both", so a tap mid-way reverses from where it is: no jump.
   Choosing a category: the word stretches (anticipation), then a view transition lifts the menu while the word
   flies into the category title and the art into the first project's cover.
   Reduced motion: a plain fade, same content. Desktop (1024px and up) never sees any of it. */
(() => {
	const { I18N, DH, PROFILE, App } = window;
	const dlg = document.querySelector('[data-menu]');
	const trigger = document.querySelector('[data-menu-open]');
	if (!dlg || !trigger || !DH) return;
	const root = document.documentElement;
	const { t } = I18N;
	const { src, byCat, images, CATS } = DH;
	const $ = (s, r = dlg) => r.querySelector(s);
	const $$ = (s, r = dlg) => [...r.querySelectorAll(s)];
	const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
	const mqMenu = window.matchMedia('(max-width: 1023.98px)');
	const reduced = () => mqReduced.matches;
	const wait = (ms) => new Promise((r) => setTimeout(r, ms));

	const closeBtn = $('[data-menu-close]');
	const sheet = $('.menu__sheet');
	const inks = $$('.menu__ink');
	const scroller = $('[data-menu-scroll]');
	const bands = $$('[data-menu-cat], [data-menu-tile]');
	const foot = [$('.lang--menu')];

	/* ---------- content from the site's own data ---------- */
	/* Each category's art: the first project's images (up to four, padded with the next covers), then its cover. */
	const catArt = (key) => {
		const list = byCat[key] || [];
		const lead = list[0];
		if (!lead) return { final: '', frames: [] };
		let frames = images(lead).slice(1, 5).map((x) => x.img);
		if (frames.length < 3) frames = [...frames, ...list.slice(1).map((p) => p.cover)].slice(0, 4);
		return { final: src(lead.cover, 1200), frames: frames.map((n) => src(n, 1200)) };
	};
	const makeArt = () => ({
		...Object.fromEntries(CATS.map((k) => [k, catArt(k)])),
		about: { final: PROFILE.photos?.[0] ? src(PROFILE.photos[0].img, 1200) : '', portrait: true },
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

	/* Art is built lazily (idle time or the first touch on the button): the dialog is not rendered until
	   then, and the process frames are a few hundred KB. Frames that are not decoded in time are skipped. */
	/* Two steps: the finals (small, mostly already loaded by the page), then the process frames. Reduced motion
	   never flips, so it never fetches frames. */
	let built = false;
	let framed = false;
	const build = (withFrames = true) => {
		withFrames = withFrames && !reduced();
		if (built && (framed || !withFrames)) return;
		const first = !built;
		built = true;
		framed = withFrames;
		bands.forEach((a) => {
			const art = ART[a.dataset.menuCat || a.dataset.menuTile];
			if (!art) return;
			const box = $('[data-menu-art]', a);
			const img = (url, k) => {
				const el = document.createElement('img');
				el.alt = '';
				el.decoding = 'async';
				if (k !== undefined) el.dataset.frame = k;
				if (art.portrait) el.className = 'is-portrait';
				el.src = url;
				return el;
			};
			const frames = withFrames ? (art.frames || []).map((u, k) => img(u, k)).reverse() : [];
			/* final at the bottom, first frame on top */
			if (first) box.replaceChildren(...(art.final ? [img(art.final)] : []), ...frames);
			else box.append(...frames);
		});
	};
	const warm = () => build();
	trigger.addEventListener('pointerdown', warm, { once: true });
	trigger.addEventListener('focus', warm, { once: true });
	/* Data the user asked us to save: Save-Data, prefers-reduced-data, a 2G link. Safari exposes none of
	   these (iOS Low Data Mode is invisible to pages), so there the frames still load once the page is idle. */
	const thrifty = () => {
		const c = navigator.connection;
		return !!(c?.saveData || /(^|-)2g$/.test(c?.effectiveType || '') || window.matchMedia('(prefers-reduced-data: reduce)').matches);
	};
	/* After the page's own images. This script may run after the load event (cms.js injects it), so check. */
	const afterLoad = () => {
		if (!mqMenu.matches) return;
		const idle = () => build(!thrifty());
		if (window.requestIdleCallback) window.requestIdleCallback(idle, { timeout: 4000 });
		else setTimeout(idle, 3000);
	};
	if (document.readyState === 'complete') afterLoad();
	else window.addEventListener('load', afterLoad, { once: true });
	/* An edit in the Studio (visual editing): new art, counts and profile links; built art is rebuilt. */
	const refreshMenu = () => {
			ART = makeArt();
			counts();
			links();
			if (!built) return;
			const withFrames = framed;
			built = false;
			framed = false;
			build(withFrames);
	};

	/* iOS only paints :active when a touch listener exists */
	document.addEventListener('touchstart', () => {}, { passive: true });

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

	/* ---------- choreography ---------- */
	const EASE = {
		sheet: 'cubic-bezier(.76, 0, .24, 1)', /* the page flip: slow start, quick middle, soft landing */
		out: 'cubic-bezier(.23, 1, .32, 1)', /* the site's ease-out-quint */
		image: 'cubic-bezier(.2, .7, .2, 1)', /* the site's image ease */
		spring: 'cubic-bezier(.33, .9, .3, 1)',
		pop: 'cubic-bezier(.34, 1.56, .64, 1)',
		exit: 'cubic-bezier(.4, 0, 1, 1)',
	};
	const T = { ink: 500, inkStagger: 45, sheetDelay: 130, sheet: 560, item0: 260, itemStagger: 65, frame: 125 };
	const FLAT = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';
	const FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
	/* leading edge tilts: the right side (where the button is) leads on the way down, lags on the way up */
	const DROP = [{ clipPath: FLAT }, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 64%, 0% 44%)', offset: 0.55 }, { clipPath: FULL }];
	const LIFT = [{ clipPath: FULL }, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 0% 32%)', offset: 0.5 }, { clipPath: FLAT }];
	const mirror = (kf) => kf.slice().reverse().map((k) => ('offset' in k ? { ...k, offset: 1 - k.offset } : k));
	const A = (el, kf, o) => el.animate(kf, { fill: 'both', ...o });

	/* The close button starts as the menu button and turns into an X (and back). */
	const strokeColors = () => {
		const cs = (el) => getComputedStyle(el).backgroundColor;
		return { from: $$('i', trigger).map(cs), to: $$('i', closeBtn).map(cs) };
	};
	/* Four strokes: the outer two cross into the X, the inner two fold away. */
	const ICON = () => {
		const c = strokeColors();
		const cross = (k, y, deg) => [
			{ transform: 'none', backgroundColor: c.from[k] },
			{ transform: `translateY(${y / 6}px) scaleX(.7)`, offset: 0.26 },
			{ transform: `translateY(${y}px) rotate(${deg * 53 / 45}deg)`, offset: 0.72 },
			{ transform: `translateY(${y}px) rotate(${deg}deg)`, backgroundColor: c.to[k] },
		];
		const fold = (k) => [{ transform: 'none', opacity: 1, backgroundColor: c.from[k] }, { transform: 'scaleX(.45)', opacity: 1, offset: 0.4 }, { transform: 'scaleX(0)', opacity: 0, backgroundColor: c.to[k] }];
		return [cross(0, 6, 45), fold(1), fold(2), cross(3, -6, -45)];
	};
	const iconAnims = (dir, delay = 0) => {
		const strokes = $$('i', closeBtn);
		const [menu, close] = $$('.menu-button__label > span', closeBtn);
		const kfs = ICON();
		const list = strokes.map((el, k) => A(el, dir > 0 ? kfs[k] : mirror(kfs[k]), { duration: k === 1 || k === 2 ? 300 : 540, delay, easing: 'linear' }));
		const roll = (el, a, b) => A(el, [{ transform: `translateY(${a})` }, { transform: `translateY(${b})` }], { duration: 420, delay: delay + (dir > 0 ? 80 : 0), easing: EASE.out });
		list.push(dir > 0 ? roll(menu, '0%', '-115%') : roll(menu, '-115%', '0%'));
		list.push(dir > 0 ? roll(close, '115%', '0%') : roll(close, '0%', '115%'));
		return list;
	};

	/* Pencil test: frame k of n is shown until (start + (k + 1) * T); the final sits underneath. */
	const flip = (a, start) => {
		const frames = $$('img[data-frame]', a).filter((img) => img.complete && img.naturalWidth > 0)
			.sort((x, y) => x.dataset.frame - y.dataset.frame);
		const end = start + frames.length * T.frame;
		return frames.map((img, k) => {
			const cut = (start + (k + 1) * T.frame) / end;
			return A(img, [{ opacity: 1 }, { opacity: 1, offset: cut }, { opacity: 0, offset: cut }, { opacity: 0 }], { duration: end, easing: 'linear' });
		});
	};

	const openChoreo = () => {
		const list = [];
		inks.forEach((ink, i) => list.push(A(ink, DROP, { duration: T.ink, delay: i * T.inkStagger, easing: EASE.sheet })));
		list.push(A(sheet, DROP, { duration: T.sheet, delay: T.sheetDelay, easing: EASE.sheet }));
		list.push(...iconAnims(1));
		bands.forEach((a, i) => {
			const at = T.item0 + i * T.itemStagger;
			list.push(A(a, [{ transform: 'translateY(2.75rem)', opacity: 0 }, { opacity: 1, offset: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 820, delay: at, easing: EASE.out }));
			list.push(A($('.menu__art', a), [{ transform: 'scale(1.22)' }, { transform: 'none' }], { duration: 950, delay: at, easing: EASE.image }));
			/* squash and stretch: stretched while it travels, squashed when it lands, settles (follow-through) */
			list.push(A($('.menu__name', a), [
				{ transform: 'translateY(110%) scale(.94, 1.32)', fontStretch: '50%' },
				{ transform: 'translateY(-7%) scale(1.05, .86)', fontStretch: '86%', offset: 0.52 },
				{ transform: 'translateY(1%) scale(.99, 1.04)', fontStretch: '67%', offset: 0.78 },
				{ transform: 'none', fontStretch: '70%' },
			], { duration: 780, delay: at + 50, easing: EASE.spring }));
			const forEl = $('.menu__for', a);
			if (forEl) list.push(A(forEl, [{ opacity: 0, transform: 'translateY(0.5rem)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: at + 150, easing: EASE.out }));
			const count = $('.menu__count', a);
			if (count) list.push(A(count, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'none' }], { duration: 460, delay: at + 420, easing: EASE.pop }));
			list.push(...flip(a, at + 110));
		});
		const after = T.item0 + bands.length * T.itemStagger;
		[...foot, ...$$('.menu__profiles li')].forEach((el, k) => {
			list.push(A(el, [{ opacity: 0, transform: 'translateY(1rem)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: after + k * 45, easing: EASE.out }));
		});
		return list;
	};

	const closeChoreo = () => {
		const list = [];
		list.push(A(scroller, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-1.25rem)' }], { duration: 240, easing: EASE.exit }));
		list.push(A(sheet, LIFT, { duration: 460, delay: 90, easing: EASE.sheet }));
		inks.slice().reverse().forEach((ink, i) => list.push(A(ink, LIFT, { duration: 440, delay: 150 + i * 45, easing: EASE.sheet })));
		list.push(...iconAnims(-1));
		return list;
	};

	const fade = (dir) => [A(dlg, dir > 0 ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], { duration: dir > 0 ? 200 : 160, easing: 'linear' })];

	/* ---------- state: closed -> opening -> open -> closing -> closed; any arrow can turn back ---------- */
	let state = 'closed';
	let anims = [];
	let seq = 0;
	let refocus = true;
	let byPointer = false;
	trigger.addEventListener('blur', () => delete trigger.dataset.quietFocus);
	trigger.addEventListener('keydown', () => delete trigger.dataset.quietFocus);
	let closedWaiters = [];
	const whenClosed = () => (state === 'closed' ? Promise.resolve() : new Promise((r) => closedWaiters.push(r)));
	const stopAll = () => { anims.forEach((a) => a.cancel()); anims = []; };
	const settle = (list) => {
		if (list !== anims) dir = 1;
		anims = list;
		const my = ++seq;
		return Promise.all(list.map((a) => a.finished)).then(() => my === seq, () => false);
	};
	/* Turn back from where everything is. Retracing takes as long as the way out took, so a late turn is
	   sped up to at most RETRACE ms (still continuous: same path, faster). Forward again at normal speed. */
	const RETRACE = 460;
	let dir = 1; /* direction of the current set: 1 as built, -1 once turned back */
	const reverseAll = () => {
		dir = -dir;
		const back = dir < 0;
		const left = Math.max(0, ...anims.map((a) => (back ? a.currentTime : a.effect.getComputedTiming().endTime - a.currentTime) || 0));
		const rate = back ? Math.max(1, left / RETRACE) : 1;
		anims.forEach((a) => { a.reverse(); if (rate !== 1 || !back) a.updatePlaybackRate(dir * rate); });
		return settle(anims);
	};

	/* A classic scrollbar (fine pointer, narrow window) disappears under overflow: hidden; keep its room. */
	const lock = () => {
		const gutter = window.innerWidth - root.clientWidth;
		if (gutter > 0) {
			root.style.paddingRight = `${gutter}px`;
			dlg.style.setProperty('--menu-gutter', `${gutter}px`);
		}
	};
	const unlock = () => { root.style.paddingRight = ''; dlg.style.removeProperty('--menu-gutter'); };

	const finishOpen = () => { stopAll(); state = 'open'; };
	const finishClose = () => {
		stopAll();
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

	/* Focus goes into the menu: onto the close button from a keyboard, onto the dialog itself from a
	   touch (no ring flashing on a finger tap; Tab then starts at the top of the menu). */
	const open = (e) => {
		const byKey = e && e.detail === 0;
		if (state === 'open' || state === 'opening') return;
		trigger.setAttribute('aria-expanded', 'true');
		if (state === 'closing') { /* turn back mid-close */
			state = 'opening';
			reverseAll().then((ok) => ok && finishOpen());
			return;
		}
		build();
		markCurrent();
		lock();
		root.classList.add('is-menu-open');
		scroller.scrollTop = 0;
		dlg.showModal();
		more();
		(byKey ? closeBtn : dlg).focus({ preventScroll: true });
		state = 'opening';
		settle(reduced() ? fade(1) : openChoreo()).then((ok) => ok && finishOpen());
	};

	const close = ({ focus = true, instant = false, pointer = false } = {}) => {
		if (state === 'closed' || state === 'closing') return;
		refocus = focus;
		byPointer = pointer;
		trigger.setAttribute('aria-expanded', 'false');
		if (instant) { finishClose(); return; }
		if (state === 'opening') { /* turn back mid-open: everything retraces its path from where it is */
			state = 'closing';
			reverseAll().then((ok) => ok && finishClose());
			return;
		}
		state = 'closing';
		stopAll();
		settle(reduced() ? fade(-1) : closeChoreo()).then((ok) => ok && finishClose());
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
	let navigating = false;
	const go = async (a) => {
		if (navigating || state === 'closed') return;
		const url = new URL(a.href, location.href);
		const same = url.pathname + url.search === location.pathname + location.search;
		const canMorph = !reduced() && typeof document.startViewTransition === 'function' && !same;

		if (!canMorph) {
			/* reduced motion, no view transitions, or the page already on screen: fade the menu, then go */
			navigating = true;
			close({ focus: false });
			await whenClosed();
			navigating = false;
			if (same) { window.Motion?.scrollTo(document.body); focusTitle(); return; }
			App.enter(url.href);
			focusTitle();
			return;
		}

		navigating = true;
		a.classList.add('is-chosen'); /* anticipation: the word stretches before it flies */
		await wait(170);
		/* closed (or the window grew past the menu) during the anticipation: stay put */
		if (state !== 'open' && state !== 'opening') {
			a.classList.remove('is-chosen');
			navigating = false;
			return;
		}
		const name = a.querySelector('[data-morph]');
		const art = a.dataset.menuCat ? a : null; /* the whole band: art, line and count travel together */
		const key = a.dataset.menuCat;
		const lead = key ? byCat[key]?.[0] : null;
		root.classList.add('is-menu-nav');
		if (name) name.style.viewTransitionName = 'menu-name';
		if (art && lead) art.style.viewTransitionName = 'menu-art';
		let title = null;
		let cover = null;

		const vt = document.startViewTransition(async () => {
			if (name) name.style.viewTransitionName = '';
			if (art) art.style.viewTransitionName = '';
			a.classList.remove('is-chosen');
			refocus = false;
			finishClose();
			App.enter(url.href);
			title = document.querySelector(key ? `#page-title [data-vt="cat-${key}"]` : '#page-title [data-vt="about"]');
			if (title) title.style.viewTransitionName = 'menu-name';
			cover = lead ? document.querySelector(`.lead__img[data-cover="${CSS.escape(lead.slug)}"]`) : null;
			if (cover) {
				const r = cover.getBoundingClientRect();
				if (r.top < window.innerHeight - 48 && r.bottom > 0) {
					/* the band's art is that same cover, already decoded: the page's picture starts from it */
					const from = $('[data-menu-art] img:not([data-frame])', a);
					if (from?.currentSrc) { cover.dataset.src = cover.getAttribute('src'); cover.dataset.srcset = cover.getAttribute('srcset') || ''; cover.removeAttribute('srcset'); cover.src = from.currentSrc; }
					cover.classList.remove('is-loading');
					cover.closest('[data-reveal]')?.classList.add('is-in');
					cover.style.viewTransitionName = 'menu-art';
					await Promise.race([cover.decode().catch(() => {}), wait(250)]);
				} else cover = null;
			}
		});
		const done = () => {
			root.classList.remove('is-menu-nav');
			if (title) title.style.viewTransitionName = '';
			if (cover) {
				cover.style.viewTransitionName = '';
				if (cover.dataset.src) { if (cover.dataset.srcset) cover.setAttribute('srcset', cover.dataset.srcset); cover.src = cover.dataset.src; delete cover.dataset.src; delete cover.dataset.srcset; }
			}
			navigating = false;
			focusTitle();
		};
		vt.ready.catch(() => {});
		vt.updateCallbackDone.catch(() => {});
		vt.finished.then(done, done);
	};

	$$('a[data-menu-link]').forEach((a) => a.addEventListener('click', (e) => {
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; /* new tab */
		e.preventDefault();
		go(a);
	}));

	window.Menu = { open, close, refresh: refreshMenu, get state() { return state; } };
})();
