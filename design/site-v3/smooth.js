/* Smooth scroll, light (Alex, 27/11/2026: "um scroll suave… Judô: caminho suave"). The wheel moves a target and the
   page follows it with a short exponential ease: it answers on the same frame and only the landing is soft (about
   0.25 s to settle), never the long glide that was cut on 26/11. Frame-rate independent.
   Native scrolling stays for touch, for prefers-reduced-motion, for the keyboard (space, PageDown, arrows, Home/End),
   for the scrollbar and for find-in-page; the router calls Smooth.stop() before it places the page itself. */
(() => {
	const root = document.documentElement;
	const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
	const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
	const on = () => !mqReduced.matches && mqFine.matches;
	const TAU = 80; /* ms: time constant of the ease (63% of the way after 80 ms, 95% after 240 ms) */

	let target = scrollY;
	let cur = scrollY;
	let raf = 0;
	let last = 0;
	const max = () => Math.max(0, root.scrollHeight - innerHeight);
	const clamp = (v) => Math.min(max(), Math.max(0, v));

	const frame = (now) => {
		const dt = last ? Math.min(64, now - last) : 16;
		last = now;
		cur += (target - cur) * (1 - Math.exp(-dt / TAU));
		if (Math.abs(target - cur) < 0.5) cur = target;
		window.scrollTo(0, cur);
		raf = cur === target ? 0 : requestAnimationFrame(frame);
		if (!raf) last = 0;
	};
	const stop = () => {
		cancelAnimationFrame(raf);
		raf = 0;
		last = 0;
		target = cur = scrollY;
	};

	window.addEventListener('wheel', (e) => {
		if (!on() || e.ctrlKey || e.defaultPrevented) return; /* ctrl + wheel is the browser's zoom */
		if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
		e.preventDefault();
		if (!raf) target = cur = scrollY;
		const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1;
		target = clamp(target + e.deltaY * unit);
		if (!raf) raf = requestAnimationFrame(frame);
	}, { passive: false });

	/* The keyboard, the scrollbar and anything else that scrolls: the browser takes over at once. */
	const MODIFIERS = ['Shift', 'Alt', 'Control', 'Meta', 'CapsLock'];
	window.addEventListener('keydown', (e) => { if (raf && !MODIFIERS.includes(e.key)) stop(); });
	window.addEventListener('pointerdown', (e) => { if (raf && e.clientX >= root.clientWidth) stop(); });
	window.addEventListener('scroll', () => { if (!raf) target = cur = scrollY; }, { passive: true });
	window.addEventListener('resize', () => { target = clamp(target); });

	window.Smooth = { stop };
})();
