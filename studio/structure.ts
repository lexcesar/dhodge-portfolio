import { ImagesIcon } from '@sanity/icons/Images';
import { ThListIcon } from '@sanity/icons/ThList';
import { UserIcon } from '@sanity/icons/User';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import type { StructureResolver } from 'sanity/structure';

import { SECTIONS } from './schemaTypes/sections';

/* Fixed documents: the profile and one document per section. Works are listed per section, in drag-and-drop order. */
export const SINGLETON_TYPES = new Set(['profile', 'section']);

export const structure: StructureResolver = (S, context) =>
	S.list()
		.title('Conteúdo')
		.items([
			S.listItem().title('Perfil').icon(UserIcon).child(S.document().schemaType('profile').documentId('profile').title('Perfil')),
			S.divider(),
			...SECTIONS.map((s) =>
				S.listItem()
					.title(s.title)
					.icon(ImagesIcon)
					.child(
						S.list()
							.title(s.title)
							.items([
								S.listItem().title('Abertura e destaque').icon(ThListIcon).child(S.document().schemaType('section').documentId(`section-${s.value}`).title(s.title)),
								orderableDocumentListDeskItem({
									type: 'work',
									id: `works-${s.value}`,
									title: 'Obras (arraste para ordenar)',
									filter: 'section == $section',
									params: { section: s.value },
									S,
									context,
								}),
							]),
					),
			),
		]);
