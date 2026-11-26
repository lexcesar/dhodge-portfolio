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

/* Text about a piece, in Portuguese, English or both: the site shows the visitor's language and falls back on the other
   one. Daniel's own texts on Behance and ArtStation are mostly in English; they come in as written. */
const either = (type: 'string' | 'text') => [
	defineField({ name: 'pt', title: 'Português', type, ...(type === 'text' ? { rows: 3 } : {}) }),
	defineField({ name: 'en', title: 'English', type, ...(type === 'text' ? { rows: 3 } : {}) }),
];
const one = (v: unknown) => {
	const x = (v ?? {}) as { pt?: string; en?: string };
	return x.pt?.trim() || x.en?.trim() ? true : 'Escreva em pelo menos um idioma, ou apague o campo.';
};

export const localeLine = defineType({
	name: 'localeLine',
	title: 'Texto curto (PT ou EN)',
	type: 'object',
	description: 'Em um idioma ou nos dois. Se faltar um, o site mostra o outro.',
	options: { columns: 2 },
	fields: either('string'),
	validation: (r) => r.custom((v) => (v === undefined ? true : one(v))),
});

export const localeBody = defineType({
	name: 'localeBody',
	title: 'Texto (PT ou EN)',
	type: 'object',
	description: 'Em um idioma ou nos dois. Se faltar um, o site mostra o outro.',
	fields: either('text'),
	validation: (r) => r.custom((v) => (v === undefined ? true : one(v))),
});
