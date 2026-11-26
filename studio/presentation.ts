import { defineDocuments, defineLocations, presentationTool } from 'sanity/presentation';

import { CATEGORIES } from './schemaTypes/categories';

/* The visual editor opens the live site. Locally: the static server of design/ (port 4330, allowed in the CORS list).
   Routes are query parameters (the host serves files as they are and Presentation percent-encodes a #hash):
   ?category=<key>, ?project=<slug>, ?page=about. */
const LOCAL = 'http://localhost:4330';
const LIVE = 'https://dhodge.thisisaxia.com';
const local = (dev: boolean) => (dev ? '/site/' : '/');

const category = (base: string, key?: string) => {
	const c = CATEGORIES.find((x) => x.value === key);
	return c ? { title: c.title, href: `${base}?category=${c.value}` } : null;
};

export const presentation = (dev: boolean) => {
	const base = local(dev);
	return presentationTool({
		title: 'Editor visual',
		previewUrl: { initial: `${dev ? LOCAL : LIVE}${base}` },
		allowOrigins: [LIVE, LOCAL, 'http://127.0.0.1:4330'],
		resolve: {
			/* Presentation matches a route by its path only, and every page here shares one path: the document panel
			   follows the home page; on a project or the About page, click the text or image to edit it. */
			mainDocuments: defineDocuments([{ route: base, filter: '_id == "home"' }]),
			locations: {
				project: defineLocations({
					select: { title: 'title.pt', slug: 'slug.current', category: 'category' },
					resolve: (doc) => ({
						locations: [
							...(doc?.slug ? [{ title: doc.title || 'Projeto', href: `${base}?project=${doc.slug}` }] : []),
							...[category(base, doc?.category)].filter((x) => x !== null),
						],
					}),
				}),
				home: defineLocations({
					select: { roles: 'roles.pt' },
					resolve: () => ({ locations: [{ title: 'Página inicial', href: base }] }),
				}),
				profile: defineLocations({
					select: { name: 'name' },
					resolve: () => ({ locations: [{ title: 'Sobre', href: `${base}?page=about` }] }),
				}),
			},
		},
	});
};
