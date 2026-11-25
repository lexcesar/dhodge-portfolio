import { ImageIcon } from '@sanity/icons/Image';
import { orderRankField } from '@sanity/orderable-document-list';
import { defineArrayMember, defineField, defineType } from 'sanity';

import { SECTIONS } from './sections';

export const work = defineType({
	name: 'work',
	title: 'Obra',
	type: 'document',
	icon: ImageIcon,
	fields: [
		defineField({ name: 'title', title: 'Título', type: 'localeString', validation: (r) => r.required() }),
		defineField({ name: 'section', title: 'Seção', type: 'string', options: { list: [...SECTIONS], layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
		defineField({ name: 'year', title: 'Ano', type: 'number', validation: (r) => r.required().integer().min(1990).max(2100) }),
		defineField({ name: 'kind', title: 'Tipo', type: 'localeString', description: 'Ex.: Arte de card, Personagem, Esboço.', validation: (r) => r.required() }),
		defineField({ name: 'fan', title: 'Fan art de', type: 'string', description: 'Só para fan art: o dono dos personagens (ex.: Hearthstone). O site marca a obra como fan art.' }),
		defineField({
			name: 'image',
			title: 'Imagem principal',
			type: 'image',
			description: 'A versão final, até 1800 px no lado maior. Se ela também for uma etapa, use o mesmo arquivo nas etapas.',
			validation: (r) => r.required(),
		}),
		defineField({
			name: 'steps',
			title: 'Etapas do processo',
			type: 'array',
			description: 'Opcional. Na ordem: da miniatura ao final.',
			of: [defineArrayMember({
				type: 'object',
				name: 'step',
				title: 'Etapa',
				fields: [
					defineField({ name: 'label', title: 'Nome da etapa', type: 'localeString', validation: (r) => r.required() }),
					defineField({ name: 'image', title: 'Imagem', type: 'image', validation: (r) => r.required() }),
				],
				preview: { select: { title: 'label.pt', media: 'image' } },
			})],
		}),
		defineField({ name: 'source', title: 'Link da obra', type: 'url', description: 'Página no ArtStation ou no Behance.', validation: (r) => r.uri({ scheme: ['https'] }) }),
		orderRankField({ type: 'work' }),
	],
	preview: {
		select: { title: 'title.pt', year: 'year', kind: 'kind.pt', fan: 'fan', media: 'image' },
		prepare: ({ title, year, kind, fan, media }) => ({ title, subtitle: [year, kind, fan && `fan art · ${fan}`].filter(Boolean).join(' · '), media }),
	},
});
