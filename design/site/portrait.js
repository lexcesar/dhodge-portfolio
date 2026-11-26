/* About portrait: three travel photos that swap with a bad-VHS glitch.
   Auto-advances while on screen (pausable); click for the next one.
   Under reduced motion: no auto-advance, plain cross-fade. */
(() => {
	const { PROFILE, I18N, DH } = window;
	const { t, L } = I18N;
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const $ = (s, r = document) => r.querySelector(s);
	const rand = (a, b) => a + Math.random() * (b - a);
	const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
	const GLYPHS = '▚▞░▒▓█▙▟#%&@*/\\<>_=+';
	const INTERVAL = 4200;
	const SLICES = 7;

	let fig, stack, imgs, chromaR, chromaC, slices, caption, count, toggle, seed;
	let index = 0;
	let busy = false;
	let paused = false;
	let visible = false;
	let timer = 0;

	/* read live: an edit in the Studio replaces the list (cms.js, visual editing) */
	const photos = () => PROFILE.photos;
	const srcOf = (k) => DH.src(photos()[k].img);

	const relabel = () => {
		if (!fig) return;
		imgs.forEach((img, k) => { img.alt = L(photos()[k].alt); });
		caption.textContent = L(photos()[index].caption);
		count.textContent = `${index + 1}/${photos().length}`;
		toggle.innerHTML = paused ? DH.icon.play : DH.icon.pause;
		toggle.setAttribute('aria-label', paused ? t('portrait.play') : t('portrait.pause'));
		toggle.setAttribute('aria-pressed', String(paused));
	};

	const setActive = (k) => {
		imgs.forEach((img, i) => img.classList.toggle('is-active', i === k));
		index = k;
	};

	/* Scramble the caption toward its next text. */
	let scrambleId = 0;
	const scramble = (k, frames) => {
		const id = ++scrambleId;
		let f = 0;
		const step = () => {
			if (id !== scrambleId) return;
			const to = L(photos()[k].caption); /* read each frame: the language may change mid-way */
			const p = f / frames;
			caption.textContent = [...to].map((ch, i) => (ch === ' ' || i / to.length < p ? ch : pick(GLYPHS))).join('');
			if (f++ < frames) setTimeout(step, 45); else caption.textContent = to;
		};
		step();
	};

	const glitchTo = (next) => {
		if (busy || !fig?.isConnected) return;
		busy = true;
		if (reduced) {
			setActive(next);
			relabel();
			busy = false;
			return;
		}
		const from = index;
		const FRAMES = 15;
		const SWAP = 7;
		let f = 0;
		fig.classList.add('is-glitching');
		chromaR.src = chromaC.src = srcOf(from);
		scramble(next, 14);
		count.textContent = `${next + 1}/${photos().length}`;

		const frame = () => {
			if (f === SWAP) { setActive(next); chromaR.src = chromaC.src = srcOf(next); }
			const strength = 1 - Math.abs(f - SWAP) / SWAP;
			const c = rand(3, 16) * (0.4 + strength);
			fig.style.setProperty('--chroma', `${c.toFixed(1)}px`);
			fig.style.setProperty('--jitter-x', `${rand(-6, 6) * strength}px`);
			fig.style.setProperty('--jitter-y', `${rand(-3, 3) * strength}px`);
			fig.style.setProperty('--noise', (0.18 + strength * rand(0.2, 0.5)).toFixed(2));
			fig.style.setProperty('--flash', Math.random() < 0.18 ? rand(1.4, 2.2).toFixed(2) : '1');
			fig.classList.toggle('is-blank', Math.random() < 0.1 && f !== SWAP);
			seed.setAttribute('seed', String(Math.floor(rand(1, 999))));
			[...slices.children].forEach((s) => {
				const on = Math.random() < 0.35 + strength * 0.4;
				const top = rand(0, 92);
				s.hidden = !on;
				if (!on) return;
				s.firstElementChild.src = srcOf(Math.random() < 0.5 ? from : next);
				s.style.setProperty('--slice-top', `${top.toFixed(1)}%`);
				s.style.setProperty('--slice-bottom', `${(100 - top - rand(2, 14)).toFixed(1)}%`);
				s.style.setProperty('--slice-x', `${rand(-40, 40).toFixed(0)}px`);
			});
			if (++f <= FRAMES) setTimeout(frame, rand(35, 70));
			else {
				fig.classList.remove('is-glitching', 'is-blank');
				[...slices.children].forEach((s) => { s.hidden = true; });
				relabel();
				busy = false;
			}
		};
		frame();
	};

	const schedule = () => {
		clearTimeout(timer);
		if (!fig?.isConnected || reduced || paused || !visible || document.hidden) return;
		timer = setTimeout(() => { glitchTo((index + 1) % photos().length); schedule(); }, INTERVAL);
	};

	const fillStack = () => {
		stack.innerHTML = photos().map((p, k) => `<img class="portrait__img${k === index ? ' is-active' : ''}" src="${srcOf(k)}" alt="" width="1200" height="900" loading="lazy" decoding="async">`).join('');
		imgs = [...stack.children];
	};
	/* New photos, captions or order from the Studio. */
	const refresh = () => {
		if (!fig || !photos().length) return;
		index = Math.min(index, photos().length - 1);
		fillStack();
		relabel();
	};

	/* Called each time the About view is drawn (app.js): the figure is new every time. */
	const init = () => {
		fig = $('[data-portrait]');
		index = 0;
		busy = false;
		visible = false;
		if (!fig || !photos().length) return;
		stack = $('[data-portrait-stack]', fig);
		chromaR = $('[data-chroma="r"]', fig);
		chromaC = $('[data-chroma="c"]', fig);
		slices = $('[data-slices]', fig);
		caption = $('[data-portrait-caption]', fig);
		count = $('[data-portrait-count]', fig);
		toggle = $('[data-portrait-toggle]', fig);
		seed = document.querySelector('[data-noise-seed]');

		fillStack();
		slices.innerHTML = Array.from({ length: SLICES }, () => '<span class="portrait__slice" hidden><img alt=""></span>').join('');
		paused = reduced;
		toggle.hidden = reduced;
		relabel();

		$('[data-portrait-next]', fig).addEventListener('click', () => { glitchTo((index + 1) % photos().length); schedule(); });
		toggle.addEventListener('click', () => { paused = !paused; relabel(); schedule(); });
		new IntersectionObserver(([en]) => { visible = en.isIntersecting; schedule(); }, { threshold: 0.4 }).observe(fig);
		document.addEventListener('visibilitychange', schedule);
	};

	window.Portrait = { init, relabel, refresh };
})();
