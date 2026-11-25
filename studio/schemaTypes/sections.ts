export const SECTIONS = [
	{ title: 'Games', value: 'games' },
	{ title: 'Animação', value: 'animacao' },
	{ title: 'Livros infantis', value: 'livros' },
	{ title: 'Sketchbook', value: 'sketchbook' },
] as const;
export type SectionKey = (typeof SECTIONS)[number]['value'];
