import { HomeIcon } from '@sanity/icons/Home';
import { defineField, defineType } from 'sanity';

const link = (name: string, title: string, example: string) =>
	defineField({ name, title, type: 'url', description: `Endereço completo do perfil (ex.: ${example}). Vazio: o link não aparece no site.`, validation: (r) => r.uri({ scheme: ['https'] }) });

/* The home page and what every page shares (the profile links in the footer). One fixed document, id "home". */
export const home = defineType({
	name: 'home',
	title: 'Página inicial',
	type: 'document',
	icon: HomeIcon,
	fields: [
		defineField({
			name: 'roles',
			title: 'O que você faz',
			type: 'localeString',
			description: 'A linha no topo, separada por ponto médio (·). Ex.: Ilustrador · Character designer · Autor.',
			validation: (r) => r.required(),
		}),
		defineField({
			name: 'logo',
			title: 'Logo',
			type: 'image',
			description: 'Opcional. Enquanto estiver vazio, o topo mostra o nome escrito. PNG ou SVG com fundo transparente, claro sobre escuro.',
		}),
		defineField({
			name: 'heroImage',
			title: 'Ilustração da página inicial',
			type: 'image',
			description: 'A imagem grande embaixo do menu. Horizontal funciona melhor; até 2400 px no lado maior.',
			options: { hotspot: true },
			fields: [defineField({ name: 'alt', title: 'Descrição da imagem', type: 'localeLine', description: 'Para quem não vê a imagem: o que aparece nela.' })],
			validation: (r) => r.required(),
		}),
		defineField({
			name: 'links',
			title: 'Perfis (rodapé)',
			type: 'object',
			options: { collapsible: false },
			fields: [
				link('linkedin', 'LinkedIn', 'https://www.linkedin.com/in/…'),
				link('instagram', 'Instagram', 'https://www.instagram.com/…'),
				link('behance', 'Behance', 'https://www.behance.net/…'),
				link('bluesky', 'Bluesky', 'https://bsky.app/profile/…'),
				link('cara', 'Cara', 'https://cara.app/…'),
			],
		}),
	],
	preview: { prepare: () => ({ title: 'Página inicial' }) },
});
