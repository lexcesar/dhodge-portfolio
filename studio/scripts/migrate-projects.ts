/* work -> project: Daniel's four categories (voice note, 26/11/2026). Additive: reads the published "work" and "profile"
   documents, writes new "project" documents and the "home" singleton with createIfNotExists, and never deletes or
   changes a "work" (the previous site still reads them). A second run never overwrites what Daniel edited.

   Run:  pnpm migrate:dry   reads the dataset (public, no token), prints the plan and writes the site's snapshot
                            design/assets/projects.js, which the site uses while the dataset has no projects.
         pnpm migrate       the same, then uploads the local images that are not in the dataset yet and commits.

   Grouping: one project per source project on Behance or ArtStation (media/manifest.json). Titles, years and texts
   come from the dataset or, literally, from the source pages (read 26/11/2026); where a source has no text, none. */
import { readFileSync, writeFileSync, createReadStream } from 'node:fs';
import path from 'node:path';

import { getCliClient } from 'sanity/cli';

const DRY = process.argv.includes('--dry');
/* A second real run would bring back a project Daniel deleted (createIfNotExists cannot tell "never created" from
   "deleted"): once any project or the home exists, the real run stops unless asked with --again. */
const AGAIN = process.argv.includes('--again');
const DESIGN = path.resolve(process.cwd(), '..', 'design');
const IMG = path.join(DESIGN, 'assets', 'img');
const OUT = path.join(DESIGN, 'assets', 'projects.js');

type Loc = { pt?: string; en?: string };
type Asset = { _id: string; url: string; originalFilename: string; w: number; h: number };
type Work = { _id: string; title: Loc; year?: number; fan?: string; source?: string; image: { asset: Asset }; steps?: { label: Loc; image: { asset: Asset } }[] };

/* What a block or a cover is made of, by local file name (design/assets/img/<name>.jpg = the asset's originalFilename). */
type Block = { img: string; caption?: Loc | 'title' | 'step'; alt?: Loc; from?: string } | { text: Loc };
type Plan = {
	slug: string; category: 'character-design' | 'illustrations' | 'childrens-books' | 'personal-art';
	title: Loc | { work: string }; year?: number | { work: string }; fan?: string; source: string;
	cover: string; coverCaption?: Loc; coverFrom?: string; intro?: Loc; blocks: Block[];
};

/* Texts quoted from the source pages, as written (only collapsed double spaces). */
const SRC = {
	bear: 'After finishing the illustration i realized that penguins don\'t live in the Arctic, so they could never meet a polar bear. So this encounter is a fantasy world inside a fantasy world.',
	bearCredit: 'Illustration done with the invaluable help of Arthur Bozonnet.',
	robot: 'Unfinished illustration i did a while ago to start adding 3D in my creation process. It was supposed to show the moment that 2 kids find a giant robot in an old workshop.',
	fizzban: 'My previous ideas for the pirate illustration. I ended up not doing it but i think the sketches are worth sharing. :)',
	portais: 'Artwork for a personal animation project.',
	characters: 'Characters done for facebook groups :: 44Fan and CharacterDesignChallenge',
	strange: 'Open your mind.',
	monica: 'Algumas ilustrações dos personagens da Turma da Mônica que estou fazendo entre os projetos de trabalho.',
	plumba: 'Plumba :: Character from 2Minds Studio',
	cascao: 'Cascão e o Monstro de Frankenstein',
};
/* Process steps of a work, as image blocks captioned with the step name, minus the ones that repeat the cover. */
const steps = (work: string, skip: string[] = []) => ({ steps: work, skip });
type Steps = ReturnType<typeof steps>;
const single = (slug: string, work: string, category: Plan['category'], extra: Partial<Plan> = {}): Plan => ({
	slug, category, title: { work }, year: { work }, source: '', cover: '', blocks: [], ...extra, ...({ single: work } as object),
});

