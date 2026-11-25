import { ptBRLocale } from '@sanity/locale-pt-br';
import { visionTool } from '@sanity/vision';
import { defineConfig, isDev } from 'sanity';
import { structureTool } from 'sanity/structure';

import { presentation } from './presentation';

import { schemaTypes } from './schemaTypes';
import { SINGLETON_TYPES, structure } from './structure';

export default defineConfig({
	name: 'dhodge',
	title: 'Daniel Hodge',
	projectId: 'arbdqygj',
	dataset: 'production',
	/* The visual editor comes first: it is the tool the Studio opens on (Alex, 25/11/2026: always the default). */
	plugins: [presentation(isDev), structureTool({ title: 'Conteúdo', structure }), ptBRLocale(), ...(isDev ? [visionTool()] : [])],
	schema: {
		types: schemaTypes,
		// Singletons are never created from the "new document" menu.
		templates: (prev) => prev.filter((t) => !SINGLETON_TYPES.has(t.schemaType)),
	},
	document: {
		// Singletons: no duplicate or delete.
		actions: (prev, { schemaType }) => (SINGLETON_TYPES.has(schemaType) ? prev.filter((a) => !['duplicate', 'delete', 'unpublish'].includes(a.action ?? '')) : prev),
	},
});
