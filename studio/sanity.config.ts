import { ptBRLocale } from '@sanity/locale-pt-br';
import { visionTool } from '@sanity/vision';
import { defineConfig, isDev } from 'sanity';
import { structureTool } from 'sanity/structure';

import { schemaTypes } from './schemaTypes';
import { SINGLETON_TYPES, structure } from './structure';

export default defineConfig({
	name: 'dhodge',
	title: 'Daniel Hodge',
	projectId: 'arbdqygj',
	dataset: 'production',
	plugins: [structureTool({ title: 'Conteúdo', structure }), ptBRLocale(), ...(isDev ? [visionTool()] : [])],
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