const PLAN: (Plan & { steps?: Steps[] })[] = [
	/* ILLUSTRATIONS: game and card art, finished illustrations */
	{ slug: 'polar-bearfolk-ranger', category: 'illustrations', title: { work: 'bear' }, year: 2022, source: 'https://www.artstation.com/artwork/OmxKlb',
		cover: 'bear-final', coverCaption: { en: SRC.bearCredit }, intro: { en: SRC.bear }, blocks: [], steps: [steps('bear', ['bear-final'])] },
	{ slug: 'fizzban-the-pirate', category: 'illustrations', title: { work: 'fizzban' }, year: 2025, fan: 'Hearthstone', source: 'https://www.behance.net/gallery/228542169/Hearthstone-Fan-Art-Fizzban-the-Pirate',
		cover: 'fizzban-final', steps: [steps('fizzban', ['fizzban-final', 'fizzban-sketch-e'])],
		blocks: [{ text: { en: SRC.fizzban } }, { img: 'fizzban-sketch-a' }, { img: 'fizzban-sketch-b' }, { img: 'fizzban-sketch-c' }, { img: 'fizzban-sketch-d' }, { img: 'fizzban-sketch-e' }] },
	{ slug: 'finally-we-found-a-giant-robot', category: 'illustrations', title: { work: 'robot' }, year: 2025, source: 'https://www.behance.net/gallery/223698601/Finally-we-found-a-giant-robot',
		cover: 'robot-5', intro: { en: SRC.robot }, blocks: [], steps: [steps('robot', ['robot-5'])] },
	{ slug: 'ooops', category: 'illustrations', title: { work: 'ooops' }, year: 2025, fan: 'Hearthstone', source: 'https://www.behance.net/gallery/228544059/Hearthstone-Fan-Art-Ooops',
		cover: 'ooops-final', blocks: [], steps: [steps('ooops', ['ooops-final'])] },
	{ slug: 'dont-stop-me-now', category: 'illustrations', title: { work: 'dontstop' }, year: 2025, fan: 'Hearthstone', source: 'https://www.behance.net/gallery/228543643/Hearthstone-Fan-Art-Dont-Stop-Me-Now',
		cover: 'dontstop-final', blocks: [], steps: [steps('dontstop', ['dontstop-final'])] },
	single('udyr', 'udyr', 'illustrations'),

	/* CHARACTER DESIGN: characters, expressions, costumes, model sheets */
	{ slug: 'portais-do-rio', category: 'character-design', title: { work: 'portais' }, year: 2015, source: 'https://www.artstation.com/artwork/Y8gE3',
		cover: 'portais-4', intro: { en: SRC.portais }, blocks: [], steps: [steps('portais', ['portais-4'])] },
	{ slug: 'character-design', category: 'character-design', title: { pt: 'Character Design' }, year: 2016, source: 'https://www.behance.net/gallery/32694577/Character-Design',
		cover: 'leon', coverFrom: 'leon', intro: { en: SRC.characters },
		blocks: [
			{ img: 'giuseppe', caption: 'title', from: 'giuseppe' }, { img: 'rooster', caption: 'title', from: 'rooster' }, { img: 'sinbad', caption: 'title', from: 'sinbad' },
			{ img: 'feb-soldier', caption: 'title', from: 'feb' }, { img: 'hut-of-brown', caption: 'title', from: 'hut' }, { img: 'rui', caption: 'title', from: 'rui' },
		] },
	{ slug: 'projeto-pessoal', category: 'character-design', title: { work: 'space' }, year: 2016, source: 'https://www.artstation.com/artwork/8rl2Q',
		cover: 'space-boy', blocks: [], steps: [steps('space', ['space-boy'])] },
	single('seven-league-boots', 'boots', 'character-design'),
	single('the-vampire', 'vampire', 'character-design'),
	single('el-torero', 'torero', 'character-design'),
	single('severino', 'severino', 'character-design'),
	single('clayton-the-sea-wolf', 'clayton', 'character-design'),
	single('the-bride', 'bride', 'character-design'),
	single('plumba', 'plumba', 'character-design', { coverCaption: { en: SRC.plumba } }),

	/* CHILDREN'S BOOKS */
	{ slug: 'tito-club', category: 'childrens-books', title: { work: 'tito' }, year: 2016, source: 'https://www.artstation.com/artwork/r0O0J',
		/* ArtStation order (tito-1…8); the letters are the same art, framed, as on Behance */
		cover: 'tito-2', blocks: [{ img: 'abc-p' }, { img: 'abc-a' }, { img: 'tito-4' }, { img: 'abc-e' }, { img: 'abc-b' }, { img: 'abc-s' }, { img: 'abc-w' }] },
	{ slug: 'book-illustration', category: 'childrens-books', title: { pt: 'Book Illustration' }, year: 2018, source: 'https://www.behance.net/gallery/63447693/Book-Illustration',
		/* Behance order, minus the images that open their own project (Tito Club, Projeto pessoal, the sketchbook's witch) */
		cover: 'kitchen', blocks: [{ img: 'couple' }, { img: 'bath-dog' }, { img: 'dog-chase' }, { img: 'kings' }, { img: 'robot-dino' }, { img: 'tito-puzzle' }] },
	single('tito-e-os-protetores', 'protetores', 'childrens-books'),

	/* PERSONAL ART: fan art and the sketchbook */
	{ slug: 'turma-da-monica', category: 'personal-art', title: { work: 'monica' }, year: 2026, fan: 'Turma da Mônica', source: 'https://www.behance.net/gallery/254081021/Turma-da-Monica-Fan-Art',
		cover: 'monica-3', intro: { pt: SRC.monica }, blocks: [{ img: 'monica-2', caption: 'step', from: 'monica', alt: { pt: SRC.cascao } }, { img: 'monica-1', caption: 'step', from: 'monica' }] },
	{ slug: 'sketchbook', category: 'personal-art', title: { pt: 'Sketchbook' }, source: '',
		cover: 'witch-pencil',
		blocks: [
			{ img: 'bear-sketches' }, { img: 'fizzban-sketch-c', caption: { pt: 'Fan art · Hearthstone' } }, { img: 'robot-2' },
			{ img: 'fizzban-sketch-a', caption: { pt: 'Fan art · Hearthstone' } }, { img: 'dontstop-thumbs', caption: { pt: 'Fan art · Hearthstone' } },
			{ img: 'monica-2', caption: { pt: 'Fan art · Turma da Mônica' } },
		] },
	single('dr-strange', 'strange', 'personal-art', { intro: { en: SRC.strange } }),
	single('linebeck', 'linebeck', 'personal-art'),
];

