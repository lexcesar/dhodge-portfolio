/* PT/EN. Language comes from ?lang=, then the saved choice, then the browser.
   Works data stays in Portuguese (as Daniel writes it); the maps below translate the
   enum-like fields (kind, step) and the few titles that are Portuguese. In Sanity these
   become localized fields ({ pt, en }). */
(() => {
	const STR = {
		pt: {
			'meta.title': 'Daniel Hodge, ilustrador e animador 2D',
			'meta.description': 'Portfólio de Daniel Hodge, ilustrador e animador 2D. Games, animação e livros infantis.',
			skip: 'Pular para o conteúdo',
			'nav.label': 'Seções',
			'nav.games': 'Games', 'nav.animacao': 'Animação', 'nav.livros': 'Livros infantis', 'nav.sketchbook': 'Sketchbook', 'nav.sobre': 'Sobre',
			contact: 'Contato',
			'lang.label': 'Idioma',
			'home.label': 'Daniel Hodge, início',
			'intro.title': 'Daniel Hodge, ilustrador e animador&nbsp;2D',
			'doors.label': 'Escolha por onde começar',
			'door.games.for': 'Para estúdios de games', 'door.animacao.for': 'Para produtoras de animação', 'door.livros.for': 'Para editoras',
			'door.enter': 'Entrar',
			works: (n) => `${n} trabalhos`,
			'order.note': (name, who) => `Começando por <strong>${name}</strong>, para ${who}.`,
			'order.reset': 'Ver na ordem original',
			'aud.games': 'estúdios de games', 'aud.animacao': 'produtoras de animação', 'aud.livros': 'editoras',
			'games.lead': 'Personagens, splash e arte de card. Oito anos em estúdio, entre o Rio e Kuala Lumpur.',
			'animacao.lead': 'Do design ao frame final: storyboard, layout de câmera, cenário e personagem.',
			'livros.lead': 'O abecedário do Tito Club, uma letra por página, e personagens para ler em voz alta.',
			'sketchbook.lead': 'Miniaturas, estudos de pose, storyboard e lápis de cor: a peça resolvida antes da cor.',
			'reel.title': 'Para a TV',
			'tv.lead': 'Na BEELD, no Rio, entre 2012 e 2013: design, ilustração e animação para a Rede Globo.',
			'award.kicker': 'Prêmio',
			'award.watch': 'Assistir ao filme',
			'award.source': 'Lista oficial de premiados',
			'video.play': (title) => `Assistir: ${title}`,
			'video.length': 'Curta, 6 min',
			'about.role': 'ilustrador e animador 2D.',
			'about.awards': 'Prêmios',
			'about.path': 'Trajetória',
			'portrait.label': 'Fotos do Daniel na Patagônia',
			'portrait.pause': 'Pausar as fotos', 'portrait.play': 'Tocar as fotos', 'portrait.next': 'Próxima foto',
			footer: '© 2026 Daniel Hodge. Fan art marcada como fan art; personagens pertencem aos seus donos.',
			'footer.by': 'Site por', 'footer.by.label': 'Site feito pela Axia Digital',
			open: (t) => `Abrir ${t}`,
			'open.process': ', com processo',
			steps: (n) => `${n} etapas`,
			'step.of': (t, s) => `${t}, etapa: ${s}`,
			'fan.badge': (f) => `Fan art · ${f}`,
			'fan.of': (f) => `fan art de ${f}`,
			'source.behance': 'Ver no Behance', 'source.artstation': 'Ver no ArtStation',
			close: 'Fechar', 'step.prev': 'Quadro anterior', 'step.next': 'Próximo quadro', 'steps.label': 'Etapas',
			'cursor.view': 'Ver', 'cursor.process': 'Processo', 'cursor.enter': 'Entrar', 'cursor.photo': 'Próxima', 'cursor.play': 'Assistir',
			menu: 'Menu', 'menu.label': 'Menu', 'menu.open': 'Abrir menu', 'menu.close': 'Fechar', 'menu.close.label': 'Fechar menu', 'menu.profiles': 'Perfis',
		},
		en: {
			'meta.title': 'Daniel Hodge, illustrator and 2D animator',
			'meta.description': 'Portfolio of Daniel Hodge, illustrator and 2D animator. Games, animation and children’s books.',
			skip: 'Skip to content',
			'nav.label': 'Sections',
			'nav.games': 'Games', 'nav.animacao': 'Animation', 'nav.livros': 'Children’s books', 'nav.sketchbook': 'Sketchbook', 'nav.sobre': 'About',
			contact: 'Contact',
			'lang.label': 'Language',
			'home.label': 'Daniel Hodge, home',
			'intro.title': 'Daniel Hodge, illustrator and 2D&nbsp;animator',
			'doors.label': 'Choose where to start',
			'door.games.for': 'For game studios', 'door.animacao.for': 'For animation studios', 'door.livros.for': 'For publishers',
			'door.enter': 'Enter',
			works: (n) => `${n} works`,
			'order.note': (name, who) => `Starting with <strong>${name}</strong>, for ${who}.`,
			'order.reset': 'See the original order',
			'aud.games': 'game studios', 'aud.animacao': 'animation studios', 'aud.livros': 'publishers',
			'games.lead': 'Characters, splash and card art. Eight years in studios, between Rio and Kuala Lumpur.',
			'animacao.lead': 'From design to final frame: storyboard, camera layout, background and character.',
			'livros.lead': 'The Tito Club alphabet, one letter per page, and characters made for reading aloud.',
			'sketchbook.lead': 'Thumbnails, pose studies, storyboards and colored pencil: the piece solved before color.',
			'reel.title': 'For TV',
			'tv.lead': 'At BEELD in Rio, 2012–2013: design, illustration and animation for Rede Globo.',
			'award.kicker': 'Award',
			'award.watch': 'Watch the film',
			'award.source': 'Official winners list',
			'video.play': (title) => `Play: ${title}`,
			'video.length': 'Short film, 6 min',
			'about.role': 'illustrator and 2D animator.',
			'about.awards': 'Awards',
			'about.path': 'Career',
			'portrait.label': 'Photos of Daniel in Patagonia',
			'portrait.pause': 'Pause the photos', 'portrait.play': 'Play the photos', 'portrait.next': 'Next photo',
			footer: '© 2026 Daniel Hodge. Fan art is labeled as fan art; characters belong to their owners.',
			'footer.by': 'Site by', 'footer.by.label': 'Site made by Axia Digital',
			open: (t) => `Open ${t}`,
			'open.process': ', with process',
			steps: (n) => `${n} steps`,
			'step.of': (t, s) => `${t}, step: ${s}`,
			'fan.badge': (f) => `Fan art · ${f}`,
			'fan.of': (f) => `fan art of ${f}`,
			'source.behance': 'See on Behance', 'source.artstation': 'See on ArtStation',
			close: 'Close', 'step.prev': 'Previous frame', 'step.next': 'Next frame', 'steps.label': 'Steps',
			'cursor.view': 'View', 'cursor.process': 'Process', 'cursor.enter': 'Enter', 'cursor.photo': 'Next', 'cursor.play': 'Play',
			menu: 'Menu', 'menu.label': 'Menu', 'menu.open': 'Open menu', 'menu.close': 'Close', 'menu.close.label': 'Close menu', 'menu.profiles': 'Profiles',
		},
	};

	/* Data translations (PT → EN). */
	const KIND = {
		'Ilustração de personagem': 'Character illustration', 'Arte de card': 'Card art', Personagem: 'Character',
		Splash: 'Splash art', Retrato: 'Portrait', 'Ilustração': 'Illustration', 'Do design ao frame': 'From design to frame',
		'Projeto pessoal · cenários e personagens': 'Personal project · backgrounds and characters',
		'Cena e personagem': 'Scene and character', 'Livro infantil': 'Children’s book', 'Abecedário': 'Alphabet book',
		'Ilustração de livro': 'Book illustration', 'Projeto pessoal': 'Personal project', 'Esboço': 'Sketch',
		'Lápis de cor sobre papel': 'Colored pencil on paper', Storyboard: 'Storyboard', Nanquim: 'Ink',
	};
	const STEP = {
		Miniaturas: 'Thumbnails', Linha: 'Line', Valores: 'Values', Cor: 'Color', 'Esboços': 'Sketches', Final: 'Final',
		'Opções': 'Options', Design: 'Design', Storyboard: 'Storyboard', 'Layout 3D': '3D layout', 'Câmera': 'Camera',
		'Frame final': 'Final frame', Personagens: 'Characters', 'Expressões': 'Expressions', Figurino: 'Costume',
		Cena: 'Scene', Portal: 'Portal', 'Cenário': 'Background', Personagem: 'Character', 'Model sheet': 'Model sheet', Nanquim: 'Ink',
	};
	const TITLE = {
		feb: 'Brazilian Expeditionary Force soldier', space: 'Personal project', kitchen: 'In the kitchen', kings: 'The throne',
		dino: 'The dinosaur robot', chase: 'The chase', protetores: 'Tito and the Protectors',
		'sk-bear': 'Polar bear · thumbnails A, B, C', 'sk-witch': 'Witch, colored pencil', 'sk-fizz-a': 'Pirate · pose studies',
		'sk-robot': 'Giant robot · storyboard', 'sk-fizz-b': 'Pirate · lineup', 'sk-dont': 'Composition thumbnails', 'sk-monica': 'Ink',
	};

	const saved = (() => { try { return localStorage.getItem('dh-lang'); } catch { return null; } })();
	const fromUrl = new URLSearchParams(location.search).get('lang');
	const pick = (v) => (v === 'en' || v === 'pt' ? v : null);
	let lang = pick(fromUrl) || pick(saved) || ((navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en');

	const t = (key, ...args) => {
		const v = STR[lang][key] ?? STR.pt[key] ?? key;
		return typeof v === 'function' ? v(...args) : v;
	};
	/* Localized value: a { pt, en } object (Sanity; an empty en falls back to pt), or a Portuguese string. */
	const isLoc = (v) => v && typeof v === 'object';
	const L = (v) => (isLoc(v) ? v[lang] || v.pt || '' : v ?? '');
	const kind = (k) => (isLoc(k) ? L(k) : lang === 'en' ? KIND[k] || k || '' : k || '');
	const step = (s) => (isLoc(s) ? L(s) : lang === 'en' ? STEP[s] || s || '' : s || '');
	const title = (w) => (isLoc(w.title) ? L(w.title) : lang === 'en' ? TITLE[w.id] || w.title || '' : w.title || '');
	/* Content is editable in the Studio now: anything that is not our own markup is escaped before it
	   goes into innerHTML or an attribute. */
	const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
	/* Strings that come from the CMS (section leads): { pt: { key: value }, en: { … } }. */
	const extend = (more) => Object.entries(more).forEach(([l, map]) => {
		if (!STR[l]) return;
		Object.entries(map).forEach(([k, v]) => { STR[l][k] = esc(v); }); /* data-i18n writes innerHTML */
	});

	/* Static text: data-i18n="key" (innerHTML), data-i18n-attr="attr:key; attr:key". */
	const apply = (root = document) => {
		document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
		document.title = t('meta.title');
		document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
		root.querySelectorAll('[data-i18n]').forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
		root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
			el.dataset.i18nAttr.split(';').map((p) => p.trim()).filter(Boolean).forEach((pair) => {
				const [attr, key] = pair.split(':').map((s) => s.trim());
				el.setAttribute(attr, t(key));
			});
		});
	};

	const listeners = new Set();
	const set = (next) => {
		if (next === lang || !STR[next]) return;
		lang = next;
		try { localStorage.setItem('dh-lang', lang); } catch { /* private mode */ }
		const url = new URL(location.href);
		url.searchParams.set('lang', lang);
		history.replaceState(null, '', url);
		apply();
		listeners.forEach((fn) => fn(lang));
	};

	window.I18N = { get lang() { return lang; }, t, L, kind, step, title, esc, extend, apply, set, onChange: (fn) => listeners.add(fn) };
})();
