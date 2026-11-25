import { UserIcon } from '@sanity/icons/User';
import { defineArrayMember, defineField, defineType } from 'sanity';

import { videoUrl } from './video';

const still = (title = 'Imagem de capa do vídeo') => defineField({ name: 'still', title, type: 'image', validation: (r) => r.required() });

export const profile = defineType({
	name: 'profile',
	title: 'Perfil',
	type: 'document',
	icon: UserIcon,
	groups: [
		{ name: 'about', title: 'Sobre', default: true },
		{ name: 'award', title: 'Prêmio' },
		{ name: 'tv', title: 'TV' },
		{ name: 'contact', title: 'Contato' },
	],
	fields: [
		defineField({ name: 'name', title: 'Nome', type: 'string', group: 'about', validation: (r) => r.required() }),
		defineField({ name: 'bio', title: 'Bio', type: 'localeText', group: 'about', validation: (r) => r.required() }),
		defineField({
			name: 'photos',
			title: 'Fotos do Sobre',
			type: 'array',
			group: 'about',
			description: 'Trocam sozinhas, com um glitch. Mesma proporção para todas (4:3).',
			of: [defineArrayMember({
				type: 'object',
				name: 'photo',
				fields: [
					defineField({ name: 'image', title: 'Foto', type: 'image', validation: (r) => r.required() }),
					defineField({ name: 'alt', title: 'Descrição da foto', type: 'localeString', description: 'Para quem não vê a imagem: o que aparece nela.', validation: (r) => r.required() }),
					defineField({ name: 'caption', title: 'Legenda', type: 'localeString' }),
				],
				preview: { select: { title: 'caption.pt', subtitle: 'alt.pt', media: 'image' } },
			})],
			validation: (r) => r.required().min(1),
		}),
		defineField({
			name: 'timeline',
			title: 'Trajetória',
			type: 'array',
			group: 'about',
			of: [defineArrayMember({
				type: 'object',
				name: 'job',
				fields: [
					defineField({ name: 'when', title: 'Período', type: 'string', description: 'Ex.: 2019–2024', validation: (r) => r.required() }),
					defineField({ name: 'where', title: 'Onde', type: 'string', validation: (r) => r.required() }),
					defineField({ name: 'what', title: 'Função', type: 'localeString', validation: (r) => r.required() }),
				],
				preview: { select: { title: 'where', subtitle: 'when' } },
			})],
		}),
		defineField({
			name: 'award',
			title: 'Prêmio',
			type: 'object',
			group: 'award',
			fields: [
				defineField({ name: 'festival', title: 'Festival', type: 'string', validation: (r) => r.required() }),
				defineField({ name: 'year', title: 'Ano do prêmio', type: 'number', validation: (r) => r.required().integer() }),
				defineField({ name: 'work', title: 'Filme', type: 'string', validation: (r) => r.required() }),
				defineField({ name: 'workYear', title: 'Ano do filme', type: 'number' }),
				defineField({ name: 'prize', title: 'Prêmio', type: 'localeString', validation: (r) => r.required() }),
				defineField({ name: 'given', title: 'Nome oficial do prêmio', type: 'localeString' }),
				defineField({ name: 'credits', title: 'Créditos', type: 'localeText' }),
				defineField({ name: 'about', title: 'Sobre o filme', type: 'localeText' }),
				videoUrl,
				still(),
				defineField({
					name: 'making',
					title: 'Making of',
					type: 'array',
					of: [defineArrayMember({
						type: 'object',
						name: 'makingOf',
						fields: [defineField({ name: 'label', title: 'Título', type: 'localeString', validation: (r) => r.required() }), videoUrl, still()],
						preview: { select: { title: 'label.pt', media: 'still' } },
					})],
				}),
				defineField({ name: 'source', title: 'Fonte (lista oficial de premiados)', type: 'url' }),
			],
		}),
		defineField({
			name: 'tv',
			title: 'Trabalhos para a TV',
			type: 'array',
			group: 'tv',
			of: [defineArrayMember({
				type: 'object',
				name: 'tvWork',
				fields: [
					defineField({ name: 'title', title: 'Título', type: 'string', validation: (r) => r.required() }),
					defineField({ name: 'year', title: 'Ano', type: 'number', validation: (r) => r.required().integer() }),
					defineField({ name: 'length', title: 'Duração', type: 'string', description: 'Ex.: 0:45', validation: (r) => r.required().regex(/^\d+:\d{2}$/, { name: 'm:ss' }) }),
					videoUrl,
					still(),
					defineField({ name: 'what', title: 'O que é', type: 'localeString', validation: (r) => r.required() }),
					defineField({ name: 'credit', title: 'Créditos', type: 'localeString', validation: (r) => r.required() }),
				],
				preview: { select: { title: 'title', subtitle: 'year', media: 'still' } },
			})],
		}),
		defineField({ name: 'tvAlso', title: 'Nota sobre outros trabalhos de TV', type: 'localeText', group: 'tv' }),
		defineField({
			name: 'links',
			title: 'Perfis',
			type: 'array',
			group: 'contact',
			of: [defineArrayMember({
				type: 'object',
				name: 'link',
				fields: [
					defineField({ name: 'label', title: 'Nome', type: 'string', validation: (r) => r.required() }),
					defineField({ name: 'url', title: 'Endereço', type: 'url', validation: (r) => r.required().uri({ scheme: ['https'] }) }),
				],
				preview: { select: { title: 'label', subtitle: 'url' } },
			})],
		}),
	],
	preview: { prepare: () => ({ title: 'Perfil' }) },
});
