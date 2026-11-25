(() => {
	const { WORKS, PROFILE } = window;
	const { card, src, byId, openViewer, fadeIn, icon } = window.DH;
	const $ = (s, r = document) => r.querySelector(s);
	const $$ = (s, r = document) => [...r.querySelectorAll(s)];
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const params = new URLSearchParams(location.search);
	const AUDIENCE = { games: 'estúdios de games', animacao: 'produtoras de animação', livros: 'editoras' };
	const NAMES = { games: 'Games', animacao: 'Animação', livros: 'Livros infantis' };

	/* Profile */
	$$('[data-profile="bio"]').forEach((el) => { el.textContent = PROFILE.bio; });
	$('[data-profile="timeline"]').innerHTML = PROFILE.timeline
		.map(([when, where, what]) => `<li><span class="timeline__when">${when}</span><span class="timeline__where">${where}</span><span class="timeline__what">${what}</span></li>`).join('');
	$('[data-profile="links"]').innerHTML = PROFILE.links
		.map(([label, href]) => `<li><a class="contact__link" href="${href}" target="_blank" rel="noopener">${label}${icon.next}</a></li>`).join('');
	$('[data-profile="reel"]').innerHTML = PROFILE.animationReel
		.map(([title, what]) => `<li><span class="reel__name">${title}</span><span class="reel__what">${what}</span></li>`).join('');

	/* Selection state */
	const selection = new Set((params.get('sel') || '').split(',').filter((id) => byId[id]));
	const syncPick = (id) => $$(`[data-id="${id}"] .work__pick, .feature[data-id="${id}"] .work__pick`)
		.forEach((b) => b.setAttribute('aria-pressed', String(selection.has(id))));

	const shelfItem = (w) => {
		const el = card(w, { selectable: true });
		el.style.setProperty('--r', (w.w / w.h).toFixed(3));
		return el;
	};
	const fill = (key, items) => {
		const box = $(`[data-list="${key}"]`);
		items.forEach((w) => box.append(shelfItem(w)));
	};

	fill('games', WORKS.filter((w) => w.section === 'games' && w.id !== 'bear'));
	fill('animacao', WORKS.filter((w) => w.section === 'animacao' && w.id !== 'robot'));
	fill('livros', WORKS.filter((w) => w.section === 'livros' && w.id !== 'tito'));
	fill('sketchbook', WORKS.filter((w) => w.section === 'sketchbook'));

	/* Door counts */
	$$('[data-door-count]').forEach((el) => {
		const n = WORKS.filter((w) => w.section === el.dataset.doorCount).length;
		el.innerHTML = `${n} trabalhos ${icon.next}`;
	});

	/* Feature blocks */
	$$('[data-feature]').forEach((box) => {
		const w = byId[box.dataset.feature];
		box.dataset.id = w.id;
		const steps = w.steps || [];
		const extra = w.id === 'tito' ? WORKS.filter((x) => x.id.startsWith('abc-')) : [];
		box.innerHTML = `
			<button class="feature__open" type="button" aria-label="Abrir ${w.title}">
				<img class="feature__img" src="${src(w.img)}" alt="${w.title}" width="${w.w}" height="${w.h}" loading="lazy" decoding="async">
			</button>
			<div class="feature__side">
				<h3 class="feature__title">${w.title}</h3>
				<p class="feature__meta">${w.year} · ${w.kind}${w.fan ? ` · fan art de ${w.fan}` : ''}</p>
				${steps.length ? `<ol class="feature__steps">${steps.map(([label, name], k) => `
					<li><button type="button" class="feature__step" data-step="${k}">
						<img src="${src(name)}" alt="" loading="lazy" decoding="async"><span><span class="feature__n">${k + 1}</span>${label}</span>
					</button></li>`).join('')}</ol>` : ''}
				${extra.length ? `<ul class="feature__letters">${extra.map((x) => `
					<li><button type="button" class="feature__letter" data-open="${x.id}" aria-label="Abrir ${x.title}">
						<img src="${src(x.img)}" alt="" loading="lazy" decoding="async"></button></li>`).join('')}</ul>` : ''}
				<button class="work__pick work__pick--wide" type="button" aria-pressed="false">${icon.plus}${icon.check}<span>Pôr na seleção</span></button>
			</div>`;
		$$('img', box).forEach(fadeIn);
		$('.feature__open', box).addEventListener('click', () => openViewer(w.id, Math.max(0, steps.length - 1)));
		$$('[data-step]', box).forEach((b) => b.addEventListener('click', () => openViewer(w.id, +b.dataset.step)));
		$$('[data-open]', box).forEach((b) => b.addEventListener('click', () => openViewer(b.dataset.open)));
	});

	/* Tray */
	const tray = $('[data-tray]');
	const toggleBtn = $('[data-tray-toggle]');
	const status = $('[data-copy-status]');
	let trayOpen = false;
	const shareUrl = () => `${location.origin}${location.pathname}?sel=${[...selection].join(',')}#selecao`;

	const renderTray = () => {
		$$('[data-count]').forEach((el) => { el.textContent = String(selection.size); });
		$('[data-tray-label]').textContent = selection.size === 1 ? 'peça na seleção' : 'peças na seleção';
		const thumbs = $('[data-tray-thumbs]');
		thumbs.innerHTML = [...selection].slice(-5).map((id) => `<img src="${src(byId[id].img)}" alt="">`).join('');
		$('[data-copy]').disabled = selection.size === 0;
		const show = trayOpen || selection.size > 0;
		tray.classList.toggle('is-open', show);
		toggleBtn.setAttribute('aria-expanded', String(show));
		if (selection.size === 0) status.textContent = 'Use o + em cada trabalho para montar uma seleção.';
	};

	document.addEventListener('click', (e) => {
		const b = e.target.closest('.work__pick');
		if (!b) return;
		const id = b.closest('[data-id]').dataset.id;
		if (selection.has(id)) selection.delete(id); else selection.add(id);
		syncPick(id);
		status.textContent = '';
		renderTray();
	});
	toggleBtn.addEventListener('click', () => { trayOpen = !trayOpen; renderTray(); });
	$('[data-clear]').addEventListener('click', () => {
		const ids = [...selection];
		selection.clear();
		ids.forEach(syncPick);
		trayOpen = false;
		renderTray();
	});
	$('[data-copy]').addEventListener('click', async () => {
		const url = shareUrl();
		try {
			await navigator.clipboard.writeText(url);
			status.textContent = 'Link copiado. Quem abrir vê estas peças primeiro.';
		} catch {
			status.textContent = url;
		}
	});

	/* Chapter order: the chosen door comes first */
	const chapters = $('[data-chapters]');
	const note = $('[data-order-note]');
	const applyOrder = (key) => {
		const first = $(`[data-chapter="${key}"]`);
		if (!first) return;
		const sel = $('[data-chapter="selecao"]');
		chapters.insertBefore(first, sel.hidden ? chapters.firstElementChild : sel.nextElementSibling);
		$$('[data-door]').forEach((d) => d.setAttribute('aria-current', String(d.dataset.door === key)));
		note.hidden = false;
		note.innerHTML = `Começando por <strong>${NAMES[key]}</strong>, para ${AUDIENCE[key]}. <button type="button" class="link" data-reset>Ver na ordem original</button>`;
		$('[data-reset]', note).addEventListener('click', () => {
			['games', 'animacao', 'livros'].forEach((k) => chapters.append($(`[data-chapter="${k}"]`)));
			$$('[data-door]').forEach((d) => d.setAttribute('aria-current', 'false'));
			note.hidden = true;
			history.replaceState(null, '', location.pathname);
		});
	};

	$$('[data-door]').forEach((door) => door.addEventListener('click', (e) => {
		e.preventDefault();
		const key = door.dataset.door;
		applyOrder(key);
		history.replaceState(null, '', `?para=${key}#${key}`);
		$(`#${key}`).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
	}));

	/* Shared selection link */
	if (selection.size) {
		const sel = $('[data-chapter="selecao"]');
		sel.hidden = false;
		[...selection].forEach((id) => $('[data-list="selecao"]').append(shelfItem(byId[id])));
	}
	if (params.get('para')) applyOrder(params.get('para'));
	[...selection].forEach(syncPick);
	renderTray();
})();
