/* One-time import of design/assets/works.js + i18n.js into the dataset.
   Run: pnpm import:dry (prints what it would do) / pnpm import.
   Default is createIfNotExists: a second run never overwrites what Daniel edited; --replace overwrites.
   Ids have no dots (dotted ids are private even in a public dataset): work-<id>, section-<key>, profile. */
import { createHash } from 'node:crypto';
import { createReadStream, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

import { getCliClient } from 'sanity/cli';

const DRY = process.argv.includes('--dry');
const REPLACE = process.argv.includes('--replace');
const ROOT = path.resolve(process.cwd(), '..', 'design', 'assets');
const worksSrc = readFileSync(path.join(ROOT, 'works.js'), 'utf8');
const i18nSrc = readFileSync(path.join(ROOT, 'i18n.js'), 'utf8');
const md5 = createHash('md5').update(worksSrc).update(i18nSrc).digest('hex');

type Pair = [string, string];
type Video = ['youtube' | 'vimeo', string];
type Loc = { pt: string; en?: string };
type OldWork = { id: string; title: string; year: number; section: string; kind: string; fan: string | null; img: string; source?: string; steps?: Pair[] };

const sandbox: { window: Record<string, unknown> } = { window: {} };
vm.runInNewContext(worksSrc, sandbox);
const WORKS = sandbox.window.WORKS as OldWork[];
const PROFILE = sandbox.window.PROFILE as Record<string, any>;

const literal = (name: string) => {
	const m = i18nSrc.match(new RegExp('const ' + name + ' = (\\{[\\s\\S]*?\\});'));
	if (!m) throw new Error('i18n.js: ' + name + ' not found');
	return vm.runInNewContext('(' + m[1] + ')') as Record<string, string>;
};
const KIND = literal('KIND');
const STEP = literal('STEP');
const TITLE = literal('TITLE');
/* PT then EN value of a plain string key in STR. */
const strings = (k: string) => [...i18nSrc.matchAll(new RegExp("'" + k.replace('.', '\\.') + "': '([^']*)'", 'g'))].map((m) => m[1]);

const loc = (pt: string, en?: string): Loc => (en && en !== pt ? { pt, en } : { pt });
const L = (v: Loc | string): Loc => (typeof v === 'string' ? { pt: v } : loc(v.pt, v.en));
const videoUrl = ([p, id]: Video) => (p === 'youtube' ? 'https://www.youtube.com/watch?v=' + id : 'https://vimeo.com/' + id);
let n = 0;
const key = () => 'k' + (n++).toString(36).padStart(4, '0');
/* LexoRank-like strings the orderable list accepts: 0|<6 base36 chars>: in increasing order. */
const rank = (i: number) => '0|' + (i * 1000 + 100000).toString(36).padStart(6, '0') + ':';

const client = getCliClient({ apiVersion: '2025-02-19' });
const assets = new Map<string, string>();
const image = async (name: string) => {
	if (!assets.has(name)) {
		if (DRY) assets.set(name, 'image-DRY-' + name);
		else {
			const doc = await client.assets.upload('image', createReadStream(path.join(ROOT, 'img', name + '.jpg')), { filename: name + '.jpg' });
			assets.set(name, doc._id);
		}
	}
	return { _type: 'image', asset: { _type: 'reference', _ref: assets.get(name)! } };
};

const run = async () => {
	console.log('snapshot md5 ' + md5 + ' · ' + WORKS.length + ' works · dataset ' + client.config().dataset + (DRY ? ' · DRY RUN' : '') + (REPLACE ? ' · REPLACE' : ''));
	const docs: Record<string, unknown>[] = [];
	for (const [i, w] of WORKS.entries()) {
		docs.push({
			_id: 'work-' + w.id,
			_type: 'work',
			title: loc(w.title, TITLE[w.id]),
			section: w.section,
			year: w.year,
			kind: loc(w.kind, KIND[w.kind]),
			...(w.fan ? { fan: w.fan } : {}),
			image: await image(w.img),
			...(w.steps?.length ? { steps: await Promise.all(w.steps.map(async ([label, name]) => ({ _key: key(), _type: 'step', label: loc(label, STEP[label]), image: await image(name) }))) } : {}),
			...(w.source ? { source: w.source } : {}),
			orderRank: rank(i),
		});
	}
	const FEATURED: Record<string, { featured?: string; related?: string[] }> = {
		games: { featured: 'bear' },
		animacao: { featured: 'robot' },
		livros: { featured: 'tito', related: WORKS.filter((w) => w.id.startsWith('abc-')).map((w) => w.id) },
		sketchbook: {},
	};
	for (const [s, f] of Object.entries(FEATURED)) {
		const [pt, en] = strings(s + '.lead');
		if (!pt) throw new Error('lead not found: ' + s);
		docs.push({
			_id: 'section-' + s,
			_type: 'section',
			key: s,
			lead: loc(pt, en),
			...(f.featured ? { featured: { _type: 'reference', _ref: 'work-' + f.featured } } : {}),
			...(f.related ? { related: f.related.map((id) => ({ _key: key(), _type: 'reference', _ref: 'work-' + id })) } : {}),
		});
	}
	const P = PROFILE, a = P.award;
	docs.push({
		_id: 'profile',
		_type: 'profile',
		name: P.name,
		bio: L(P.bio),
		photos: await Promise.all(P.photos.map(async (p: any) => ({ _key: key(), _type: 'photo', image: await image(p.img), alt: L(p.alt), caption: L(p.caption) }))),
		timeline: P.timeline.map(([when, where, what]: [string, string, Loc]) => ({ _key: key(), _type: 'job', when, where, what: L(what) })),
		award: {
			festival: a.festival, year: a.year, work: a.work, workYear: a.workYear, prize: L(a.prize), given: L(a.given), credits: L(a.credits), about: L(a.about),
			video: videoUrl(a.video), still: await image(a.still), source: a.source,
			making: await Promise.all(a.making.map(async ([v, label, still]: [Video, Loc, string]) => ({ _key: key(), _type: 'makingOf', label: L(label), video: videoUrl(v), still: await image(still) }))),
		},
		tv: await Promise.all(P.tv.map(async (v: any) => ({ _key: key(), _type: 'tvWork', title: v.title, year: v.year, length: v.length, video: videoUrl(v.video), still: await image(v.still), what: L(v.what), credit: L(v.credit) }))),
		tvAlso: L(P.tvAlso),
		links: P.links.map(([label, url]: Pair) => ({ _key: key(), _type: 'link', label, url })),
	});

	const existing: string[] = await client.fetch('*[_id in $ids]._id', { ids: docs.map((d) => d._id) });
	console.log(docs.length + ' documents (' + existing.length + ' already exist) · ' + assets.size + ' images');
	if (DRY) { console.log(JSON.stringify([docs[0], docs[18], ...docs.slice(-5)], null, 1)); return; }
	const tx = client.transaction();
	docs.forEach((d) => (REPLACE ? tx.createOrReplace(d as any) : tx.createIfNotExists(d as any)));
	const res = await tx.commit();
	console.log('committed ' + res.results.length + ' mutations, transaction ' + res.transactionId);
};
run().catch((e) => { console.error(e); process.exit(1); });