const ROLES = { pt: 'Ilustrador · Character designer · Autor', en: 'Illustrator · Character Designer · Author' };
/* Profiles written on Daniel's own pages (ArtStation users/dhodge.json, read 26/11/2026). Bluesky and Cara: not found
   on any of his pages (cara.app/dhodge answers 404): empty until Daniel gives the address. */
const LINKS = {
	linkedin: 'https://www.linkedin.com/in/daniel-hodge-201aa470/',
	instagram: 'https://www.instagram.com/dlh.suzuki/',
	behance: 'https://www.behance.net/dhodge',
};
const HERO = 'robot-5';

/* ----------------------------------------------------------------------------------------------------------------- */

const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ perspective: 'published', useCdn: false });
const asset = '{ _id, url, originalFilename, "w": metadata.dimensions.width, "h": metadata.dimensions.height }';
const PROFILE_QUERY = readFileSync(path.join(DESIGN, 'assets', 'cms.js'), 'utf8').match(/"profile": (\*\[_id == "profile"\]\[0\]\{[\s\S]*?\n\t\t\})\n/)?.[1];
const IMG_SHAPE = '{ "url": url, "orig": originalFilename, "w": metadata.dimensions.width, "h": metadata.dimensions.height }';

/* Width and height of a local JPEG (start-of-frame marker), for images not uploaded yet. */
const jpegSize = (file: string) => {
	const b = readFileSync(file);
	let i = 2;
	while (i < b.length) {
		const marker = b[i + 1];
		const len = b.readUInt16BE(i + 2);
		if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
		i += 2 + len;
	}
	throw new Error('no size: ' + file);
};

const keyOf = (slug: string, i: number) => `${slug.replace(/[^a-z0-9]/g, '').slice(0, 10)}${i.toString(36).padStart(2, '0')}`;
/* LexoRank-like strings the orderable list accepts, increasing: category by category, in PLAN order. */
const rank = (i: number) => '0|' + (i * 1000 + 100000).toString(36).padStart(6, '0') + ':';
const clean = (l?: Loc) => {
	if (!l) return undefined;
	const o: Loc = {};
	if (l.pt?.trim()) o.pt = l.pt.trim();
	if (l.en?.trim() && l.en.trim() !== o.pt) o.en = l.en.trim();
	return o.pt || o.en ? o : undefined;
};

