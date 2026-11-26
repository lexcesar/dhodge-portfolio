import { BlockContentIcon } from '@sanity/icons/BlockContent';
import { DocumentIcon } from '@sanity/icons/Document';
import { ImageIcon } from '@sanity/icons/Image';
import { orderRankField } from '@sanity/orderable-document-list';
import { defineArrayMember, defineField, defineType } from 'sanity';

import { CATEGORIES } from './categories';

/* Alt text of an image: what is in it, for whoever cannot see it. Optional: without it the site uses the title. */
const alt = defineField({ name: 'alt', title: 'Descrição da imagem', type: 'localeLine', description: 'Para quem não vê a imagem: o que aparece nela. Opcional.' });

/* A project: one cover on the category page; the project page shows the cover, then the blocks in order, top to bottom
   (Daniel: "você vai descendo e vai vendo as imagens com texto"). Ids: project-<slug>, no dots. */
export const project = defineType({
	name: 'project',
	title: 'Projeto',
	type: 'document',
	icon: DocumentIcon,
	groups: [
		{ name: 'main', title: 'Projeto', default: true },
		{ name: 'blocks', title: 'Imagens e textos' },
	],
	fields: [
		defineField({ name: 'title', title: 'Título', type: 'localeString', group: 'main', validation: (r) => r.required() }),
		defineField({
			name: 'slug',
			title: 'Endereço',
			type: 'slug',
			group: 'main',
			description: 'A parte final do link do projeto (…?project=este-texto). Gere a partir do título; mudar depois quebra links já enviados.',
			options: { source: 'title.pt', maxLength: 64 },
			validation: (r) => r.required(),
		}),
		defineField({
			name: 'category',
			title: 'Categoria',
			type: 'string',
			group: 'main',
			options: { list: [...CATEGORIES], layout: 'radio' },
			validation: (r) => r.required(),
		}),
		defineField({ name: 'year', title: 'Ano', type: 'number', group: 'main', validation: (r) => r.integer().min(1990).max(2100) }),
		defineField({ name: 'fan', title: 'Fan art de', type: 'string', group: 'main', description: 'Só para fan art: o dono dos personagens (ex.: Hearthstone). O site marca o projeto como fan art.' }),
		defineField({
			name: 'cover',
			title: 'Capa',
			type: 'image',
			group: 'main',
			description: 'A imagem do projeto na página da categoria e no alto da página do projeto. Até 2400 px no lado maior.',
			options: { hotspot: true },
			fields: [alt, defineField({ name: 'caption', title: 'Legenda', type: 'localeLine', description: 'Opcional. Aparece embaixo da capa, na página do projeto.' })],
			validation: (r) => r.required(),
		}),
		defineField({ name: 'intro', title: 'Texto de abertura', type: 'localeBody', group: 'main', description: 'Opcional. Aparece logo depois da capa.' }),
		defineField({
			name: 'blocks',
			title: 'Imagens e textos',
			type: 'array',
			group: 'blocks',
			description: 'Na ordem em que se leem, de cima para baixo. Arraste para reordenar.',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'imageBlock',
					title: 'Imagem',
					icon: ImageIcon,
					fields: [
						defineField({ name: 'image', title: 'Imagem', type: 'image', fields: [alt], validation: (r) => r.required() }),
						defineField({ name: 'caption', title: 'Legenda', type: 'localeLine', description: 'Opcional. Uma linha embaixo da imagem (ex.: a etapa do processo).' }),
						defineField({ name: 'text', title: 'Texto', type: 'localeBody', description: 'Opcional. Um parágrafo junto da imagem.' }),
					],
					preview: {
						select: { caption: 'caption.pt', captionEn: 'caption.en', text: 'text.pt', media: 'image' },
						prepare: ({ caption, captionEn, text, media }) => ({ title: caption || captionEn || 'Imagem', subtitle: text, media }),
					},
				}),
				defineArrayMember({
					type: 'object',
					name: 'textBlock',
					title: 'Texto',
					icon: BlockContentIcon,
					fields: [defineField({ name: 'text', title: 'Texto', type: 'localeBody', validation: (r) => r.required() })],
					preview: {
						select: { pt: 'text.pt', en: 'text.en' },
						prepare: ({ pt, en }) => ({ title: pt || en || 'Texto', subtitle: 'Texto' }),
					},
				}),
			],
		}),
		defineField({ name: 'source', title: 'Link da fonte', type: 'url', group: 'main', description: 'Opcional. A página do projeto no Behance ou no ArtStation.', validation: (r) => r.uri({ scheme: ['https'] }) }),
		orderRankField({ type: 'project' }),
	],
	preview: {
		select: { title: 'title.pt', year: 'year', category: 'category', fan: 'fan', media: 'cover', blocks: 'blocks' },
		prepare: ({ title, year, category, fan, media, blocks }) => ({
			title,
			subtitle: [CATEGORIES.find((c) => c.value === category)?.title, year, fan && `fan art · ${fan}`, Array.isArray(blocks) && blocks.length ? `${blocks.length} blocos` : null].filter(Boolean).join(' · '),
			media,
		}),
	},
});
