/* Shared by both layouts: image helper, work card, process viewer. */
(() => {
	const BASE = document.documentElement.dataset.img || '../assets/img/';
	const src = (name) => `${BASE}${name}.jpg`;
	const byId = Object.fromEntries(window.WORKS.map((w) => [w.id, w]));

	const icon = {
		close: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
		prev: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		next: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4.5L13 10l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		steps: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="4" width="6" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="11.5" y="4" width="6" height="12" rx="1" fill="currentColor"/></svg>',
		plus: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4.5v11M4.5 10h11" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
		check: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
	};

	/* Images fade in once decoded. */
	const fadeIn = (img) => {
		img.classList.add('is-loading');
		const done = () => img.classList.remove('is-loading');
		if (img.complete && img.naturalWidth) done();
		else img.addEventListener('load', done, { once: true });
	};

	const meta = (w) => `${w.year} · ${w.kind}`;

	/* Work card. opts.selectable adds the "add to selection" toggle (layout B). */
	const card = (w, opts = {}) => {
		const el = document.createElement('figure');
		el.className = 'work';
		el.dataset.id = w.id;
		el.style.setProperty('--work-ratio', `${w.w} / ${w.h}`);
		const hasSteps = Array.isArray(w.steps) && w.steps.length > 1;
		el.innerHTML = `
			<button class="work__open" type="button" aria-label="Abrir ${w.title}${hasSteps ? ', com processo' : ''}">
				<img class="work__img" src="${src(w.img)}" alt="${w.title}, ${w.kind.toLowerCase()}" width="${w.w}" height="${w.h}" loading="lazy" decoding="async">
			</button>
			<figcaption class="work__caption">
				<span class="work__title">${w.title}</span>
				<span class="work__meta">${meta(w)}</span>
				${w.fan ? `<span class="work__fan">Fan art · ${w.fan}</span>` : ''}
				${hasSteps ? `<span class="work__steps">${icon.steps}${w.steps.length} etapas</span>` : ''}
			</figcaption>
			${opts.selectable ? `<button class="work__pick" type="button" aria-pressed="false" aria-label="Pôr ${w.title} na seleção">${icon.plus}${icon.check}</button>` : ''}`;
		fadeIn(el.querySelector('img'));
		el.querySelector('.work__open').addEventListener('click', () => openViewer(w.id));
		return el;
	};

	/* Process viewer (dialog). */
	const dlg = document.querySelector('.viewer');
	let current = null;
	let step = 0;
	const v = dlg && {
		title: dlg.querySelector('.viewer__title'),
		meta: dlg.querySelector('.viewer__meta'),
		img: dlg.querySelector('.viewer__img'),
		steps: dlg.querySelector('.viewer__steps'),
		source: dlg.querySelector('.viewer__source'),
		prev: dlg.querySelector('.viewer__prev'),
		next: dlg.querySelector('.viewer__next'),
	};
	const frames = (w) => (w.steps && w.steps.length ? w.steps : [['Final', w.img]]);

	const show = (i) => {
		const list = frames(current);
		step = (i + list.length) % list.length;
		const [label, name] = list[step];
		v.img.classList.add('is-loading');
		const next = new Image();
		next.src = src(name);
		next.decode().catch(() => {}).then(() => {
			v.img.src = next.src;
			v.img.alt = `${current.title}, etapa: ${label}`;
			v.img.classList.remove('is-loading');
		});
		v.steps.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-current', k === step ? 'step' : 'false'));
		const many = list.length > 1;
		v.prev.hidden = v.next.hidden = !many;
	};

	const openViewer = (id, start = 0) => {
		if (!dlg) return;
		current = byId[id];
		v.title.textContent = current.title;
		v.meta.textContent = `${meta(current)}${current.fan ? ` · fan art de ${current.fan}` : ''}`;
		v.source.href = current.source;
		v.source.textContent = current.source.includes('behance') ? 'Ver no Behance' : 'Ver no ArtStation';
		const list = frames(current);
		v.steps.innerHTML = list.length > 1
			? list.map(([label], k) => `<button type="button" class="viewer__step" data-step="${k}"><span class="viewer__step-n">${k + 1}</span>${label}</button>`).join('')
			: '';
		v.steps.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => show(+b.dataset.step)));
		dlg.showModal();
		show(start);
	};

	if (dlg) {
		dlg.querySelector('.viewer__close').innerHTML = icon.close;
		v.prev.innerHTML = icon.prev;
		v.next.innerHTML = icon.next;
		dlg.querySelector('.viewer__close').addEventListener('click', () => dlg.close());
		v.prev.addEventListener('click', () => show(step - 1));
		v.next.addEventListener('click', () => show(step + 1));
		dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
		dlg.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowRight') show(step + 1);
			if (e.key === 'ArrowLeft') show(step - 1);
		});
	}

	/* Sticky top: "scrolled" state. */
	const top = document.querySelector('.topbar');
	if (top) {
		const onScroll = () => top.classList.toggle('is-scrolled', window.scrollY > 8);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
	}

	window.DH = { src, byId, card, openViewer, fadeIn, icon };
})();
