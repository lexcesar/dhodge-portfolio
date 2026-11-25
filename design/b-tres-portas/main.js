(() => {
	const { WORKS, PROFILE, I18N, DH, Motion } = window;
	const { t, L, title, kind, step } = I18N;
	const { card, src, byId, openViewer, fadeIn, icon, transition } = DH;
	const $ = (s, r = document) => r.querySelector(s);
	const $$ = (s, r = document) => [...r.querySelectorAll(s)];
	const params = new URLSearchParams(location.search);
	const DOORS = ['games', 'animacao', 'livros'];
	let order = DOORS.includes(params.get('para')) ? params.get('para') : null;

	/* data-i → --i (and a reveal delay), set from JS: no inline style in markup. */
	const setIndexes = (root, delay = 0) => $$('[data-i]', root).forEach((el) => {
		el.style.setProperty('--i', el.dataset.i);
		if (delay) el.style.setProperty('--reveal-delay', `${el.dataset.i * delay}ms`);
	});

	const shelfItem = (w, k) => {
		const el = card(w);
		el.style.setProperty('--r', (w.w / w.h).toFixed(3));
		el.style.setProperty('--reveal-delay', `${(k % 4) * 70}ms`);
		return el;
	};
	const fill = (key, items) => {
		const box = $(`[data-list="${key}"]`);
		box.replaceChildren(...items.map(shelfItem));
	};

	const feature = (box) => {
		const w = byId[box.dataset.feature];
		box.dataset.id = w.id;
		box.dataset.reveal = '';
		const steps = w.steps || [];
		const letters = w.id === 'tito' ? WORKS.filter((x) => x.id.startsWith('abc-')) : [];
		box.innerHTML = `
			<button class="feature__open" type="button" data-cursor="${steps.length ? 'process' : 'view'}" aria-label="${t('open', title(w))}">
				<img class="feature__img" src="${src(w.img)}" alt="${title(w)}" width="${w.w}" height="${w.h}" loading="lazy" decoding="async">
			</button>
			<div class="feature__side">
				<h3 class="feature__title">${title(w)}</h3>
				<p class="feature__meta">${w.year} · ${kind(w.kind)}${w.fan ? ` · ${t('fan.of', w.fan)}` : ''}</p>
				${steps.length ? `<ol class="feature__steps">${steps.map(([label, name], k) => `
					<li data-i="${k}"><button type="button" class="feature__step" data-step="${k}">
						<img src="${src(name)}" alt="" loading="lazy" decoding="async"><span><span class="feature__n">${k + 1}</span>${step(label)}</span>
					</button></li>`).join('')}</ol>` : ''}
				${letters.length ? `<ul class="feature__letters">${letters.map((x, k) => `
					<li data-i="${k}"><button type="button" class="feature__letter" data-open="${x.id}" data-cursor="view" aria-label="${t('open', title(x))}">
						<img src="${src(x.img)}" alt="" loading="lazy" decoding="async"></button></li>`).join('')}</ul>` : ''}
			</div>`;
		$$('img', box).forEach(fadeIn);
		setIndexes(box);
		const hero = $('.feature__img', box);
		const last = Math.max(0, steps.length - 1);
		$('.feature__open', box).addEventListener('click', () => openViewer(w.id, last, hero));
		$$('[data-step]', box).forEach((b) => b.addEventListener('click', () => openViewer(w.id, +b.dataset.step, $('img', b))));
		$$('[data-open]', box).forEach((b) => b.addEventListener('click', () => openViewer(b.dataset.open, 0, $('img', b))));
	};

	const noteFor = (key) => {
		const note = $('[data-order-note]');
		if (!key) { note.hidden = true; note.innerHTML = ''; return; }
		note.hidden = false;
		note.innerHTML = `${t('order.note', t(`nav.${key}`), t(`aud.${key}`))} <button type="button" class="link" data-reset>${t('order.reset')}</button>`;
		$('[data-reset]', note).addEventListener('click', () => {
			transition(() => {
				order = null;
				DOORS.forEach((k) => $('[data-chapters]').append($(`[data-chapter="${k}"]`)));
				$$('[data-door]').forEach((d) => d.setAttribute('aria-current', 'false'));
				noteFor(null);
				const url = new URL(location.href);
				url.searchParams.delete('para');
				url.hash = '';
				history.replaceState(null, '', url);
			});
		});
	};

	let langSeq = 0;
	/* Video facade: a still with a play button; the player (YouTube no-cookie / Vimeo do-not-track)
	   loads only on click, and starting one video stops any other. */
	const EMBED = {
		youtube: (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`,
		vimeo: (id) => `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1&title=0&byline=0&portrait=0`,
	};
	const stopVideos = () => $$('.video.is-playing').forEach((box) => {
		box.querySelector('.video__frame')?.remove();
		box.classList.remove('is-playing');
	});
	const video = ([platform, id], still, name, label = '', note = '') => {
		const box = document.createElement('div');
		box.className = 'video';
		box.innerHTML = `
			<button class="video__facade" type="button" data-cursor="play" aria-label="${t('video.play', name)}">
				<img class="video__still" src="${src(still)}" alt="" loading="lazy" decoding="async">
				<span class="video__play" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M7 4.5v11l8.5-5.5z" fill="currentColor"/></svg></span>
				${label || note ? `<span class="video__label">${label}${note ? `<span class="video__note">${note}</span>` : ''}</span>` : ''}
			</button>`;
		$('button', box).addEventListener('click', () => {
			stopVideos();
			const frame = document.createElement('iframe');
			frame.className = 'video__frame';
			frame.src = EMBED[platform](id);
			frame.title = name;
			frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
			box.classList.add('is-playing');
			box.append(frame);
			frame.focus();
		});
		return box;
	};

	/* Everything that holds translated text. Runs on load and on language change. */
	const render = (silent = false) => {
		I18N.apply();
		$$('[data-profile="bio"]').forEach((el) => { el.textContent = L(PROFILE.bio); });
		$('[data-profile="timeline"]').innerHTML = PROFILE.timeline
			.map(([when, where, what]) => `<li><span class="timeline__when">${when}</span><span class="timeline__where">${where}</span><span class="timeline__what">${L(what)}</span></li>`).join('');
		$('[data-profile="links"]').innerHTML = PROFILE.links
			.map(([label, href], k) => `<li data-reveal data-i="${k}"><a class="contact__link" href="${href}" target="_blank" rel="noopener">${label}${icon.next}</a></li>`).join('');
		setIndexes($('[data-profile="links"]'), 80);
		$('[data-profile="tv"]').replaceChildren(...PROFILE.tv.map((v, k) => {
			const li = document.createElement('li');
			li.className = `tv__item${k === 0 ? ' tv__item--lead' : ''}`;
			li.dataset.reveal = '';
			li.style.setProperty('--reveal-delay', `${k * 90}ms`);
			const cap = document.createElement('div');
			cap.className = 'tv__caption';
			cap.innerHTML = `<span class="tv__name">${v.title}</span><span class="tv__what">${L(v.what)}</span><span class="tv__meta">${L(v.credit)} · ${v.year} · ${v.length}</span>`;
			li.append(video(v.video, v.still, v.title), cap);
			return li;
		}));
		$('[data-profile="tv-also"]').textContent = L(PROFILE.tvAlso);
		const a = PROFILE.award;
		const fields = { year: a.year, work: a.work, given: L(a.given), prize: L(a.prize), credits: L(a.credits), about: L(a.about),
			summary: `${a.work} · ${L(a.prize)}` };
		$$('[data-award]').forEach((el) => { el.textContent = fields[el.dataset.award] ?? ''; });
		$('[data-award-source]').href = a.source;
		$('[data-award-media]').replaceChildren(video(a.video, a.still, a.work, t('award.watch'), t('video.length')));
		$('[data-award-making]').replaceChildren(...a.making.map(([id, label, still]) => {
			const li = document.createElement('li');
			li.append(video(id, still, L(label), L(label)));
			return li;
		}));
		$$('[data-door-count]').forEach((el) => {
			const n = WORKS.filter((w) => w.section === el.dataset.doorCount).length;
			el.innerHTML = `${t('works', n)} ${icon.next}`;
		});
		$$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === I18N.lang)));

		fill('games', WORKS.filter((w) => w.section === 'games' && w.id !== 'bear'));
		fill('animacao', WORKS.filter((w) => w.section === 'animacao' && w.id !== 'robot'));
		fill('livros', WORKS.filter((w) => w.section === 'livros' && w.id !== 'tito'));
		fill('sketchbook', WORKS.filter((w) => w.section === 'sketchbook'));
		$$('[data-feature]').forEach(feature);
		/* Re-translating the note is not news: keep the live region quiet. */
		const note = $('[data-order-note]');
		if (silent) note.removeAttribute('aria-live');
		noteFor(order);
		if (silent) requestAnimationFrame(() => note.setAttribute('aria-live', 'polite'));
		Motion.observe();
	};

	/* Chapter order: the chosen door comes first. */
	const applyOrder = (key) => {
		order = key;
		const chapters = $('[data-chapters]');
		chapters.prepend($(`[data-chapter="${key}"]`));
		$$('[data-door]').forEach((d) => d.setAttribute('aria-current', String(d.dataset.door === key)));
		noteFor(key);
	};

	$$('[data-door]').forEach((door) => door.addEventListener('click', (e) => {
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; /* new tab/window */
		e.preventDefault();
		const key = door.dataset.door;
		transition(() => applyOrder(key)).then(() => {
			const url = new URL(location.href);
			url.searchParams.set('para', key);
			url.hash = key;
			history.replaceState(null, '', url);
			Motion.scrollTo($(`#${key}`));
		});
	}));

	/* Language switch: cross-fade the whole page, keep the scroll position. */
	$$('[data-lang]').forEach((b) => b.addEventListener('click', () => {
		if (b.dataset.lang === I18N.lang) return;
		const seq = ++langSeq;
		document.documentElement.classList.add('is-switching-lang');
		transition(() => { I18N.set(b.dataset.lang); render(true); Motion.revealAll(); })
			.then(() => { if (seq === langSeq) document.documentElement.classList.remove('is-switching-lang'); });
	}));

	render();
	if (order) {
		applyOrder(order);
		/* The browser jumped to #hash before the reorder; land on the chosen chapter. */
		if (location.hash === `#${order}`) requestAnimationFrame(() => $(`#${order}`).scrollIntoView({ block: 'start' }));
	}
	window.Portrait?.init();
	I18N.onChange(() => window.Portrait?.relabel());
})();
