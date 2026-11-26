/* The site: one page, four kinds of view, routed by query parameters (the host serves files as they are, and the
   Studio's visual editor percent-encodes a #hash):
     (none)               home: logo, roles, the four categories, one illustration
     ?category=<key>      a category: its projects, one cover each
     ?project=<slug>      a project: the cover, then its images and texts, top to bottom
     ?page=about          about: bio, photos, award, TV work, career
   History API: back, forward, reload and a link opened cold all land on the same view. A view change is a short
   cross-fade; only a project's cover travels, to the same picture on the next page. The interface stays quiet:
   the drawings are the show. */
(() => {
	const { HOME, PROFILE, I18N, DH, Motion } = window;
	const { t, L, esc } = I18N;
	const { CATS, src, srcset, bySlug, byCat, images, altOf, editAttr, langAttr, card, openViewer, fadeIn, icon, href, reduced } = DH;
	const root = document.documentElement;
	const $ = (s, r = document) => r.querySelector(s);
	const $$ = (s, r = document) => [...r.querySelectorAll(s)];
	const view = $('[data-view]');
	const bar = $('[data-bar]');
	const block = (name, fn) => { try { return fn(); } catch (e) { console.error(`render: ${name}`, e); return ''; } };
	const catName = (key) => t(`cat.${key}`);
	const nextOf = (list, x) => list[(list.indexOf(x) + 1) % list.length];

	/* ---------- routes ---------- */
	const LEGACY = { games: 'illustrations', livros: 'childrens-books', sketchbook: 'personal-art' };
	const parse = (url = location) => {
		const q = new URLSearchParams(url.search);
		if (q.get('project')) return { name: 'project', slug: q.get('project') };
		if (q.get('category')) return CATS.includes(q.get('category')) ? { name: 'category', key: q.get('category') } : { name: 'home' };
		if (q.get('page') === 'about') return { name: 'about' };
		return { name: 'home' };
	};
	/* Addresses of the previous site (?para=games#games, #sobre…) land on their place in this one. */
	const legacy = () => {
		const q = new URLSearchParams(location.search);
		const old = q.get('para') || location.hash.slice(1);
		if (!old) return;
		if (old === 'main') { history.replaceState(history.state, '', location.pathname + location.search); return; }
		const to = Object.hasOwn(LEGACY, old) ? { category: LEGACY[old] } : ['animacao', 'anima-mundi', 'sobre', 'contato'].includes(old) ? { page: 'about' } : null;
		if (to || q.has('para')) history.replaceState(history.state, '', href(to || {}));
	};

	/* ---------- shared bits ---------- */
	const roles = () => L(HOME.roles) || t('roles');
	const logo = (cls) => (HOME.logo
		? `<img class="${cls}__img" src="${src(HOME.logo, 1200)}"${editAttr({ edit: HOME.logoEdit })} alt="Daniel Hodge" width="${HOME.logoW}" height="${HOME.logoH}" decoding="async">`
		: `<span class="${cls}__type">Daniel Hodge</span>`);
	const count = (key) => byCat[key]?.length || 0;
	const sourceLink = (p) => {
		if (!p.source) return '';
		const label = p.source.includes('behance.net') ? t('source.behance') : p.source.includes('artstation.com') ? t('source.artstation') : t('source.other');
		return `<a class="link link--out" href="${esc(p.source)}" target="_blank" rel="noopener">${label}${icon.out}</a>`;
	};
	const para = (v) => esc(L(v)).split(/\n{2,}/).map((x) => `<p>${x.replace(/\n/g, '<br>')}</p>`).join('');

	/* ---------- home ---------- */
	const homeView = () => `
		<section class="title-page" aria-labelledby="page-title">
			<h1 id="page-title" class="title-page__head" tabindex="-1">
				<span class="mark">${logo('mark')}</span>
				<span class="title-page__roles"><span class="sr-only">, </span>${roles().split(/\s*·\s*/).map((r) => `<span class="title-page__role">${esc(r)}</span>`).join(' · ')}</span>
			</h1>
		</section>
		<nav class="toc" data-toc aria-label="${t('nav.label')}">
			<ul class="toc__list">${CATS.map((key, i) => `
				<li class="toc__entry is-cat-${key}" style="--i:${i}">
					<a class="toc__item" href="${href({ category: key })}" data-route data-cat="${key}">
						<span class="toc__ink" aria-hidden="true"></span>
						<span class="toc__name">${esc(catName(key))}</span>
						<span class="toc__count"><span aria-hidden="true">${count(key)}</span><span class="sr-only">, ${t('projects', count(key))}</span>${icon.arrow}</span>
					</a>
				</li>`).join('')}
			</ul>
		</nav>
		<figure class="stage">
			<div class="stage__frame" style="--r:${(HOME.heroW / HOME.heroH).toFixed(4)}">
				<img class="stage__hero" src="${src(HOME.hero, 1800)}" srcset="${srcset(HOME.hero)}" sizes="(max-width: 1919px) 94vw, 1800px"${editAttr({ edit: HOME.heroEdit })} alt="${esc(L(HOME.heroAlt))}" width="${HOME.heroW}" height="${HOME.heroH}" decoding="async" fetchpriority="high">
			</div>
		</figure>`;

	/* ---------- category ---------- */
	const categoryView = (key) => {
		const list = byCat[key] || [];
		const [lead, ...rest] = list;
		const next = nextOf(CATS, key);
		const leadHtml = lead ? (() => {
			const n = images(lead).length;
			const name = esc(L(lead.title));
			return `
			<div class="lead" style="--r:${(lead.w / lead.h).toFixed(4)}">
				<a class="lead__open" href="${href({ project: lead.slug })}" data-route aria-label="${t('open', name)}">
					<img class="lead__img" src="${src(lead.cover, 1800)}" srcset="${srcset(lead.cover)}" sizes="(max-width: 1023px) 92vw, 62vw"${editAttr(lead)} data-cover="${esc(lead.slug)}" alt="" width="${lead.w}" height="${lead.h}" decoding="async">
				</a>
				<div class="lead__side">
					<h2 class="lead__title"><a href="${href({ project: lead.slug })}" data-route>${name}</a></h2>
					<p class="lead__meta">${[lead.year && esc(lead.year), n > 1 && t('images', n)].filter(Boolean).join(' · ')}</p>
					${lead.fan ? `<p><span class="badge">${t('fan.badge', esc(lead.fan))}</span></p>` : ''}
					${L(lead.intro) ? `<p class="lead__intro"${langAttr(lead.intro)}>${esc(L(lead.intro))}</p>` : ''}
					<a class="pill" href="${href({ project: lead.slug })}" data-route tabindex="-1" aria-hidden="true">${t('open.project')}${icon.arrow}</a>
				</div>
			</div>`;
		})() : '';
		return `
		<header class="chapter is-cat-${key}">
			<h1 id="page-title" class="chapter__title" tabindex="-1"><span class="chapter__ink" aria-hidden="true"></span><span>${esc(catName(key))}</span></h1>
			<p class="chapter__count">${t('projects', list.length)}</p>
		</header>
		<div class="chapter__body is-cat-${key}">
			${leadHtml}
			${rest.length ? '<div class="shelf" data-shelf></div>' : ''}
		</div>
		<a class="door is-cat-${next}" href="${href({ category: next })}" data-route>
			<span class="door__kicker">${t('next.up')}</span>
			<span class="door__name"><span class="door__ink" aria-hidden="true"></span>${esc(catName(next))}</span>
			<span class="door__count">${t('projects', count(next))}${icon.arrow}</span>
		</a>`;
	};
	const fillShelf = (key) => {
		const shelf = $('[data-shelf]', view);
		if (shelf) shelf.replaceChildren(...(byCat[key] || []).slice(1).map((p, k) => card(p, k)));
	};

	/* ---------- project ---------- */
	const figure = (p, im, k, cls) => {
		const r = im.w / im.h;
		const shape = r >= 1.15 ? 'is-wide' : r <= 0.87 ? 'is-tall' : 'is-square';
		const cap = L(im.caption);
		const text = L(im.text);
		return `
			<figure class="${cls} ${shape}" style="--r:${r.toFixed(4)}">
				<button class="${cls}__zoom" type="button" data-zoom="${k}" aria-label="${t('zoom', esc(altOf(p, im, k)))}">
					<img class="${cls}__img" src="${src(im.img, 1800)}" srcset="${srcset(im.img)}" sizes="(max-width: 1023px) 94vw, 80vw"${editAttr(im)} data-img="${esc(im.img)}"${k === 0 ? ` data-cover="${esc(p.slug)}"` : ''} alt="${esc(altOf(p, im, k))}" width="${im.w}" height="${im.h}" ${k === 0 ? 'decoding="async" fetchpriority="high"' : 'loading="lazy" decoding="async"'}>
				</button>
				${cap || text ? `<figcaption class="${cls}__caption">${cap ? `<span class="${cls}__label"${langAttr(im.caption)}>${esc(cap)}</span>` : ''}${text ? `<span class="${cls}__text"${langAttr(im.text)}>${para(im.text)}</span>` : ''}</figcaption>` : ''}
			</figure>`;
	};
	const projectView = (p) => {
		const list = byCat[p.category] || [p];
		const next = list.length > 1 ? nextOf(list, p) : null;
		let k = 0;
		const blocks = p.blocks.map((b) => (b.type === 'image'
			? figure(p, b, ++k, 'block')
			: `<div class="block block--text prose"${langAttr(b.text)}>${para(b.text)}</div>`)).join('');
		return `
		<article class="project is-cat-${p.category}">
			<header class="project__head">
				<a class="back" href="${href({ category: p.category })}" data-route>${icon.back}<span class="back__ink" aria-hidden="true"></span><span>${esc(catName(p.category))}</span></a>
				<h1 id="page-title" class="project__title" tabindex="-1">${esc(L(p.title))}</h1>
				<p class="project__meta">
					${p.year ? `<span>${esc(p.year)}</span>` : ''}
					${p.fan ? `<span class="badge">${t('fan.badge', esc(p.fan))}</span>` : ''}
					${sourceLink(p)}
				</p>
			</header>
			${figure(p, images(p)[0], 0, 'cover')}
			${L(p.intro) ? `<div class="project__intro prose"${langAttr(p.intro)}>${para(p.intro)}</div>` : ''}
			${blocks ? `<div class="project__blocks">${blocks}</div>` : ''}
			<nav class="project__end" aria-label="${t('next.project')}">
				${next ? `
				<a class="next" href="${href({ project: next.slug })}" data-route>
					<span class="next__thumb"><img src="${src(next.cover, 800)}" data-cover="${esc(next.slug)}" alt="" width="${next.w}" height="${next.h}" loading="lazy" decoding="async"></span>
					<span class="next__text"><span class="next__kicker">${t('next.project')}</span><span class="next__title">${esc(L(next.title))}</span></span>
					${icon.arrow}
				</a>` : ''}
				<a class="back back--end" href="${href({ category: p.category })}" data-route>${icon.back}<span>${t('back', esc(catName(p.category)))}</span></a>
			</nav>
		</article>`;
	};
	const missingView = () => `
		<section class="missing">
			<h1 id="page-title" class="missing__title" tabindex="-1">${t('missing.title')}</h1>
			<p class="missing__text">${t('missing.text')}</p>
			<a class="pill" href="${href()}" data-route>${t('missing.home')}${icon.arrow}</a>
		</section>`;

	/* ---------- about ---------- */
	const aboutView = () => {
		const a = PROFILE.award || {};
		return `
		<header class="chapter chapter--about">
			<h1 id="page-title" class="chapter__title" tabindex="-1"><span>${t('about.title')}</span></h1>
			<p class="about__bio"${langAttr(PROFILE.bio)}><strong>${esc(PROFILE.name)}</strong>. ${esc(L(PROFILE.bio))}</p>
		</header>
		<div class="about__body">
			${PROFILE.photos?.length ? `<figure class="portrait" data-portrait>
				<button class="portrait__screen" type="button" data-portrait-next aria-label="${t('portrait.next')}">
					<span class="portrait__stack" data-portrait-stack></span>
					<span class="portrait__glitch" aria-hidden="true">
						<img class="portrait__chroma portrait__chroma--r" alt="" data-chroma="r">
						<img class="portrait__chroma portrait__chroma--c" alt="" data-chroma="c">
						<span class="portrait__slices" data-slices></span>
						<svg class="portrait__noise" viewBox="0 0 240 180" preserveAspectRatio="none"><rect width="100%" height="100%" filter="url(#dh-noise)"/></svg>
					</span>
				</button>
				<figcaption class="portrait__caption">
					<span class="portrait__text" data-portrait-caption></span>
					<span class="portrait__count" data-portrait-count></span>
					<button class="icon-button icon-button--small" type="button" data-portrait-toggle aria-pressed="false"></button>
				</figcaption>
			</figure>` : ''}
			<div class="about__side">
				${a.work ? `<div class="about__block">
					<h2 class="about__label">${t('about.awards')}</h2>
					<a class="about__award" href="#premio" data-scroll="premio"><span class="about__award-name">${esc(a.festival || 'Anima Mundi')} ${esc(a.year)}</span><span class="about__award-place">${esc(a.work)} · ${esc(L(a.prize))}</span></a>
				</div>` : ''}
				<div class="about__block">
					<h2 class="about__label">${t('about.path')}</h2>
					<ol class="timeline">${(PROFILE.timeline || []).map(([when, where, what]) => `<li><span class="timeline__when">${esc(when)}</span><span class="timeline__where">${esc(where)}</span><span class="timeline__what">${esc(L(what))}</span></li>`).join('')}</ol>
				</div>
			</div>
		</div>
		${a.work ? `<section class="award" id="premio" tabindex="-1" aria-labelledby="award-title">
			<div class="award__inner">
				<div class="award__media" data-award-media></div>
				<div class="award__text">
					<p class="award__kicker">${esc(a.festival || 'Anima Mundi')} ${esc(a.year)}${L(a.given) ? ` · ${esc(L(a.given))}` : ''}</p>
					<h2 id="award-title" class="award__title">${esc(a.work)}</h2>
					<p class="award__prize">${esc(L(a.prize))}</p>
					${L(a.credits) ? `<p class="award__credits">${esc(L(a.credits))}</p>` : ''}
					${L(a.about) ? `<p class="award__about">${esc(L(a.about))}</p>` : ''}
					<ul class="award__making" data-award-making></ul>
					${a.source ? `<a class="link link--out award__source" href="${esc(a.source)}" target="_blank" rel="noopener">${t('award.source')}${icon.out}</a>` : ''}
				</div>
			</div>
		</section>` : ''}
		${(PROFILE.tv || []).length ? `<section class="tv" aria-labelledby="tv-title">
			<header class="tv__head">
				<h2 id="tv-title" class="tv__title">${t('reel.title')}</h2>
				<p class="tv__lead">${t('tv.lead')}</p>
			</header>
			<ul class="tv__list" data-tv></ul>
			${L(PROFILE.tvAlso) ? `<p class="tv__also">${esc(L(PROFILE.tvAlso))}</p>` : ''}
		</section>` : ''}`;
	};

	/* Video facade: a still with a play button; the player (YouTube no-cookie / Vimeo do-not-track) loads only on
	   click, and starting one video stops any other. */
	const EMBED = {
		youtube: (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`,
		vimeo: (id) => { const [v, h] = String(id).split(':'); return `https://player.vimeo.com/video/${v}?${h ? `h=${h}&` : ''}autoplay=1&dnt=1&title=0&byline=0&portrait=0`; },
	};
	const stopVideos = () => $$('.video.is-playing').forEach((box) => { box.querySelector('.video__frame')?.remove(); box.classList.remove('is-playing'); });
	const video = ([platform, id], still, name, label = '', note = '') => {
		const box = document.createElement('div');
		box.className = 'video';
		box.innerHTML = `
			<button class="video__facade" type="button" aria-label="${t('video.play', esc(name))}">
				${still ? `<img class="video__still" src="${src(still, 1200)}" alt="" loading="lazy" decoding="async">` : ''}
				<span class="video__play" aria-hidden="true">${icon.play}</span>
				${label || note ? `<span class="video__label">${esc(label)}${note ? `<span class="video__note">${esc(note)}</span>` : ''}</span>` : ''}
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
	const wireAbout = () => {
		const a = PROFILE.award || {};
		const media = $('[data-award-media]', view);
		if (media && a.video) media.replaceChildren(video(a.video, a.still, a.work, t('award.watch'), t('video.length')));
		const making = $('[data-award-making]', view);
		if (making) making.replaceChildren(...(a.making || []).map(([id, label, still]) => { const li = document.createElement('li'); li.append(video(id, still, L(label), L(label))); return li; }));
		const tv = $('[data-tv]', view);
		if (tv) tv.replaceChildren(...(PROFILE.tv || []).map((v, k) => {
			const li = document.createElement('li');
			li.className = `tv__item${k === 0 ? ' tv__item--lead' : ''}`;
			const cap = document.createElement('div');
			cap.className = 'tv__caption';
			cap.innerHTML = `<span class="tv__name">${esc(v.title)}</span><span class="tv__what">${esc(L(v.what))}</span><span class="tv__meta">${esc(L(v.credit))} · ${esc(v.year)} · ${esc(v.length)}</span>`;
			li.append(video(v.video, v.still, v.title), cap);
			return li;
		}));
		$$('[data-scroll]', view).forEach((x) => x.addEventListener('click', (e) => {
			e.preventDefault();
			const to = document.getElementById(x.dataset.scroll);
			Motion.scrollTo(to);
			to?.focus({ preventScroll: true });
		}));
		window.Portrait?.init();
	};

	/* ---------- chrome: bar, footer ---------- */
	const chrome = (route) => {
		const cat = route.name === 'category' ? route.key : route.name === 'project' ? bySlug[route.slug]?.category : null;
		$$('[data-bar-cat]').forEach((a) => {
			const on = a.dataset.barCat === cat;
			a.toggleAttribute('aria-current', on);
			if (on) a.setAttribute('aria-current', route.name === 'category' ? 'page' : 'true');
			a.href = href({ category: a.dataset.barCat });
			a.querySelector('[data-label]').textContent = catName(a.dataset.barCat);
		});
		$$('[data-bar-about]').forEach((a) => {
			a.href = href({ page: 'about' });
			a.toggleAttribute('aria-current', route.name === 'about');
			if (route.name === 'about') a.setAttribute('aria-current', 'page');
		});
		$$('[data-home]').forEach((a) => { a.href = href(); });
		$$('[data-bar-mark]').forEach((el) => { el.innerHTML = logo('wordmark'); });
		$$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === I18N.lang)));
		$$('[data-profiles]').forEach((ul) => {
			ul.innerHTML = HOME.links.map(([label, url]) => `<li><a class="${ul.dataset.profiles}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}${icon.out}</a></li>`).join('');
			ul.closest('[data-profiles-box]')?.toggleAttribute('hidden', !HOME.links.length);
		});
		root.classList.toggle('is-home', route.name === 'home');
		root.dataset.route = route.name;
	};

	/* ---------- render ---------- */
	let route = parse();
	let projectNow = null;
	const meta = (title, description) => {
		document.title = title;
		$('meta[name="description"]')?.setAttribute('content', description);
	};
	const clean = (s) => String(s).replace(/[​-‍⁠﻿]|[\u{E0000}-\u{E007F}]/gu, ''); /* stega characters out of the tab title */
	/* The address decides the language too: going back to an entry written in the other language switches with it. */
	const syncLang = () => {
		const want = new URLSearchParams(location.search).get('lang');
		if ((want === 'pt' || want === 'en') && want !== I18N.lang) I18N.set(want);
	};
	const metaFor = (r) => {
		if (r.name === 'project') {
			const p = bySlug[r.slug];
			return [clean(p ? `${L(p.title)} · Daniel Hodge` : `${t('missing.title')} · Daniel Hodge`), clean(p ? `${L(p.title)}: ${catName(p.category)}, Daniel Hodge.` : t('meta.description'))];
		}
		if (r.name === 'category') return [`${catName(r.key)} · Daniel Hodge`, `${catName(r.key)}: ${t('projects', count(r.key))} · Daniel Hodge.`];
		if (r.name === 'about') return [`${t('about.title')} · Daniel Hodge`, clean(L(PROFILE.bio)).slice(0, 160)];
		return [t('meta.title'), t('meta.description')];
	};
	/* the alternate-language links point at this same page */
	const alternates = () => $$('link[rel="alternate"][hreflang]').forEach((l) => {
		const u = new URL(location.href);
		u.hash = '';
		u.searchParams.set('lang', l.hreflang.startsWith('pt') ? 'pt' : 'en');
		l.href = u.href;
	});
	const render = () => {
		syncLang();
		I18N.apply();
		route = parse();
		projectNow = null;
		let html;
		if (route.name === 'project') {
			const p = bySlug[route.slug];
			projectNow = p || null;
			html = p ? block('project', () => projectView(p)) : missingView();
		} else if (route.name === 'category') html = block('category', () => categoryView(route.key));
		else if (route.name === 'about') html = block('about', aboutView);
		else html = block('home', homeView);
		meta(...metaFor(route));
		alternates();
		view.innerHTML = html;
		chrome(route);
		if (route.name === 'category') block('shelf', () => fillShelf(route.key));
		if (route.name === 'about') block('about', wireAbout);
		$$('img', view).forEach((img) => { if (!img.closest('.card')) fadeIn(img); });
		$$('[data-zoom]', view).forEach((b) => b.addEventListener('click', () => openViewer(projectNow, +b.dataset.zoom, $('img', b))));
		dock();
	};

	/* ---------- the bar docks (wordmark and categories appear) once the home's own title page is out of view ---------- */
	let dockIo = null;
	/* decided at once from where the menu is (an observer answers a frame later, and the bar would blink) */
	const syncDock = () => { const toc = $('[data-toc]', view); root.classList.toggle('is-docked', !toc || toc.getBoundingClientRect().bottom <= 0); };
	const dock = () => {
		dockIo?.disconnect();
		const toc = $('[data-toc]', view);
		if (!toc || !('IntersectionObserver' in window)) { root.classList.add('is-docked'); return; }
		syncDock();
		dockIo = new IntersectionObserver(([en]) => root.classList.toggle('is-docked', !en.isIntersecting && en.boundingClientRect.top < 0), { threshold: 0 });
		dockIo.observe(toc);
	};

	/* ---------- moving between views ---------- */
	let keepTimer = 0;
	const keep = () => { clearTimeout(keepTimer); history.replaceState({ ...(history.state || {}), y: Math.round(scrollY) }, ''); };
	/* the scroll is written into the current entry once it settles, so a reload finds it (Chromium ignores a
	   replaceState made during pagehide); a navigation cancels a pending write so it never lands on the next entry */
	addEventListener('scroll', () => { clearTimeout(keepTimer); keepTimer = setTimeout(keep, 300); }, { passive: true });
	const visible = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight; };
	/* The one object a view change carries: a project's cover, into the project and back to its own card (a cover
	   with nowhere to land fades with the page: style.css, ::view-transition-old(hero):only-child). */
	const pairs = (from, to) => {
		const back = from.name === 'project' && to.name === 'category' && DH.bySlug[from.slug]?.category === to.key;
		const slug = to.name === 'project' ? to.slug : back ? from.slug : null;
		return slug ? [['hero', `[data-cover="${CSS.escape(slug)}"]`]] : [];
	};
	const pick = (sel) => $$(sel).find((el) => visible(el) && getComputedStyle(el).visibility !== 'hidden' && !el.closest('dialog'));
	let navSeq = 0;
	const wait = (ms) => new Promise((r) => setTimeout(r, ms));
	const show = (to, { y = 0, focus = true, from = route } = {}) => {
		const seq = ++navSeq;
		const named = [];
		const name = (el, n) => { if (el) { el.style.viewTransitionName = n; named.push(el); } };
		const list = pairs(from, to);
		const before = {};
		list.forEach(([n, sel]) => { before[n] = pick(sel); name(before[n], n); });
		const restore = [];
		root.classList.add('is-routing');
		const swap = async () => {
			named.splice(0).forEach((el) => { el.style.viewTransitionName = ''; });
			$('.viewer[open]')?.close();
			window.Menu?.close({ instant: true, focus: false });
			render();
			window.scrollTo({ top: y, behavior: 'instant' });
			syncDock();
			list.forEach(([n, sel]) => name(pick(sel), n));
			/* The carried cover: the new picture starts as the old one (already decoded), so it never flies in blank;
			   the right size for its new place loads once the trip is over. */
			const a = before.hero;
			const b = named.find((el) => el.style.viewTransitionName === 'hero');
			if (a?.currentSrc && b && b !== a && b.tagName === 'IMG') {
				restore.push([b, b.getAttribute('src'), b.getAttribute('srcset')]);
				b.removeAttribute('srcset');
				b.src = a.currentSrc;
				b.classList.remove('is-loading');
				await Promise.race([b.decode().catch(() => {}), wait(250)]);
			}
		};
		const done = () => {
			named.splice(0).forEach((el) => { el.style.viewTransitionName = ''; });
			restore.splice(0).forEach(([img, s1, s2]) => { if (!img.isConnected) return; if (s2) img.setAttribute('srcset', s2); img.setAttribute('src', s1); });
			if (seq !== navSeq) return;
			root.classList.remove('is-routing');
			if (focus) $('#page-title', view)?.focus({ preventScroll: true });
		};
		return DH.transition(swap).then(done, done);
	};
	const navigate = (url, { replace = false } = {}) => {
		const next = new URL(url, location.href);
		if (next.pathname + next.search === location.pathname + location.search) { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); return; }
		const from = route;
		keep();
		if (replace) history.replaceState({ y: 0 }, '', next);
		else history.pushState({ y: 0 }, '', next);
		document.title = metaFor(parse())[0]; /* the Studio reads the title with the address */
		dispatchEvent(new Event('dh:navigate')); /* the Studio's address bar follows (preview.js) */
		return show(parse(), { from });
	};

	document.addEventListener('click', (e) => {
		const a = e.target.closest('a[data-route]');
		if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
		if (a.closest('dialog[data-menu]')) return; /* the menu closes itself first (menu.js) */
		e.preventDefault();
		navigate(a.href);
	});
	addEventListener('popstate', (e) => { clearTimeout(keepTimer); show(parse(), { y: e.state?.y || 0 }); });
	/* The Studio's address bar (Presentation) changed the URL: draw that view. */
	addEventListener('dh:route', () => { clearTimeout(keepTimer); show(parse(), { focus: false }); });
	addEventListener('pagehide', keep);

	/* Language switch: the whole page cross-fades, the scroll stays. */
	let langSeq = 0;
	$$('[data-lang]').forEach((b) => b.addEventListener('click', () => {
		if (b.dataset.lang === I18N.lang) return;
		const seq = ++langSeq;
		root.classList.add('is-switching-lang');
		const y = scrollY;
		DH.transition(() => { I18N.set(b.dataset.lang); render(); window.scrollTo({ top: y, behavior: 'instant' }); })
			.then(() => { if (seq === langSeq) root.classList.remove('is-switching-lang'); });
	}));

	/* An edit in the Studio (visual editing): same view, new content, same scroll. */
	window.DH_RERENDER = () => {
		const y = scrollY;
		render();
		window.scrollTo({ top: y, behavior: 'instant' });
		syncDock();
		window.Menu?.refresh();
	};

	window.App = { navigate, render, show, parse, get route() { return route; } };

	/* First paint. The content arrives after the browser's own scroll restore (cms.js waits for Sanity), so the
	   scroll of a reload or a back/forward comes from history.state. */
	legacy();
	render();
	const navType = performance.getEntriesByType?.('navigation')[0]?.type;
	const y = history.state?.y;
	if ((navType === 'reload' || navType === 'back_forward') && y) requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' }));
	root.classList.add('is-ready');
})();
