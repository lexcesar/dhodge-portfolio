/* Motion layer: inertial scroll, scroll reveals, the award marquee and the adaptive cursor.
   Everything here is skipped under prefers-reduced-motion; the page works without it. */
(() => {
	const root = document.documentElement;
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
	const easeInOut = (p) => (p < 0.5 ? 8 * p ** 4 : 1 - (-2 * p + 2) ** 4 / 2);
	if (!reduced) root.classList.add('has-motion');

	/* ---------- inertial scroll ---------- */
	const scroller = (() => {
		const offset = () => parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
		const yOf = (el) => el.getBoundingClientRect().top + scrollY - offset();
		const native = (el) => el && window.scrollTo({ top: yOf(el), behavior: reduced ? 'auto' : 'smooth' });
		if (reduced || !finePointer) return { to: native, velocity: () => 0 };

		root.classList.add('has-smooth');
		let target = scrollY;
		let cur = scrollY;
		let raf = 0;
		let tween = null;
		let vel = 0;
		const max = () => root.scrollHeight - innerHeight;

		const frame = (now) => {
			const before = cur;
			if (tween) {
				const p = clamp((now - tween.t0) / tween.d, 0, 1);
				cur = tween.from + (tween.to - tween.from) * easeInOut(p);
				target = cur;
				if (p === 1) tween = null;
			} else {
				cur += (target - cur) * 0.1;
				if (Math.abs(target - cur) < 0.5) cur = target;
			}
			if (document.querySelector('dialog[open]')) { stop(); return; }
			vel = cur - before;
			window.scrollTo(0, cur);
			raf = tween || cur !== target ? requestAnimationFrame(frame) : 0;
			if (!raf) vel = 0;
		};
		const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
		const stop = () => { cancelAnimationFrame(raf); raf = 0; tween = null; target = cur = scrollY; vel = 0; };

		window.addEventListener('wheel', (e) => {
			if (e.ctrlKey || document.querySelector('dialog[open]')) return;
			if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
			e.preventDefault();
			if (!raf) target = cur = scrollY;
			tween = null;
			const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1;
			target = clamp(target + e.deltaY * unit, 0, max());
			start();
		}, { passive: false });
		/* Keyboard, scrollbar, find-in-page: hand control back to the browser. */
		const MODIFIERS = ['Shift', 'Alt', 'Control', 'Meta', 'CapsLock'];
		window.addEventListener('keydown', (e) => { if (raf && !e.metaKey && !MODIFIERS.includes(e.key)) stop(); });
		window.addEventListener('pointerdown', (e) => { if (raf && e.clientX > root.clientWidth) stop(); });
		window.addEventListener('scroll', () => { if (!raf) { target = cur = scrollY; } }, { passive: true });

		return {
			to(el) {
				if (!el) return;
				if (!raf) target = cur = scrollY;
				const to = clamp(yOf(el), 0, max());
				const d = clamp(500 + Math.abs(to - cur) * 0.18, 700, 1500);
				tween = { from: cur, to, t0: performance.now(), d };
				start();
			},
			velocity: () => vel,
		};
	})();

	/* In-page links glide instead of jumping, and move focus for keyboard users. */
	document.addEventListener('click', (e) => {
		const a = e.target.closest('a[href^="#"]');
		if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
		const el = document.getElementById(decodeURIComponent(a.hash.slice(1)));
		if (!el) return;
		e.preventDefault();
		scroller.to(el);
		history.replaceState(null, '', a.hash);
		if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
		el.focus({ preventScroll: true });
	});

	/* ---------- scroll reveals ---------- */
	const io = 'IntersectionObserver' in window && !reduced
		? new IntersectionObserver((entries) => entries.forEach((en) => {
			if (!en.isIntersecting) return;
			en.target.classList.add('is-in');
			io.unobserve(en.target);
		}), { rootMargin: '0px 0px -10% 0px', threshold: 0.12 })
		: null;
	const observe = () => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => {
		if (io) io.observe(el); else el.classList.add('is-in');
	});
	/* After a language switch the new nodes appear already revealed (the cross-fade is the motion). */
	const revealAll = () => document.querySelectorAll('[data-reveal]').forEach((el) => {
		const r = el.getBoundingClientRect();
		if (r.top < innerHeight * 1.2) { el.classList.add('is-in'); io?.unobserve(el); }
	});

	/* ---------- award marquee: drifts on its own, speeds up and leans with scroll ---------- */
	const marquee = document.querySelector('[data-marquee]');
	if (marquee && !reduced) {
		let x = 0;
		let lean = 0;
		let visible = false;
		new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(marquee);
		const tick = () => {
			if (visible) {
				const v = scroller.velocity() || 0;
				const run = marquee.firstElementChild.offsetWidth || 1;
				x = (x - 0.6 - Math.abs(v) * 0.35) % run;
				lean += (clamp(v * -0.6, -12, 12) - lean) * 0.12;
				marquee.style.setProperty('--marquee-x', `${x}px`);
				marquee.style.setProperty('--marquee-lean', `${lean.toFixed(2)}deg`);
			}
			requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	}

	/* ---------- cursor ---------- */
	const cursor = document.querySelector('[data-cursor-el]');
	if (cursor && finePointer && !reduced && cursor.showPopover) {
		const label = cursor.querySelector('[data-cursor-label]');
		const { t } = window.I18N;
		const SHAPE = 'a, button, [role="button"], label, summary';
		const pos = { x: innerWidth / 2, y: innerHeight / 2 };
		const at = { x: pos.x, y: pos.y };
		let hot = null;
		let mode = 'dot';

		cursor.showPopover();
		root.classList.add('has-cursor');
		/* A modal dialog enters the top layer above us: re-enter on top of it. */
		const restack = () => { cursor.hidePopover(); cursor.showPopover(); };
		document.querySelectorAll('dialog').forEach((d) => new MutationObserver(restack).observe(d, { attributes: true, attributeFilter: ['open'] }));

		const release = () => {
			if (hot && mode === 'shape') hot.style.translate = '';
			hot = null;
		};
		const setMode = (next, el) => {
			if (el === hot && next === mode) return;
			release();
			hot = el;
			mode = next;
			cursor.dataset.mode = next;
			if (next === 'shape') {
				const cs = getComputedStyle(el);
				const r = el.getBoundingClientRect();
				const inline = cs.display.startsWith('inline') && !el.classList.contains('button');
				const pad = inline ? 8 : 4;
				const radius = parseFloat(cs.borderTopLeftRadius) || 0;
				cursor.style.setProperty('--cursor-w', `${r.width + pad * 2}px`);
				cursor.style.setProperty('--cursor-h', `${r.height + pad * 2}px`);
				cursor.style.setProperty('--cursor-radius', `${Math.min(radius + pad, (r.height + pad * 2) / 2)}px`);
				cursor.style.setProperty('--cursor-accent', cs.getPropertyValue('--link-hover-accent').trim());
			} else {
				const cs = el && getComputedStyle(el);
				cursor.style.setProperty('--tint-cursor', cs?.getPropertyValue('--tint') || '');
				cursor.style.setProperty('--cursor-ink', next === 'enter' ? cs.getPropertyValue('--on-tint') : '');
				if (next !== 'enter') { cursor.style.removeProperty('--tint-cursor'); cursor.style.removeProperty('--cursor-ink'); }
				cursor.style.removeProperty('--cursor-w');
				cursor.style.removeProperty('--cursor-h');
				cursor.style.removeProperty('--cursor-radius');
			}
			label.textContent = next === 'dot' || next === 'shape' ? '' : t(`cursor.${next}`);
		};

		window.addEventListener('pointermove', (e) => {
			pos.x = e.clientX;
			pos.y = e.clientY;
			cursor.classList.add('is-visible');
		}, { passive: true });
		/* Leaving the window: hide, and let go of any magnetized control. */
		const away = () => { cursor.classList.remove('is-visible', 'is-down'); setMode('dot', null); };
		root.addEventListener('mouseleave', away);
		window.addEventListener('blur', away);
		window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
		window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
		window.addEventListener('pointercancel', () => cursor.classList.remove('is-down'));
		document.addEventListener('pointerover', (e) => {
			const tagged = e.target.closest('[data-cursor]');
			if (tagged) return setMode(tagged.dataset.cursor, tagged);
			const el = e.target.closest(SHAPE);
			if (el && !el.disabled) return setMode('shape', el);
			setMode('dot', null);
		});
		/* Content re-rendered under the pointer (language switch): drop stale targets. */
		window.addEventListener('scroll', () => { if (hot && !hot.isConnected) setMode('dot', null); }, { passive: true });

		const tick = () => {
			let tx = pos.x;
			let ty = pos.y;
			if (hot && !hot.isConnected) setMode('dot', null); /* re-rendered under the pointer */
			if (mode === 'shape' && hot?.isConnected) {
				/* Snap to the control, with a little magnetic pull toward the pointer. */
				hot.style.translate = '';
				const r = hot.getBoundingClientRect();
				const cx = r.left + r.width / 2;
				const cy = r.top + r.height / 2;
				const dx = clamp((pos.x - cx) * 0.18, -10, 10);
				const dy = clamp((pos.y - cy) * 0.25, -6, 6);
				hot.style.translate = `${dx}px ${dy}px`;
				tx = cx + dx * 1.4;
				ty = cy + dy * 1.4;
				if (pos.x < r.left - 24 || pos.x > r.right + 24 || pos.y < r.top - 24 || pos.y > r.bottom + 24) setMode('dot', null);
			}
			const k = mode === 'dot' ? 0.35 : 0.22;
			at.x += (tx - at.x) * k;
			at.y += (ty - at.y) * k;
			cursor.style.setProperty('--cursor-x', `${at.x.toFixed(1)}px`);
			cursor.style.setProperty('--cursor-y', `${at.y.toFixed(1)}px`);
			requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
		window.I18N.onChange(() => { if (mode !== 'dot' && mode !== 'shape') label.textContent = t(`cursor.${mode}`); });
	}

	window.Motion = { observe, revealAll, scrollTo: (el) => scroller.to(el) };
})();
