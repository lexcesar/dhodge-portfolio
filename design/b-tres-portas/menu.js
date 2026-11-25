/* Phone and tablet menu (<=1023px): a pencil test.
   Opening: the three door inks flip down like pages, the stage sheet lands on them, and each door band
   rises with squash and stretch while its art runs through its own process frames (thumbnail, line,
   values, color; the Tito alphabet for the books). Closing lifts the sheet back up.
   Every animation is WAAPI with fill "both", so a tap mid-way reverses from where it is: no jump.
   Choosing a section: the word stretches (anticipation), then a view transition lifts the menu while
   the word flies into the section title and the art into the feature image.
   Reduced motion: a plain fade, same content. Desktop (1024px and up) never sees any of it. */
(() => {
	const { I18N, DH, WORKS, PROFILE } = window;
	const dlg = document.querySelector('[data-menu]');
	const trigger = document.querySelector('[data-menu-open]');
	if (!dlg || !trigger || !DH) return;
	const root = document.documentElement;
	const { t } = I18N;
	const { src, byId, icon } = DH;
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
	const bands = $$('[data-menu-door], [data-menu-tile]');
	const foot = [$('.menu__contact'), $('.lang--menu')];

	/* ---------- content from the site's own data ---------- */
	const doorImg = (key) => document.querySelector(`.door[data-door="${key}"] .door__img`)?.getAttribute('src');
	const stepsOf = (w) => (w.steps || []).map(([, n]) => n).filter((n) => n !== w.img);
	const ART = {
		games: { final: doorImg('games') || src(byId.bear.img), frames: stepsOf(byId.bear).map(src) },
		animacao: { final: doorImg('animacao') || src(byId.robot.img), frames: stepsOf(byId.robot).map(src) },
		/* no process frames for Tito: the alphabet pages flip instead, one letter per page */
		livros: { final: doorImg('livros') || src(byId.tito.img), frames: WORKS.filter((w) => w.id.startsWith('abc-')).slice(0, 4).map((w) => src(w.img)) },
		sketchbook: { final: src((byId['sk-witch'] || WORKS.find((w) => w.section === 'sketchbook')).img) },
		sobre: { final: src(PROFILE.photos[0].img), portrait: true },
	};

	const counts = () => $$('[data-menu-count]').forEach((el) => {
		const n = WORKS.filter((w) => w.section === el.dataset.menuCount).length;
		el.innerHTML = `<span aria-hidden="true">${n}</span><span class="sr-only">, ${t('works', n)}</span>`;
	});
	$('[data-menu-profiles]').innerHTML = PROFILE.links
		.map(([label, href]) => `<li><a href="${href}" target="_blank" rel="noopener">${label}</a></li>`).join('');
	$('[data-menu-icon]').innerHTML = icon.next;
	counts();
	I18N.onChange(counts);

	/* Art is built lazily (idle time or the first touch on the button): the dialog is not rendered until
	   then, and the process frames are a few hundred KB. Frames that are not decoded in time are skipped. */
	let built = false;
	const build = () => {
		if (built) return;
		built = true;
		bands.forEach((a) => {
			const art = ART[a.dataset.menuDoor || a.dataset.menuTile];
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
			/* final at the bottom, first frame on top */
			box.replaceChildren(img(art.final), ...(art.frames || []).map((u, k) => img(u, k)).reverse());
		});
	};
	const warm = () => build();
	trigger.addEventListener('pointerdown', warm, { once: true });
	trigger.addEventListener('focus', warm, { once: true });
	window.addEventListener('load', () => {
		if (!mqMenu.matches || navigator.connection?.saveData) return;
		if (window.requestIdleCallback) window.requestIdleCallback(warm, { timeout: 4000 });
		else setTimeout(warm, 1500);
	});
	/* iOS only paints :active when a touch listener exists */
	document.addEventListener('touchstart', () => {}, { passive: true });

	const more = () => scroller.classList.toggle('has-more', scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 2);
	scroller.addEventListener('scroll', more, { passive: true });
	window.addEventListener('resize', () => { if (state !== 'closed') more(); });

	/* ---------- where am I: aria-current on the section under the reading line ---------- */
	const markCurrent = () => {
		const line = window.innerHeight * 0.4;
		let current = null;
		for (const a of $$('.menu__nav a[href^="#"], .menu__contact')) {
			const el = document.getElementById(a.hash.slice(1));
			const r = el?.getBoundingClientRect();
			if (r && r.top <= line && r.bottom > line) current = a;
		}
		$$('[aria-current]').forEach((a) => a.removeAttribute('aria-current'));
		current?.setAttribute('aria-current', 'location');
	};

	/* The feature images below each door title are lazy; start them while the menu is up so the art can
	   morph into a decoded picture. */
	const warmFeatures = () => document.querySelectorAll('.feature__img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });

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
	const ICON = () => {
		const c = strokeColors();
		return [
			[{ transform: 'none', backgroundColor: c.from[0] }, { transform: 'translateY(1px) scaleX(.7)', offset: 0.26 }, { transform: 'translateY(6px) rotate(53deg)', offset: 0.72 }, { transform: 'translateY(6px) rotate(45deg)', backgroundColor: c.to[0] }],
			[{ transform: 'none', opacity: 1, backgroundColor: c.from[1] }, { transform: 'scaleX(.45)', opacity: 1, offset: 0.4 }, { transform: 'scaleX(0)', opacity: 0, backgroundColor: c.to[1] }],
			[{ transform: 'none', backgroundColor: c.from[2] }, { transform: 'translateY(-1px) scaleX(.7)', offset: 0.26 }, { transform: 'translateY(-6px) rotate(-53deg)', offset: 0.72 }, { transform: 'translateY(-6px) rotate(-45deg)', backgroundColor: c.to[2] }],
		];
	};
	const iconAnims = (dir, delay = 0) => {
		const strokes = $$('i', closeBtn);
		const [menu, close] = $$('.menu-button__label > span', closeBtn);
		const kfs = ICON();
		const list = strokes.map((el, k) => A(el, dir > 0 ? kfs[k] : mirror(kfs[k]), { duration: k === 1 ? 300 : 540, delay, easing: 'linear' }));
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
		warmFeatures();
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

	trigger.addEventListener('click', open);
	closeBtn.addEventListener('click', (e) => (state === 'closing' ? open(e) : close({ pointer: e.detail > 0 })));
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
	const scrollPad = () => parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
	const land = (a, section, target) => {
		const anchor = target || section;
		const y = section.id === 'main' ? 0 : anchor.getBoundingClientRect().top + window.scrollY - scrollPad();
		root.style.scrollBehavior = 'auto';
		window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
		root.style.scrollBehavior = '';
		history.replaceState(null, '', a.hash);
		if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
		section.focus({ preventScroll: true });
	};

	let navigating = false;
	const go = async (a) => {
		const section = document.getElementById(a.hash.slice(1));
		if (!section || navigating || state === 'closed') return;
		const target = a.dataset.menuLink ? document.getElementById(a.dataset.menuLink) : null;
		const canMorph = !reduced() && typeof document.startViewTransition === 'function';

		if (!canMorph) {
			/* reduced motion (or no view transitions): fade the menu, then land */
			navigating = true;
			close({ focus: false });
			await whenClosed();
			navigating = false;
			if (reduced()) land(a, section, target);
			else { history.replaceState(null, '', a.hash); window.Motion?.scrollTo(target || section); section.focus?.({ preventScroll: true }); }
			return;
		}

		navigating = true;
		a.classList.add('is-chosen'); /* anticipation: the word stretches before it flies */
		await wait(170);
		const name = a.querySelector('[data-morph]');
		const art = a.dataset.menuDoor ? a : null; /* the whole band: art, line and count travel together */
		const feature = art ? section.querySelector('.feature') : null;
		const featureImg = feature?.querySelector('.feature__img');
		const artReady = featureImg && featureImg.complete && featureImg.naturalWidth > 0;
		root.classList.add('is-menu-nav');
		if (name) name.style.viewTransitionName = 'menu-name';
		if (art && artReady) art.style.viewTransitionName = 'menu-art';

		const vt = document.startViewTransition(() => {
			if (name) name.style.viewTransitionName = '';
			if (art) art.style.viewTransitionName = '';
			a.classList.remove('is-chosen');
			refocus = false;
			finishClose();
			if (target) {
				target.classList.add('is-menu-target', 'is-in');
				if (name) target.style.viewTransitionName = 'menu-name';
			}
			if (artReady) {
				feature.classList.add('is-menu-target', 'is-in');
				featureImg.classList.remove('is-loading');
			}
			land(a, section, target);
			if (artReady) {
				const r = featureImg.getBoundingClientRect();
				if (r.top < window.innerHeight - 48 && r.bottom > 0) featureImg.style.viewTransitionName = 'menu-art';
			}
		});
		const done = () => {
			root.classList.remove('is-menu-nav');
			if (target) { target.style.viewTransitionName = ''; target.classList.remove('is-menu-target'); }
			if (featureImg) featureImg.style.viewTransitionName = '';
			feature?.classList.remove('is-menu-target');
			navigating = false;
		};
		vt.finished.then(done, done);
	};

	$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		e.preventDefault();
		go(a);
	}));

	window.Menu = { open, close, get state() { return state; } };
})();
