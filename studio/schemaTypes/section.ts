import { ThListIcon } from '@sanity/icons/ThList';
import { defineArrayMember, defineField, defineType } from 'sanity';

import { SECTIONS } from './sections';

/* One fixed document per section (ids section-games, section-animacao, …; no dots: ids with a dot are private even in a public dataset): the lead and the featured work. */
export const section = defineType({
	name: 'section',
	title: 'Seção',
	type: 'document',
	icon: ThListIcon,
	fields: [
		defineField({ name: 'key', title: 'Seção', type: 'string', options: { list: [...SECTIONS] }, readOnly: true, validation: (r) => r.required() }),
		defineField({ name: 'lead', title: 'Frase de abertura', type: 'localeText', validation: (r) => r.required() }),
		defineField({
			name: 'featured',
			title: 'Obra em destaque',
			type: 'reference',
			to: [{ type: 'work' }],
			description: 'Abre a seção em tamanho grande, com as etapas, e é a imagem da porta na página inicial. O Sketchbook não tem destaque.',
			options: { filter: ({ document }) => ({ filter: 'section == $key', params: { key: (document as { key?: string }).key } }) },
			hidden: ({ document }) => document?.key === 'sketchbook',
		}),
		defineField({
			name: 'related',
			title: 'Miniaturas junto ao destaque',
			type: 'array',
			description: 'Opcional. Obras mostradas em miniatura ao lado do destaque (ex.: as letras do abecedário do Tito Club).',
			of: [defineArrayMember({ type: 'reference', to: [{ type: 'work' }], options: { filter: ({ document }) => ({ filter: 'section == $key', params: { key: (document as { key?: string }).key } }) } })],
			hidden: ({ document }) => document?.key === 'sketchbook' || !document?.featured,
		}),
	],
	preview: {
		select: { key: 'key', lead: 'lead.pt' },
		prepare: ({ key, lead }) => ({ title: SECTIONS.find((s) => s.value === key)?.title ?? key, subtitle: lead }),
	},
});
