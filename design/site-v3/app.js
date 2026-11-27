/* Daniel Hodge, from his three sketches (27/11/2026). One page, three kinds of view, routed by query parameters:
     (none)               home: name and role, the three categories, one drawing in the middle
     ?category=<key>      a category: a grid, one card per project; the title shows over the faded card
     ?project=<slug>      a project: its images, large, one under the other, with its texts between them
   Content comes from the snapshot (../assets/projects.js) and the choices in data.js. History API: back, forward,
   reload and a link opened cold all land on the same view. A view change is a short cross-fade. */
(() => {
	const RAW = window.DH_SNAPSHOT || { projects: [] };
	const V = window.V3;
	const root = document.documentElement;
	const $ = (s, r = document) => r.querySelector(s);
	const $$ = (s, r = document) => [...r.querySelectorAll(s)];
	const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
	const mqHover = window.matchMedia('(hover: hover) and (pointer: fine)');
	const reduced = () => mqReduced.matches;

	/* ---------- language ---------- */
	const STR = {
		pt: {
			skip: 'Pular para o conteúdo',
			lang: 'Idioma',
			nav: 'Categorias',
			links: 'Daniel em outros sites',
			home: 'Daniel Hodge, início',
			description: 'Portfólio de Daniel Hodge, ilustrador e character designer: ilustração, projetos e livro infantil.',
			count: (n) => `${n} ${n === 1 ? 'projeto' : 'projetos'}`,
			imageOf: (title, n) => `${title}, imagem ${n}`,
			fan: (f) => `Fan art · ${f}`,
			next: 'Próximo projeto',
			missingTitle: 'Este projeto não está aqui',
			missingText: 'O endereço pode ter mudado. As categorias continuam no topo da página.',
			missingHome: 'Ir para o início',
			newTab: '(abre em outra aba)',
		},
		en: {
			skip: 'Skip to content',
			lang: 'Language',
			nav: 'Categories',
			links: 'Daniel elsewhere',
			home: 'Daniel Hodge, home',
			description: 'Portfolio of Daniel Hodge, illustrator and character designer: illustration, projects and children’s books.',
			count: (n) => `${n} ${n === 1 ? 'project' : 'projects'}`,
			imageOf: (title, n) => `${title}, image ${n}`,
			fan: (f) => `Fan art · ${f}`,
			next: 'Next project',
			missingTitle: 'This project is not here',
			missingText: 'The address may have changed. The categories are still at the top of the page.',
			missingHome: 'Go to the start',
			newTab: '(opens in a new tab)',
		},
	};
	const LANGS = ['pt', 'en'];
	const stored = () => { try { return localStorage.getItem('dh-lang'); } catch { return null; } };
	const fromUrl = () => new URLSearchParams(location.search).get('lang');
	let lang = [fromUrl(), stored(), (navigator.language || '').slice(0, 2) === 'pt' ? 'pt' : 'en'].find((x) => LANGS.includes(x));
	let langChosen = LANGS.includes(fromUrl()) || LANGS.includes(stored());
	const t = (k, ...a) => { const v = STR[lang][k]; return typeof v === 'function' ? v(...a) : v; };
	const other = () => (lang === 'pt' ? 'en' : 'pt');
	/* Localized text: an empty side falls back to the other (Daniel's Behance texts are in English only). */
	const L = (v) => (v == null ? '' : typeof v === 'string' ? v : (v[lang] || v[other()] || ''));
	const langAttr = (v) => (v && typeof v === 'object' && !v[lang] && v[other()] ? ` lang="${other()}"` : '');
	const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
	const para = (v) => esc(L(v)).split(/\n{2,}/).map((x) => `<p>${x.replace(/\n/g, '<br>')}</p>`).join('');

	/* ---------- images: Sanity CDN (resized on request) or a local file ---------- */
	const WIDTHS = [480, 800, 1200, 1800, 2400];
	const pic = (a) => {
		if (!a) return null;
		if (a.url) return { url: a.url, w: a.w, h: a.h, cdn: true };
		if (a.name) return { url: `../assets/img/${a.name}.jpg`, w: a.w, h: a.h };
		if (a.src) return { url: a.src, w: a.w, h: a.h };
		return null;
	};
	const src = (im, w = 1800) => (im.cdn ? `${im.url}?w=${Math.min(w, im.w)}&fit=max&auto=format` : im.url);
	const srcset = (im) => (im.cdn ? [...WIDTHS.filter((w) => w < im.w), Math.min(im.w, 2400)].map((w) => `${src(im, w)} ${w}w`).join(', ') : '');
	const imgTag = (im, { cls = '', alt = '', sizes = '100vw', eager = false, extra = '' } = {}) => {
		const set = srcset(im);
		return `<img class="${cls} is-loading" src="${esc(src(im))}"${set ? ` srcset="${esc(set)}" sizes="${sizes}"` : ''} alt="${esc(alt)}" width="${im.w}" height="${im.h}" decoding="async"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}${extra}>`;
	};
	/* Every image arrives with a short fade, once it is decoded (never a blank box popping into a picture). */
	const arrive = (scope) => $$('img.is-loading', scope).forEach((img) => {
		const done = () => img.classList.remove('is-loading');
		if (img.complete && img.naturalWidth) done();
		else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
	});

	/* ---------- content: the snapshot, remapped to the three categories of the sketch ---------- */
	const CATS = V.categories.map((c) => c.key);
	const catName = (key) => L(V.categories.find((c) => c.key === key)?.name);
	const hasText = (v) => !!(v && ((v.pt || '').trim() || (v.en || '').trim()));
	const PROJECTS = RAW.projects.map((p) => {
		const category = V.moves[p.slug] || V.remap[p.category];
		if (!CATS.includes(category) || !p.cover || !p.slug) return null;
		const flow = [
			{ type: 'image', img: pic(p.cover), caption: p.coverCaption, alt: p.coverAlt, cover: true },
			...(p.blocks || []).map((b) => {
				if (b._type === 'imageBlock' && pic(b.img)) return { type: 'image', img: pic(b.img), caption: b.caption, alt: b.alt, text: hasText(b.text) ? b.text : null };
				if (b._type === 'textBlock' && hasText(b.text)) return { type: 'text', text: b.text };
				return null;
			}).filter(Boolean),
		];
		return { slug: p.slug, title: p.title, year: p.year, fan: p.fan, intro: hasText(p.intro) ? p.intro : null, category, cover: pic(p.cover), flow };
	}).filter(Boolean);
	const bySlug = Object.create(null); /* ?project=constructor must not find Object's own properties */
	PROJECTS.forEach((p) => { bySlug[p.slug] = p; });
	const byCat = Object.fromEntries(CATS.map((k) => [k, PROJECTS.filter((p) => p.category === k)]));
	const homePic = (ref) => {
		if (ref?.project && bySlug[ref.project]) return { im: bySlug[ref.project].cover, alt: bySlug[ref.project].title };
		if (ref?.src) return { im: pic(ref), alt: ref.alt };
		return null;
	};

	/* ---------- routes ---------- */
	const LEGACY = { illustrations: 'illustration', 'personal-art': 'illustration', 'character-design': 'projects', 'childrens-books': 'childrens-book' };
	const parse = () => {
		const q = new URLSearchParams(location.search);
		const slug = q.get('project');
		if (slug) return bySlug[slug] ? { name: 'project', slug } : { name: 'missing' };
		const c = q.get('category');
		if (c) { const key = LEGACY[c] || c; return CATS.includes(key) ? { name: 'category', key } : { name: 'missing' }; }
		return { name: 'home' };
	};
	const href = (params = {}) => {
		const q = new URLSearchParams(params);
		if (langChosen) q.set('lang', lang);
		const s = q.toString();
		return s ? `?${s}` : location.pathname;
	};
	let route = parse();

	/* ---------- the frame: name, menu, links ---------- */
	const frame = () => {
		root.lang = lang;
		$$('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
		$('[data-roles]').textContent = L(V.roles);
		const home = $('[data-home]');
		home.href = href();
		home.setAttribute('aria-label', `${V.name}, ${L(V.roles)}`);
		if (route.name === 'home') home.setAttribute('aria-current', 'page'); else home.removeAttribute('aria-current');
		$('[data-lang-group]').setAttribute('aria-label', t('lang'));
		$$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
		$('[data-menu]').setAttribute('aria-label', t('nav'));
		const active = route.name === 'category' ? route.key : route.name === 'project' ? bySlug[route.slug].category : null;
		$('[data-menu-list]').innerHTML = CATS.map((key) => `<li class="menu__entry"><a class="menu__item" href="${esc(href({ category: key }))}" data-route data-cat="${key}"${key === active ? ` aria-current="${route.name === 'category' ? 'page' : 'true'}"` : ''}>${esc(catName(key))}</a></li>`).join('');
		const links = V.links.filter(([, url]) => /^https:\/\//.test(url || ''));
		const foot = $('[data-links]');
		foot.setAttribute('aria-label', t('links'));
		foot.innerHTML = links.map(([label, url]) => `<li class="foot__entry"><a class="foot__link" href="${esc(url)}" target="_blank" rel="noopener me">${esc(label)}<span class="sr-only"> ${t('newTab')}</span></a></li>`).join('');
		foot.hidden = !links.length;
	};

	/* ---------- views ---------- */
	const homeView = () => {
		const keys = ['default', ...CATS];
		const layers = keys.map((k) => [k, homePic(V.home[k])]).filter(([, x]) => x?.im);
		return `<h1 id="page-title" class="sr-only" tabindex="-1">${esc(V.name)}, ${esc(L(V.roles))}</h1>
			<div class="stage" data-stage>
				${layers.map(([k, x]) => (k === 'default'
					? imgTag(x.im, { cls: 'stage__img is-on', alt: L(x.alt), sizes: '(max-width: 767px) 80vw, 36vw', eager: true, extra: ` data-layer="${k}"` })
					: `<img class="stage__img is-loading" data-layer="${k}" data-src="${esc(src(x.im, 1200))}" alt="" aria-hidden="true" width="${x.im.w}" height="${x.im.h}" decoding="async">`)).join('')}
			</div>`;
	};

	const categoryView = (key) => {
		const list = byCat[key];
		return `<h1 id="page-title" class="sr-only" tabindex="-1">${esc(catName(key))}, ${t('count', list.length)}</h1>
			<ul class="grid" role="list">
				${list.map((p, k) => `<li class="card">
					<a class="card__link" href="${esc(href({ project: p.slug }))}" data-route>
						<span class="card__media">${imgTag(p.cover, { cls: 'card__img', sizes: '(max-width: 559px) 92vw, (max-width: 1023px) 46vw, 25rem', eager: k < 3, extra: V.focus[p.slug] ? ` data-focus="${esc(V.focus[p.slug])}"` : '' })}</span>
						<span class="card__title"${langAttr(p.title)}>${esc(L(p.title))}</span>
					</a>
				</li>`).join('')}
			</ul>`;
	};

	const projectView = (slug) => {
		const p = bySlug[slug];
		const title = L(p.title);
		const meta = [p.year, p.fan ? t('fan', p.fan) : ''].filter(Boolean).join(' · ');
		let n = 0;
		const flow = p.flow.map((b) => {
			if (b.type === 'text') return `<div class="prose"${langAttr(b.text)}>${para(b.text)}</div>`;
			n += 1;
			const alt = L(b.alt) || (n === 1 ? title : t('imageOf', title, n));
			return `<figure class="plate">
					${imgTag(b.img, { cls: 'plate__img', alt, sizes: '(max-width: 1279px) 94vw, 72rem', eager: n === 1, extra: ` style="--r:${(b.img.w / b.img.h).toFixed(4)}"` })}
					${L(b.caption) ? `<figcaption class="plate__caption"${langAttr(b.caption)}>${esc(L(b.caption))}</figcaption>` : ''}
				</figure>${b.text ? `<div class="prose"${langAttr(b.text)}>${para(b.text)}</div>` : ''}`;
		}).join('');
		const list = byCat[p.category];
		const next = list.length > 1 ? list[(list.indexOf(p) + 1) % list.length] : null;
		return `<article class="work">
				<header class="work__head">
					<h1 id="page-title" class="work__title" tabindex="-1"${langAttr(p.title)}>${esc(title)}</h1>
					${meta ? `<p class="work__meta">${esc(meta)}</p>` : ''}
				</header>
				${p.intro ? `<div class="prose work__intro"${langAttr(p.intro)}>${para(p.intro)}</div>` : ''}
				<div class="work__flow">${flow}</div>
				${next ? `<nav class="work__next" aria-label="${t('next')}"><a class="next" href="${esc(href({ project: next.slug }))}" data-route><span class="next__label">${t('next')}</span><span class="next__title"${langAttr(next.title)}>${esc(L(next.title))}</span></a></nav>` : ''}
			</article>`;
	};

	const missingView = () => `<div class="missing">
			<h1 id="page-title" class="missing__title" tabindex="-1">${t('missingTitle')}</h1>
			<p>${t('missingText')}</p>
			<p><a class="text-link" href="${esc(href())}" data-route>${t('missingHome')}</a></p>
		</div>`;

	const metaFor = (r) => {
		const base = `${V.name} · ${L(V.roles)}`;
		if (r.name === 'category') return `${catName(r.key)[0].toUpperCase()}${catName(r.key).slice(1)} · ${V.name}`;
		if (r.name === 'project') return `${L(bySlug[r.slug].title)} · ${V.name}`;
		if (r.name === 'missing') return `${t('missingTitle')} · ${V.name}`;
		return base;
	};

	const view = $('[data-view]');
	const render = () => {
		route = parse();
		frame();
		root.dataset.view = route.name;
		document.title = metaFor(route);
		$('meta[name="description"]')?.setAttribute('content', t('description'));
		view.innerHTML = route.name === 'home' ? homeView() : route.name === 'category' ? categoryView(route.key) : route.name === 'project' ? projectView(route.slug) : missingView();
		$$('img[data-focus]', view).forEach((img) => { img.style.objectPosition = img.dataset.focus; });
		arrive(view);
		stage();
	};

	/* ---------- the home drawing: the menu item under the pointer (or the focus) shows its own ---------- */
	let stageTimer = 0;
	let stageShow = null; /* set while the home is on screen */
	const stage = () => {
		const box = $('[data-stage]', view);
		if (!box) { stageShow = null; return; }
		const layers = $$('[data-layer]', box);
		const load = () => layers.forEach((img) => { if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; arrive(box); } });
		stageShow = (key) => {
			clearTimeout(stageTimer);
			if (key !== 'default') load();
			const target = layers.some((l) => l.dataset.layer === key) ? key : 'default';
			layers.forEach((l) => l.classList.toggle('is-on', l.dataset.layer === target));
		};
		/* the other drawings load once the page is quiet, so the first hover already has them */
		const idle = () => { if (mqHover.matches) load(); };
		const later = () => (window.requestIdleCallback ? window.requestIdleCallback(idle, { timeout: 2500 }) : setTimeout(idle, 1200));
		if (document.readyState === 'complete') later();
		else window.addEventListener('load', later, { once: true });
	};
	const rest = () => { clearTimeout(stageTimer); stageTimer = setTimeout(() => stageShow?.('default'), 140); };
	const menu = $('[data-menu]');
	menu.addEventListener('pointerover', (e) => { const a = e.target.closest('[data-cat]'); if (a && mqHover.matches) stageShow?.(a.dataset.cat); });
	menu.addEventListener('pointerleave', () => { if (stageShow) rest(); });
	menu.addEventListener('focusin', (e) => { const a = e.target.closest('[data-cat]'); if (a) stageShow?.(a.dataset.cat); });
	menu.addEventListener('focusout', (e) => { if (stageShow && !menu.contains(e.relatedTarget)) rest(); });

	/* ---------- moving between views ---------- */
	const keep = () => history.replaceState({ ...(history.state || {}), y: scrollY }, '');
	let keepTimer = 0;
	addEventListener('scroll', () => { clearTimeout(keepTimer); keepTimer = setTimeout(keep, 250); }, { passive: true });
	if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

	/* A short cross-fade (view transition); without one, the new view fades in on its own. */
	const swap = (update) => {
		if (reduced()) { update(); return Promise.resolve(); }
		if (document.startViewTransition) {
			root.classList.add('is-routing');
			const vt = document.startViewTransition(update);
			vt.ready.catch(() => {});
			return vt.finished.catch(() => {}).finally(() => root.classList.remove('is-routing'));
		}
		update();
		view.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
		return Promise.resolve();
	};
	const show = ({ y = 0, focus = true } = {}) => swap(() => {
		render();
		window.scrollTo({ top: y, behavior: 'instant' });
	}).then(() => { if (focus) $('#page-title', view)?.focus({ preventScroll: true }); });

	const navigate = (url) => {
		const next = new URL(url, location.href);
		if (next.pathname + next.search === location.pathname + location.search) {
			window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
			return;
		}
		clearTimeout(keepTimer);
		keep();
		history.pushState({ y: 0 }, '', next);
		show();
	};
	document.addEventListener('click', (e) => {
		const a = e.target.closest('a[data-route], a[data-home]');
		if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		e.preventDefault();
		navigate(a.href);
	});
	addEventListener('popstate', () => show({ y: history.state?.y || 0, focus: false }));

	/* ---------- language: redrawn in place, same place on the page ---------- */
	$('[data-lang-group]').addEventListener('click', (e) => {
		const b = e.target.closest('[data-lang]');
		if (!b || b.dataset.lang === lang) return;
		lang = b.dataset.lang;
		langChosen = true;
		try { localStorage.setItem('dh-lang', lang); } catch { /* private mode */ }
		const url = new URL(location.href);
		url.searchParams.set('lang', lang);
		history.replaceState(history.state, '', url);
		const y = scrollY;
		swap(() => { render(); window.scrollTo({ top: y, behavior: 'instant' }); });
	});

	/* ---------- first paint ---------- */
	render();
	const y = history.state?.y;
	if (y) requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' }));
	root.classList.add('is-ready');
})();
