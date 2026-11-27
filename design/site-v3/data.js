/* Everything Daniel (or we) will swap later, in one place. The projects themselves come from the snapshot
   (../assets/projects.js, the same file the previous version reads); nothing here changes it.

   Home images: one by default, one per category (shown while the pointer or the focus is on that menu item).
   Each one is either { project: '<slug>' } (that project's cover) or a file of Daniel's own:
   { src: 'img/<file>', w: <width>, h: <height>, alt: { pt: '…', en: '…' } }, with the file in design/site-v3/img/. */
window.V3 = {
	name: 'Daniel Hodge',
	roles: { pt: 'ilustrador & character designer', en: 'illustrator & character designer' },

	/* The three categories of Daniel's sketch, in menu order. */
	categories: [
		{ key: 'illustration', name: { pt: 'ilustração', en: 'illustration' } },
		{ key: 'projects', name: { pt: 'projetos', en: 'projects' } },
		{ key: 'childrens-book', name: { pt: 'livro infantil', en: "children's book" } },
	],
	/* The previous four categories, mapped to the three new ones; then one-off moves by project slug, if any. */
	remap: { illustrations: 'illustration', 'personal-art': 'illustration', 'character-design': 'projects', 'childrens-books': 'childrens-book' },
	moves: {},

	/* Placeholders until Daniel draws his own (27/11/2026). */
	home: {
		default: { project: 'finally-we-found-a-giant-robot' },
		illustration: { project: 'polar-bearfolk-ranger' },
		projects: { project: 'plumba' },
		'childrens-book': { project: 'tito-club' },
	},

	/* Grid crop (the grid cells are 4:5): where to hold a cover that would lose a face, by project slug. */
	focus: {},

	/* Footer, in the order of the sketch. An empty address hides the link (Bluesky and Cara: not confirmed yet). */
	links: [
		['LinkedIn', 'https://www.linkedin.com/in/daniel-hodge-201aa470/'],
		['Instagram', 'https://www.instagram.com/dlh.suzuki/'],
		['Bsky', ''],
		['Cara', ''],
	],
};
