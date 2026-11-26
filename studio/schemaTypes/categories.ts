/* The four categories Daniel named (voice note, 26/11/2026), in his order. A fixed list, not a document: the site's menu,
   colours and texts are built around exactly these four. Labels on the site come from design/assets/i18n.js. */
export const CATEGORIES = [
	{ title: 'Character design', value: 'character-design' },
	{ title: 'Ilustração', value: 'illustrations' },
	{ title: 'Livros infantis', value: 'childrens-books' },
	{ title: 'Arte pessoal', value: 'personal-art' },
] as const;
export type CategoryKey = (typeof CATEGORIES)[number]['value'];
