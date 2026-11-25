/* Shared helpers: image path, work card (hover flipbook), gallery viewer (shared-element morph, frame transitions). */
(() => {
	const { t, title, kind, step, esc } = window.I18N;
	const BASE = document.documentElement.dataset.img || '../assets/img/';
	/* Sanity images come from the CDN (WebP/AVIF where supported, never upscaled); works.js names are local files. */
	const CMS_IMG = window.DH_IMG || {};
	const src = (name, w = 1800) => (CMS_IMG[name] ? `${CMS_IMG[name].url}?w=${w}&fit=max&auto=format` : `${BASE}${name}.jpg`);
	const byId = Object.fromEntries(window.WORKS.map((w) => [w.id, w]));
	/* Featured work per section: chosen in the Studio (window.SECTIONS) or, with works.js, the original picks. */
	const FEATURED = { games: 'bear', animacao: 'robot', livros: 'tito' };
	const featured = (section) => {
		const pick = window.SECTIONS ? window.SECTIONS[section]?.featured : FEATURED[section];
		const w = pick && byId[pick];
		return w && w.section === section ? w : null;
	};
	const related = (section) => {
		const ids = window.SECTIONS ? window.SECTIONS[section]?.related || [] : section === 'livros' ? window.WORKS.filter((w) => w.id.startsWith('abc-')).map((w) => w.id) : [];
		return ids.map((x) => byId[x]).filter((w) => w && w.section === section);
	};
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const icon = {
		close: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>',
		prev: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		next: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 4.5L13 10l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>',
		steps: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="4" width="6" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="11.5" y="4" width="6" height="12" rx="1" fill="currentColor"/></svg>',
		pause: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
		play: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4.5v11l8.5-5.5z" fill="currentColor"/></svg>',
	};

	/* View Transitions when available and motion is allowed. */
	const transition = (fn) => {
		if (reduced || !document.startViewTransition) { fn(); return Promise.resolve(); }
		return document.startViewTransition(fn).finished.catch(() => {});
	};

	/* Images fade in once decoded. */
	const fadeIn = (img) => {
		img.classList.add('is-loading');
		const done = () => img.classList.remove('is-loading');
		if (img.complete && img.naturalWidth) done();
		else img.addEventListener('load', done, { once: true });
	};

	const meta = (w) => `${w.year} · ${kind(w.kind)}`;
	const hasSteps = (w) => Array.isArray(w.steps) && w.steps.length > 1;

	const frames = (w) => (w.steps && w.steps.length ? w.steps : [['Final', w.img]]);
	const imgName = (el) => (el?.getAttribute('src') || '').split('?')[0].split('/').pop().replace(/\.\w+$/, '');
	const preload = (name) => { const i = new Image(); i.src = src(name); return i; };

	/* Hover flipbook: a card with process steps plays them like a pencil test. */
	const flipbook = (el, w) => {
		if (reduced || !hasSteps(w)) return () => {};
		const box = el.querySelector('.work__open');
		const flip = document.createElement('img');
		flip.className = 'work__flip';
		flip.alt = '';
		flip.setAttribute('aria-hidden', 'true');
		const chip = document.createElement('span');
		chip.className = 'work__chip';
		chip.setAttribute('aria-hidden', 'true');
		box.append(flip, chip);
		let timer = 0;
		let k = 0;
		const list = w.steps;
		const tick = () => {
			const [label, name] = list[k];
			flip.src = src(name);
			chip.textContent = `${k + 1}/${list.length} · ${step(label)}`;
			box.classList.add('is-flipping');
			k = (k + 1) % list.length;
			timer = setTimeout(tick, 560);
		};
		const stop = () => { clearTimeout(timer); timer = 0; box.classList.remove('is-flipping'); };
		box.addEventListener('pointerenter', () => {
			list.forEach(([, name]) => preload(name));
			k = 0;
			timer = setTimeout(tick, 280);
		});
		box.addEventListener('pointerleave', stop);
		return stop;
	};

	/* Work card. */
	const card = (w) => {
		const el = document.createElement('figure');
		el.className = 'work';
		el.dataset.id = w.id;
		el.dataset.reveal = '';
		el.style.setProperty('--work-ratio', `${w.w} / ${w.h}`);
		const name = esc(title(w));
		el.innerHTML = `
			<button class="work__open" type="button" data-cursor="${hasSteps(w) ? 'process' : 'view'}" aria-label="${t('open', name)}${hasSteps(w) ? t('open.process') : ''}">
				<img class="work__img" src="${src(w.img, 1200)}" alt="${name}, ${esc(kind(w.kind).toLowerCase())}" width="${w.w}" height="${w.h}" loading="lazy" decoding="async">
			</button>
			<figcaption class="work__caption">
				<span class="work__title">${name}</span>
				<span class="work__meta">${esc(meta(w))}</span>
				${w.fan ? `<span class="work__fan">${t('fan.badge', esc(w.fan))}</span>` : ''}
				${hasSteps(w) ? `<span class="work__steps">${icon.steps}${t('steps', w.steps.length)}</span>` : ''}
			</figcaption>`;
		const img = el.querySelector('img');
		fadeIn(img);
		const stopFlip = flipbook(el, w);
		/* Open on the frame the card shows (usually the final), so the thumbnail can morph into it. */
		const shown = Math.max(0, frames(w).findIndex(([, n]) => n === w.img));
		el.querySelector('.work__open').addEventListener('click', () => { stopFlip(); openViewer(w.id, shown, img); });
		return el;
	};

	/* ---------- viewer: one continuous gallery per section ----------
	   ← → walk the frames of a piece (its process), then carry on to the next piece. */
	const dlg = document.querySelector('.viewer');
	let current = null;
	let step_ = 0;
	let origin = null;
	let loadToken = 0;
	let vtSeq = 0;
	const v = dlg && {
		title: dlg.querySelector('.viewer__title'),
		meta: dlg.querySelector('.viewer__meta'),
		count: dlg.querySelector('.viewer__count'),
		img: dlg.querySelector('.viewer__img'),
		canvas: dlg.querySelector('.viewer__canvas'),
		caption: dlg.querySelector('.viewer__caption'),
		steps: dlg.querySelector('.viewer__steps'),
		progress: dlg.querySelector('.viewer__progress'),
		source: dlg.querySelector('.viewer__source'),
		prev: dlg.querySelector('.viewer__prev'),
		next: dlg.querySelector('.viewer__next'),
	};
	const gallery = (w) => window.WORKS.filter((x) => x.section === w.section);

	/* Header, counter and the strip of process thumbnails for the current piece. */
	const fill = () => {
		const list = gallery(current);
		v.title.textContent = title(current);
		v.meta.textContent = `${meta(current)}${current.fan ? ` · ${t('fan.of', current.fan)}` : ''}`;
		v.count.innerHTML = `<span>${t(`nav.${current.section}`)}</span> <span class="viewer__count-n">${list.indexOf(current) + 1}/${list.length}</span>`;
		v.source.hidden = !current.source;
		v.source.href = current.source || '#';
		v.source.textContent = (current.source || '').includes('behance') ? t('source.behance') : t('source.artstation');
		const fr = frames(current);
		v.steps.innerHTML = fr.length > 1
			? fr.map(([label, name], k) => `<button type="button" class="viewer__step" data-step="${k}">
				<img class="viewer__thumb" src="${src(name, 480)}" alt="" loading="lazy" decoding="async">
				<span class="viewer__step-label"><span class="viewer__step-n">${k + 1}</span>${esc(step(label))}</span></button>`).join('')
			: '';
		v.steps.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => go(current, +b.dataset.step)));
		v.steps.hidden = fr.length < 2;
		v.progress.hidden = fr.length < 2;
	};

	const mark = () => {
		const fr = frames(current);
		const [label] = fr[step_];
		v.img.alt = t('step.of', title(current), step(label));
		v.steps.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-current', k === step_ ? 'step' : 'false'));
		v.progress.style.setProperty('--progress', String((step_ + 1) / fr.length));
		v.steps.querySelector('[aria-current="step"]')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
	};

	/* Frame change, animated on the image itself (a document view transition would not capture the
	   modal's top layer). Same piece: a light-table wipe, the old stage lingers as onion skin.
	   Next piece: the old one slides off, the new one arrives from the side. */
	const EASE_OUT = 'cubic-bezier(.23, 1, .32, 1)';
	const swap = (nextSrc, kind, dir) => {
		if (reduced) { v.img.src = nextSrc; return; }
		const ghost = v.img.cloneNode();
		ghost.className = 'viewer__img viewer__ghost';
		ghost.removeAttribute('style');
		ghost.alt = '';
		ghost.setAttribute('aria-hidden', 'true');
		v.canvas.append(ghost);
		v.img.src = nextSrc;
		const sameWork = kind === 'step';
		const enter = sameWork
			? [{ clipPath: dir > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0)' }]
			: [{ opacity: 0, transform: `translateX(${dir * 8}%) scale(.97)` }, { opacity: 1, transform: 'none' }];
		const leave = sameWork
			? [{ opacity: 1, filter: 'none' }, { opacity: 0.45, filter: 'grayscale(1) contrast(.85)', offset: 0.4 }, { opacity: 0, filter: 'grayscale(1) contrast(.85)' }]
			: [{ opacity: 1 }, { opacity: 0, transform: `translateX(${-dir * 6}%) scale(.97)`, filter: 'blur(4px)' }];
		v.img.animate(enter, { duration: 700, easing: EASE_OUT, delay: sameWork ? 0 : 80, fill: 'backwards' });
		const out = ghost.animate(leave, { duration: sameWork ? 800 : 450, easing: sameWork ? 'ease' : 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' });
		out.finished.then(() => ghost.remove(), () => ghost.remove());
		if (!sameWork) {
			v.caption.animate([{ opacity: 0, transform: 'translateY(0.5rem)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: EASE_OUT, delay: 120, fill: 'backwards' });
		}
	};

	/* Show frame i of work w. dir: 1 forward, -1 back. */
	const go = (w, i, dir = i >= step_ ? 1 : -1) => {
		const kind = w === current ? 'step' : 'work';
		if (kind === 'step' && i === step_) return;
		const name = frames(w)[i][1];
		const token = ++loadToken;
		const next = preload(name);
		next.decode().catch(() => {}).then(() => {
			if (token !== loadToken || !dlg.open) return;
			if (kind === 'work') { current = w; origin = null; step_ = i; fill(); } else step_ = i;
			swap(next.src, kind, dir);
			mark();
		});
	};

	/* One step along the gallery: inside the piece first, then the neighbouring piece. */
	const walk = (dir) => {
		const fr = frames(current);
		if (step_ + dir >= 0 && step_ + dir < fr.length) { go(current, step_ + dir, dir); return; }
		const list = gallery(current);
		const w = list[(list.indexOf(current) + dir + list.length) % list.length];
		const wf = frames(w);
		/* Entering a piece forward starts at its final frame (what the card shows); backward, at its last. */
		const start = dir > 0 ? Math.max(0, wf.findIndex(([, n]) => n === w.img)) : wf.length - 1;
		go(w, start, dir);
	};

	/* Open. from: the clicked thumbnail; if it shows the same frame, it morphs into the viewer. */
	const openViewer = (id, start = 0, from = null) => {
		if (!dlg) return;
		current = byId[id];
		origin = from;
		step_ = start;
		fill();
		mark();
		const name = frames(current)[start][1];
		const morph = from && imgName(from) === name && from.getBoundingClientRect().width > 0;
		if (!morph) {
			dlg.classList.remove('is-vt');
			v.img.classList.add('is-loading');
			v.img.src = src(name);
			fadeIn(v.img);
			dlg.showModal();
			return;
		}
		from.style.viewTransitionName = 'hero';
		dlg.classList.add('is-vt');
		const seq = ++vtSeq;
		transition(() => {
			from.style.viewTransitionName = '';
			dlg.showModal();
			v.img.src = src(name);
			v.img.classList.remove('is-loading');
			v.img.style.viewTransitionName = 'hero';
		}).then(() => {
			if (seq !== vtSeq) return; /* closed mid-morph: the close transition owns the state now */
			v.img.style.viewTransitionName = '';
			dlg.classList.remove('is-vt');
		});
	};

	/* Close: morph back to the thumbnail when it is still the same frame and on screen. */
	const closeViewer = () => {
		if (!dlg.open) return;
		++loadToken;
		v.canvas.querySelectorAll('.viewer__ghost').forEach((g) => g.remove());
		const target = origin && origin.isConnected && imgName(origin) === imgName(v.img) ? origin : null;
		const r = target?.getBoundingClientRect();
		const visible = r && r.bottom > 0 && r.top < innerHeight && r.width > 0;
		if (!visible) { dlg.classList.remove('is-vt'); dlg.close(); return; }
		v.img.style.viewTransitionName = 'hero';
		dlg.classList.add('is-vt');
		const seq = ++vtSeq;
		transition(() => {
			v.img.style.viewTransitionName = '';
			dlg.close();
			target.style.viewTransitionName = 'hero';
		}).then(() => {
			target.style.viewTransitionName = '';
			if (seq === vtSeq) dlg.classList.remove('is-vt');
		});
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
		window.I18N.onChange(() => { if (current) { fill(); mark(); } });
	}

	/* Sticky top: "scrolled" state. */
	const top = document.querySelector('.topbar');
	if (top) {
		const onScroll = () => top.classList.toggle('is-scrolled', window.scrollY > 8);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
	}

	window.DH = { src, byId, featured, related, imgName, card, openViewer, fadeIn, icon, transition, reduced };
})();
