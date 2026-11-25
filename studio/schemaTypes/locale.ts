import { defineField, defineType } from 'sanity';

/* Field-level localization: the site is PT first, EN falls back to PT when empty
   (same rule as I18N.L in design/assets/i18n.js). */
const en = { name: 'en', title: 'English', description: 'Deixe vazio se for igual ao português.' };

export const localeString = defineType({
	name: 'localeString',
	title: 'Texto curto (PT/EN)',
	type: 'object',
	options: { columns: 2 },
	fields: [
		defineField({ name: 'pt', title: 'Português', type: 'string', validation: (r) => r.required() }),
		defineField({ ...en, type: 'string' }),
	],
});

export const localeText = defineType({
	name: 'localeText',
	title: 'Texto (PT/EN)',
	type: 'object',
	fields: [
		defineField({ name: 'pt', title: 'Português', type: 'text', rows: 3, validation: (r) => r.required() }),
		defineField({ ...en, type: 'text', rows: 3 }),
	],
});
