/* The home page's frontispiece draws itself (desktop, fine pointer, motion allowed).
   Pointing at a category in the menu drops that category's ink over Daniel's illustration, like a sheet, and flips
   through the first project's images (a pencil test) until it lands on its cover. Moving to another category drops
   the next ink over it; leaving the menu lifts the ink and gives the illustration back. Clicking carries the cover
   into the category page (app.js pairs it by slug: data-cover is set only while the cover is fully shown).
   WAAPI with fill "both" throughout, so any change of mind turns back from where things are.
   Touch screens and reduced motion: the illustration stays still. Purely decorative: aria-hidden. */
(() => {
	const { DH, I18N } = window;
	const { CATS, src, byCat, images } = DH;
	const { L, esc } = I18N;
	const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
	const wide = window.matchMedia('(min-width: 1024px)');
	const live = () => fine.matches && wide.matches && !DH.reduced;

	const EASE = { sheet: 'cubic-bezier(.76, 0, .24, 1)', out: 'cubic-bezier(.23, 1, .32, 1)' };
	const FLAT = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';
	const FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
	/* the leading edge tilts toward the pointer's side as it falls, and lags on the way up */
	const DROP = (side) => [{ clipPath: FLAT }, { clipPath: side > 0 ? 'polygon(0% 0%, 100% 0%, 100% 66%, 0% 42%)' : 'polygon(0% 0%, 100% 0%, 100% 42%, 0% 66%)', offset: 0.55 }, { clipPath: FULL }];
	const LIFT = [{ clipPath: FULL }, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 48%, 0% 30%)', offset: 0.5 }, { clipPath: FLAT }];
	const T = { drop: 520, lift: 460, frame0: 300, frame: 150 };

	let stage = null;
	let plates = {};
	let caption = null;
	let current = null;
	let z = 1;
	let framed = false;
	const anims = new Map(); /* plate -> its running animations */

	/* Frames: the lead project's images (up to four); a lead with fewer than three is padded with the covers of the
	   next projects, so every category has a short flip. The last frame is the lead's cover. */
	const plan = (key) => {
		const list = byCat[key] || [];
		const lead = list[0];
		if (!lead) return null;
		let frames = images(lead).slice(1, 5).map((x) => x.img);
		if (frames.length < 3) frames = [...frames, ...list.slice(1).map((p) => p.cover)].slice(0, 4);
		return { lead, frames };
	};

	const build = (withFrames) => {
		if (!stage) return;
		const box = stage.querySelector('[data-plates]');
		CATS.forEach((key) => {
			const pl = plan(key);
			if (!pl) return;
			let plate = plates[key];
			if (!plate) {
				plate = document.createElement('div');
				plate.className = `stage__plate is-cat-${key}`;
				plate.dataset.plate = key;
				const fin = document.createElement('img');
				fin.className = 'stage__final';
				fin.alt = '';
				fin.decoding = 'async';
				fin.src = src(pl.lead.cover, 1200);
				fin.dataset.slug = pl.lead.slug;
				plate.append(fin);
				box.append(plate);
				plates[key] = plate;
			}
			if (withFrames && !plate.querySelector('[data-frame]')) {
				/* final at the bottom, first frame on top */
				pl.frames.slice().reverse().forEach((name, i) => {
					const img = document.createElement('img');
					img.className = 'stage__frame-img';
					img.alt = '';
					img.decoding = 'async';
					img.dataset.frame = String(pl.frames.length - 1 - i);
					img.src = src(name, 1200);
					plate.append(img);
				});
			}
		});
		framed = framed || withFrames;
	};

	const A = (el, kf, o) => el.animate(kf, { fill: 'both', ...o });
	const stopPlate = (plate) => { (anims.get(plate) || []).forEach((a) => a.cancel()); anims.delete(plate); };
	/* The caption under the stage names what the ink is showing; it keeps its last text while it fades out. */
	const say = (key, html) => {
		if (!caption) return;
		if (key) { caption.className = `stage__caption is-on is-cat-${key}`; caption.innerHTML = html; }
		else caption.classList.remove('is-on');
	};

	const showCat = (key, side = 1) => {
		if (!live() || !stage || key === current) return;
		build(true);
		const plate = plates[key];
		if (!plate) return;
		const prev = current && plates[current];
		current = key;
		stopPlate(plate);
		plate.style.zIndex = String(++z);
		plate.querySelector('.stage__final')?.removeAttribute('data-cover');
		const list = [A(plate, DROP(side), { duration: T.drop, easing: EASE.sheet })];
		/* the pencil test: frame k is on until (start + (k + 1) * T.frame); the cover sits underneath */
		const frames = [...plate.querySelectorAll('img[data-frame]')].filter((img) => img.complete && img.naturalWidth > 0).sort((a, b) => a.dataset.frame - b.dataset.frame);
		const end = T.frame0 + frames.length * T.frame;
		frames.forEach((img, k) => {
			const on = T.frame0 / end;
			const cut = (T.frame0 + (k + 1) * T.frame) / end;
			list.push(A(img, [{ opacity: 0 }, { opacity: 0, offset: k === 0 ? on : (T.frame0 + k * T.frame) / end }, { opacity: 1, offset: k === 0 ? on : (T.frame0 + k * T.frame) / end }, { opacity: 1, offset: cut }, { opacity: 0, offset: cut }, { opacity: 0 }], { duration: end, easing: 'linear' }));
		});
		anims.set(plate, list);
		const p = plan(key).lead;
		say(key, `<span class="stage__ink"></span><span class="stage__title">${esc(L(p.title))}</span>${p.year ? `<span class="stage__year">${esc(p.year)}</span>` : ''}`);
		Promise.all(list.map((a) => a.finished)).then(() => {
			if (current !== key) return;
			plate.querySelector('.stage__final')?.setAttribute('data-cover', plate.querySelector('.stage__final').dataset.slug);
			/* the plate below is covered now: reset it */
			if (prev && prev !== plate) stopPlate(prev);
		}, () => {});
	};

	const hide = () => {
		if (!current) return;
		const plate = plates[current];
		current = null;
		say(null);
		if (!plate) return;
		plate.querySelector('.stage__final')?.removeAttribute('data-cover');
		const list = anims.get(plate) || [];
		/* still falling: retrace; else lift */
		const falling = list[0] && list[0].playState === 'running';
		if (falling) { list.forEach((a) => a.reverse()); return; }
		list.slice(1).forEach((a) => a.cancel());
		const lift = A(plate, LIFT, { duration: T.lift, easing: EASE.sheet });
		list.forEach((a) => a.cancel());
		anims.set(plate, [lift]);
		Object.values(plates).forEach((x) => { if (x !== plate) stopPlate(x); });
	};

	const init = () => {
		stage = document.querySelector('[data-stage]');
		const toc = document.querySelector('[data-toc]');
		plates = {};
		anims.clear();
		current = null;
		framed = false;
		caption = stage?.querySelector('[data-stage-caption]');
		if (!stage || !toc) return;
		const items = [...toc.querySelectorAll('[data-cat]')];
		items.forEach((a, i) => {
			a.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') showCat(a.dataset.cat, i < items.length / 2 ? -1 : 1); });
			a.addEventListener('focus', () => { if (a.matches(':focus-visible')) showCat(a.dataset.cat); });
		});
		toc.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hide(); });
		toc.addEventListener('focusout', (e) => { if (!toc.contains(e.relatedTarget)) hide(); });
		/* the finals after the page's own images, the frames on the first visit to the menu */
		if (live()) {
			const idle = () => build(false);
			if (window.requestIdleCallback) requestIdleCallback(idle, { timeout: 3000 }); else setTimeout(idle, 1500);
			toc.addEventListener('pointerenter', () => build(true), { once: true });
		}
	};
	const stop = () => {
		anims.forEach((list) => list.forEach((a) => a.cancel()));
		anims.clear();
		current = null;
		stage = null;
	};
	window.Stage = { init, stop, get framed() { return framed; } };
})();
