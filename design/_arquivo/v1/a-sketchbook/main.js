(() => {
	const { WORKS, PROFILE } = window;
	const { card, src, byId, openViewer, fadeIn, icon } = window.DH;
	const $ = (s, r = document) => r.querySelector(s);
	const $$ = (s, r = document) => [...r.querySelectorAll(s)];
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* Profile */
	$$('[data-profile="bio"]').forEach((el) => { el.textContent = PROFILE.bio; });
	$('[data-profile="timeline"]').innerHTML = PROFILE.timeline
		.map(([when, where, what]) => `<tr><th scope="row">${when}</th><td class="timeline__where">${where}</td><td>${what}</td></tr>`).join('');
	$('[data-profile="links"]').innerHTML = PROFILE.links
		.map(([label, href]) => `<li><a class="contact__link" href="${href}" target="_blank" rel="noopener"><span>${label}</span>${icon.next}</a></li>`).join('');
	$('[data-profile="reel"]').innerHTML = PROFILE.animationReel
		.map(([title, what]) => `<li><span class="reel__title">${title}</span><span class="reel__what">${what}</span></li>`).join('');

	/* Lists */
	const fill = (key, items) => {
		const box = $(`[data-list="${key}"]`);
		items.forEach((w) => box.append(card(w)));
	};
	const cards = ['fizzban', 'ooops', 'dontstop'];
	fill('cards', cards.map((id) => byId[id]));
	fill('games', WORKS.filter((w) => w.section === 'games' && w.id !== 'bear' && !cards.includes(w.id)));
	fill('animacao', WORKS.filter((w) => w.section === 'animacao' && w.id !== 'robot'));
	fill('abc', WORKS.filter((w) => w.id.startsWith('abc-')));
	fill('livros', WORKS.filter((w) => w.section === 'livros' && !w.id.startsWith('abc-')));
	fill('sketchbook', WORKS.filter((w) => w.section === 'sketchbook'));

	/* Film strip: the giant robot, step by step */
	const robot = byId.robot;
	const film = $('[data-film="robot"]');
	robot.steps.forEach(([label, name], k) => {
		const li = document.createElement('li');
		li.className = 'film__frame';
		li.innerHTML = `<button type="button" class="film__open" aria-label="${robot.title}: ${label}">
			<img src="${src(name)}" alt="" loading="lazy" decoding="async"></button>
			<span class="film__label"><span class="film__n">${k + 1}</span>${label}</span>`;
		fadeIn($('img', li));
		$('button', li).addEventListener('click', () => openViewer('robot', k));
		film.append(li);
	});

	$$('[data-open]').forEach((b) => b.addEventListener('click', () => openViewer(b.dataset.open)));

	/* Process stage: thumbnail → line → values → colour */
	const bear = byId.bear;
	const framesBox = $('[data-stage-frames]');
	const stepsBox = $('[data-stage-steps]');
	const range = $('[data-stage-range]');
	const last = bear.steps.length - 1;
	range.max = String(last * 100);

	const frames = bear.steps.map(([label, name], k) => {
		const img = document.createElement('img');
		img.className = 'stage__frame';
		img.src = src(name);
		img.alt = k === last ? `${bear.title}, arte final` : '';
		img.decoding = 'async';
		framesBox.append(img);
		const b = document.createElement('button');
		b.type = 'button';
		b.className = 'stage__step';
		b.innerHTML = `<span class="stage__step-n">${k + 1}</span>${label}`;
		b.addEventListener('click', () => { stopAuto(); tween(k * 100); });
		stepsBox.append(b);
		return { img, b };
	});

	const render = (value) => {
		const t = value / 100;
		frames.forEach(({ img, b }, k) => {
			img.style.setProperty('--frame-opacity', Math.max(0, 1 - Math.abs(t - k)).toFixed(3));
			b.setAttribute('aria-pressed', String(Math.round(t) === k));
		});
		range.style.setProperty('--range-fill', `${(value / (last * 100)) * 100}%`);
	};

	let raf = 0;
	const tween = (to, dur = reduced ? 0 : 700) => {
		cancelAnimationFrame(raf);
		const from = +range.value;
		const t0 = performance.now();
		const ease = (x) => 1 - Math.pow(1 - x, 4);
		const tick = (now) => {
			const p = dur ? Math.min(1, (now - t0) / dur) : 1;
			range.value = String(from + (to - from) * ease(p));
			render(+range.value);
			if (p < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	};

	let auto = null;
	const stopAuto = () => { clearTimeout(auto); auto = null; };
	range.addEventListener('input', () => { stopAuto(); cancelAnimationFrame(raf); render(+range.value); });
	render(0);

	/* Plays the process once on arrival, step by step. */
	if (!reduced) {
		let k = 0;
		const next = () => {
			k += 1;
			if (k > last) return;
			tween(k * 100, 900);
			auto = setTimeout(next, 1800);
		};
		auto = setTimeout(next, 1200);
	} else {
		render(last * 100);
		range.value = String(last * 100);
	}

	/* Sketchbook rail */
	const rail = $('[data-list="sketchbook"]');
	$$('[data-rail]').forEach((b) => {
		b.innerHTML = b.dataset.rail === '1' ? icon.next : icon.prev;
		b.addEventListener('click', () => rail.scrollBy({ left: +b.dataset.rail * rail.clientWidth * 0.7, behavior: reduced ? 'auto' : 'smooth' }));
	});
})();
