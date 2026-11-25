import { defineDocuments, defineLocations, presentationTool } from 'sanity/presentation';

import { SECTIONS } from './schemaTypes/sections';

/* The visual editor opens the live site. Locally: the static server of design/ (port 4330, allowed in the CORS list). */
const LOCAL = 'http://localhost:4330';
const LIVE = 'https://dhodge.thisisaxia.com';
const local = (dev: boolean) => (dev ? '/b-tres-portas/' : '/');

/* ?para= puts a section first on the page (main.js); the Sketchbook is not a door, so it opens on the home page.
   No #hash in these links: Presentation percent-encodes the fragment. */
const DOORS = new Set(['games', 'animacao', 'livros']);
const sectionLink = (base: string, key?: string) => {
	const title = SECTIONS.find((s) => s.value === key)?.title ?? 'Início';
	return { title, href: key && DOORS.has(key) ? `${base}?para=${key}` : base };
};

export const presentation = (dev: boolean) => {
	const base = local(dev);
	return presentationTool({
		title: 'Editor visual',
		previewUrl: { initial: `${dev ? LOCAL : LIVE}${base}` },
		allowOrigins: [LIVE, LOCAL, 'http://127.0.0.1:4330'],
		resolve: {
			mainDocuments: defineDocuments([{ route: base, filter: '_id == "profile"' }]),
			locations: {
				work: defineLocations({
					select: { title: 'title.pt', section: 'section' },
					resolve: (doc) => ({ locations: [sectionLink(base, doc?.section)] }),
				}),
				section: defineLocations({
					select: { key: 'key' },
					resolve: (doc) => ({ locations: [sectionLink(base, doc?.key)] }),
				}),
				profile: defineLocations({
					select: { name: 'name' },
					resolve: () => ({ locations: [{ title: 'Início', href: base }] }),
				}),
			},
		},
	});
};
