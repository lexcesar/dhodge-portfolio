/* PT/EN. Language comes from ?lang=, then the saved choice, then the browser.
   Content from Sanity is localized per field ({ pt, en }); an empty side falls back to the other one, so a text
   Daniel wrote only in English (or only in Portuguese) still shows in both languages. Strings here are the UI. */
(() => {
	const STR = {
		pt: {
			'meta.title': 'Daniel Hodge · Ilustrador, character designer e autor',
			'meta.description': 'Portfólio de Daniel Hodge: character design, ilustração, livros infantis e arte pessoal.',
			skip: 'Pular para o conteúdo',
			'nav.label': 'Categorias',
			'cat.character-design': 'Character design',
			'cat.illustrations': 'Ilustração',
			'cat.childrens-books': 'Livros infantis',
			'cat.personal-art': 'Arte pessoal',
			roles: 'Ilustrador · Character designer · Autor',
			about: 'Sobre',
			'lang.label': 'Idioma',
			'home.label': 'Daniel Hodge, início',
			'home.who': 'Daniel Hodge: ',
			projects: (n) => `${n} ${n === 1 ? 'projeto' : 'projetos'}`,
			images: (n) => `${n} ${n === 1 ? 'imagem' : 'imagens'}`,
			back: (c) => `Voltar para ${c}`,
			'next.project': 'Próximo projeto',
			'next.up': 'A seguir',
			'fan.badge': (f) => `Fan art · ${f}`,
			'fan.of': (f) => `fan art de ${f}`,
			'source.behance': 'Ver no Behance', 'source.artstation': 'Ver no ArtStation', 'source.other': 'Ver a fonte',
			open: (t) => `Abrir ${t}`,
			'open.project': 'Ver o projeto',
			zoom: (t) => `Ampliar: ${t}`,
			'image.of': (t, n) => `${t}, imagem ${n}`,
			close: 'Fechar', 'step.prev': 'Imagem anterior', 'step.next': 'Próxima imagem', 'steps.label': 'Imagens do projeto',
			'missing.title': 'Este projeto não está aqui',
			'missing.text': 'O endereço pode ter mudado. As quatro categorias continuam no topo da página.',
			'missing.home': 'Ir para o início',
			profiles: 'Perfis',
			footer: '© 2026 Daniel Hodge. Fan art marcada como fan art; personagens pertencem aos seus donos.',
			'footer.by': 'Site por', 'footer.by.label': 'Site feito pela Axia Digital',
			menu: 'Menu', 'menu.label': 'Menu', 'menu.open': 'Abrir menu', 'menu.close': 'Fechar', 'menu.close.label': 'Fechar menu',
			loading: 'Carregando',
			/* About */
			'about.title': 'Sobre',
			'about.awards': 'Prêmios',
			'about.path': 'Trajetória',
			'portrait.label': 'Fotos do Daniel na Patagônia',
			'portrait.pause': 'Pausar as fotos', 'portrait.play': 'Tocar as fotos', 'portrait.next': 'Próxima foto',
			'award.watch': 'Assistir ao filme',
			'award.source': 'Lista oficial de premiados',
			'reel.title': 'Para a TV',
			'tv.lead': 'Na BEELD, no Rio, entre 2012 e 2013: design, ilustração e animação para a Rede Globo.',
			'video.play': (title) => `Assistir: ${title}`,
			'video.length': 'Curta, 6 min',
		},
		en: {
			'meta.title': 'Daniel Hodge · Illustrator, character designer and author',
			'meta.description': 'Portfolio of Daniel Hodge: character design, illustrations, children’s books and personal art.',
			skip: 'Skip to content',
			'nav.label': 'Categories',
			'cat.character-design': 'Character Design',
			'cat.illustrations': 'Illustrations',
			'cat.childrens-books': 'Children’s Books',
			'cat.personal-art': 'Personal Art',
			roles: 'Illustrator · Character Designer · Author',
			about: 'About',
			'lang.label': 'Language',
			'home.label': 'Daniel Hodge, home',
			'home.who': 'Daniel Hodge: ',
			projects: (n) => `${n} ${n === 1 ? 'project' : 'projects'}`,
			images: (n) => `${n} ${n === 1 ? 'image' : 'images'}`,
			back: (c) => `Back to ${c}`,
			'next.project': 'Next project',
			'next.up': 'Up next',
			'fan.badge': (f) => `Fan art · ${f}`,
			'fan.of': (f) => `fan art of ${f}`,
			'source.behance': 'See on Behance', 'source.artstation': 'See on ArtStation', 'source.other': 'See the source',
			open: (t) => `Open ${t}`,
			'open.project': 'See the project',
			zoom: (t) => `Enlarge: ${t}`,
			'image.of': (t, n) => `${t}, image ${n}`,
			close: 'Close', 'step.prev': 'Previous image', 'step.next': 'Next image', 'steps.label': 'Project images',
			'missing.title': 'This project isn’t here',
			'missing.text': 'The address may have changed. The four categories are still at the top of the page.',
			'missing.home': 'Go to the home page',
			profiles: 'Profiles',
			footer: '© 2026 Daniel Hodge. Fan art is labeled as fan art; characters belong to their owners.',
			'footer.by': 'Site by', 'footer.by.label': 'Site made by Axia Digital',
			menu: 'Menu', 'menu.label': 'Menu', 'menu.open': 'Open menu', 'menu.close': 'Close', 'menu.close.label': 'Close menu',
			loading: 'Loading',
			'about.title': 'About',
			'about.awards': 'Awards',
			'about.path': 'Career',
			'portrait.label': 'Photos of Daniel in Patagonia',
			'portrait.pause': 'Pause the photos', 'portrait.play': 'Play the photos', 'portrait.next': 'Next photo',
			'award.watch': 'Watch the film',
			'award.source': 'Official winners list',
			'reel.title': 'For TV',
			'tv.lead': 'At BEELD in Rio, 2012–2013: design, illustration and animation for Rede Globo.',
			'video.play': (title) => `Play: ${title}`,
			'video.length': 'Short film, 6 min',
		},
	};

	const saved = (() => { try { return localStorage.getItem('dh-lang'); } catch { return null; } })();
	const fromUrl = new URLSearchParams(location.search).get('lang');
	const pick = (v) => (v === 'en' || v === 'pt' ? v : null);
	let lang = pick(fromUrl) || pick(saved) || ((navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en');

	const t = (key, ...args) => {
		const v = STR[lang][key] ?? STR.pt[key] ?? key;
		return typeof v === 'function' ? v(...args) : v;
	};
	/* Localized value: a { pt, en } object (an empty side falls back to the other), or a plain string. */
	const isLoc = (v) => v && typeof v === 'object';
	const other = () => (lang === 'en' ? 'pt' : 'en');
	const L = (v) => (isLoc(v) ? v[lang] || v[other()] || '' : v ?? '');
	/* The language a localized value is actually shown in (for lang="" on text Daniel wrote in only one). */
	const langOf = (v) => (isLoc(v) && !v[lang] && v[other()] ? other() : lang);
	/* Content is editable in the Studio: anything that is not our own markup is escaped before it goes into
	   innerHTML or an attribute. */
	const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

	/* Static text: data-i18n="key" (innerHTML), data-i18n-attr="attr:key; attr:key". */
	const apply = (root = document) => {
		document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
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
		history.replaceState(history.state, '', url);
		apply();
		listeners.forEach((fn) => fn(lang));
	};

	window.I18N = { get lang() { return lang; }, t, L, langOf, esc, apply, set, onChange: (fn) => listeners.add(fn) };
})();