const run = async () => {
	const works: Work[] = await client.fetch(`*[_type == "work"]{ _id, title, year, fan, source, image{ "asset": asset->${asset} }, steps[]{ label, image{ "asset": asset->${asset} } } }`);
	const byWork = new Map(works.map((w) => [w._id.replace(/^work-/, ''), w]));
	const assets = new Map<string, Asset>();
	const fileName = (a: Asset) => a.originalFilename.replace(/\.\w+$/, '');
	works.forEach((w) => [w.image, ...(w.steps || []).map((s) => s.image)].forEach((im) => im?.asset && assets.set(fileName(im.asset), im.asset)));
	const profile = PROFILE_QUERY ? await client.fetch(PROFILE_QUERY.replace(/\$\{img\}/g, IMG_SHAPE)) : null;
	if (!profile) throw new Error('profile not found (or the profile query in cms.js changed shape)');
	const existing: string[] = await client.fetch('*[_type in ["project", "home"]]._id');
	const W = (id: string) => {
		const w = byWork.get(id);
		if (!w) throw new Error('work not in the dataset: ' + id);
		return w;
	};
	const toUpload = new Set<string>();
	const local = (name: string) => {
		if (!assets.has(name)) toUpload.add(name);
		return name;
	};

	/* Plans to documents. */
	type Img = { name: string };
	const projects = PLAN.map((p, i) => {
		const one = (p as { single?: string }).single;
		const title = 'work' in p.title ? clean(W(p.title.work).title) : clean(p.title);
		const year = typeof p.year === 'object' ? W(p.year.work).year : p.year;
		const sw = one ? W(one) : null;
		const cover = local(p.cover || (sw ? fileName(sw.image.asset) : ''));
		const blocks: ({ type: 'image'; img: Img; caption?: Loc; alt?: Loc } | { type: 'text'; text: Loc })[] = [];
		for (const s of p.steps || []) {
			for (const st of W(s.steps).steps || []) {
				const name = fileName(st.image.asset);
				if (!s.skip.includes(name)) blocks.push({ type: 'image', img: { name: local(name) }, caption: clean(st.label) });
			}
		}
		for (const b of p.blocks) {
			if ('text' in b) { blocks.push({ type: 'text', text: b.text }); continue; }
			let caption: Loc | undefined;
			if (b.caption === 'title') caption = clean(W(b.from!).title);
			else if (b.caption === 'step') caption = clean(W(b.from!).steps?.find((st) => fileName(st.image.asset) === b.img)?.label);
			else caption = clean(b.caption);
			blocks.push({ type: 'image', img: { name: local(b.img) }, caption, alt: b.alt });
		}
		const source = p.source || sw?.source || '';
		const fan = p.fan ?? sw?.fan;
		if (!title?.pt) throw new Error('no title: ' + p.slug);
		const coverCaption = p.coverFrom ? clean(W(p.coverFrom).title) : p.coverCaption;
		return { i, plan: p, id: `project-${p.slug}`, title: title as Required<Pick<Loc, 'pt'>> & Loc, year, fan, source, cover, coverCaption, blocks };
	});
	local(HERO);

	/* Dry-run report. */
	const cats = ['character-design', 'illustrations', 'childrens-books', 'personal-art'];
	console.log(`dataset ${client.config().dataset} · ${works.length} works read · ${projects.length} projects planned · ${existing.length} project/home documents already there${DRY ? ' · DRY RUN' : ''}`);
	for (const c of cats) {
		console.log(`\n${c}`);
		projects.filter((p) => p.plan.category === c).forEach((p) => {
			console.log(`  ${p.id.padEnd(40)} ${p.title.pt}${p.year ? ` (${p.year})` : ''}${p.fan ? ` · fan art ${p.fan}` : ''} · capa ${p.cover} · ${p.blocks.length} blocos${existing.includes(p.id) ? ' · JÁ EXISTE' : ''}`);
			console.log(`  ${''.padEnd(40)} ${p.source || '(sem fonte)'}`);
		});
	}
	console.log(`\nimagens que ainda não estão no dataset (upload no passo real): ${[...toUpload].join(', ') || 'nenhuma'}`);

	/* Snapshot for the site: the same shape as the site's query (design/assets/cms.js). Images already in the dataset
	   point at the CDN; the ones not uploaded yet point at the local file. */
	const shot = (name: string) => {
		const a = assets.get(name);
		if (a) return { url: a.url, orig: a.originalFilename, w: a.w, h: a.h };
		return { name, ...jpegSize(path.join(IMG, `${name}.jpg`)) };
	};
	const snapshot = {
		projects: projects.map((p) => ({
			id: p.id, title: p.title, slug: p.plan.slug, category: p.plan.category, year: p.year ?? null, fan: p.fan ?? null, source: p.source || null,
			intro: p.plan.intro ?? null,
			cover: shot(p.cover), coverAlt: null, coverCaption: p.coverCaption ?? null,
			blocks: p.blocks.map((b, k) => (b.type === 'text'
				? { _key: keyOf(p.plan.slug, k), _type: 'textBlock', caption: null, text: b.text, alt: null, img: null }
				: { _key: keyOf(p.plan.slug, k), _type: 'imageBlock', caption: b.caption ?? null, text: null, alt: b.alt ?? null, img: shot(b.img.name) })),
		})),
		home: { roles: ROLES, links: LINKS, logo: null, hero: shot(HERO), heroAlt: null },
		profile,
	};
	writeFileSync(OUT, `/* Generated by studio/scripts/migrate-projects.ts (pnpm migrate:dry), ${new Date().toISOString().slice(0, 10)}. Do not edit:
   run the script again. The site (design/assets/cms.js) uses this while the dataset has no "project" documents yet,
   or when Sanity does not answer. Same shape as the site's query. */
window.DH_SNAPSHOT = ${JSON.stringify(snapshot)};
`);
	console.log(`snapshot: ${path.relative(process.cwd(), OUT)} (${projects.length} projects)`);
	if (DRY) return;
	if (existing.length && !AGAIN) {
		console.log(`\nparado: ${existing.length} documento(s) project/home já existem no dataset. Rodar de novo recriaria o que o Daniel apagou. Para rodar mesmo assim: pnpm migrate -- --again`);
		return;
	}

	/* Real run: upload what is missing, then create what does not exist yet. */
	const ref = new Map<string, string>([...assets].map(([n, a]) => [n, a._id]));
	for (const name of toUpload) {
		const doc = await client.assets.upload('image', createReadStream(path.join(IMG, `${name}.jpg`)), { filename: `${name}.jpg` });
		ref.set(name, doc._id);
		console.log(`upload ${name} -> ${doc._id}`);
	}
	const image = (name: string, extra: Record<string, unknown> = {}) => ({ _type: 'image', asset: { _type: 'reference', _ref: ref.get(name)! }, ...extra });
	const tx = client.transaction();
	projects.forEach((p, i) => {
		tx.createIfNotExists({
			_id: p.id,
			_type: 'project',
			title: p.title,
			slug: { _type: 'slug', current: p.plan.slug },
			category: p.plan.category,
			...(p.year ? { year: p.year } : {}),
			...(p.fan ? { fan: p.fan } : {}),
			cover: image(p.cover, p.coverCaption ? { caption: p.coverCaption } : {}),
			...(p.plan.intro ? { intro: p.plan.intro } : {}),
			blocks: p.blocks.map((b, k) => (b.type === 'text'
				? { _key: keyOf(p.plan.slug, k), _type: 'textBlock', text: b.text }
				: { _key: keyOf(p.plan.slug, k), _type: 'imageBlock', image: image(b.img.name, b.alt ? { alt: b.alt } : {}), ...(b.caption ? { caption: b.caption } : {}) })),
			...(p.source ? { source: p.source } : {}),
			orderRank: rank(cats.indexOf(p.plan.category) * 100 + i),
		});
	});
	tx.createIfNotExists({ _id: 'home', _type: 'home', roles: ROLES, heroImage: image(HERO), links: LINKS });
	const res = await tx.commit();
	console.log(`committed ${res.results.length} mutations (transaction ${res.transactionId})`);
};

run().catch((e) => { console.error(e); process.exit(1); });
