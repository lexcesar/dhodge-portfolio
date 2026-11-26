/* Motion, kept quiet (Alex, 26/11/2026: the drawings are the show). The browser's own scroll and the system cursor;
   no reveals, no parallax, no inertial scroll. The one help left: a link to a place on the same page (About's
   award) scrolls there smoothly, or at once under prefers-reduced-motion, and moves the focus for keyboard users. */
(() => {
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const offset = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
	const scrollTo = (el) => {
		if (!el) return;
		window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + scrollY - offset()), behavior: reduced ? 'auto' : 'smooth' });
	};

	document.addEventListener('click', (e) => {
		const a = e.target.closest('a[href^="#"]');
		if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
		const el = document.getElementById(decodeURIComponent(a.hash.slice(1)));
		if (!el) return;
		e.preventDefault();
		scrollTo(el);
		if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
		el.focus({ preventScroll: true });
	});

	window.Motion = { scrollTo };
})();
