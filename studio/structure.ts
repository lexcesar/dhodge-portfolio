import { ArchiveIcon } from '@sanity/icons/Archive';
import { HomeIcon } from '@sanity/icons/Home';
import { ImagesIcon } from '@sanity/icons/Images';
import { ThListIcon } from '@sanity/icons/ThList';
import { UserIcon } from '@sanity/icons/User';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import type { StructureResolver } from 'sanity/structure';

import { CATEGORIES } from './schemaTypes/categories';
import { SECTIONS } from './schemaTypes/sections';

/* Fixed documents: the home page, the profile (About) and, from the previous site, one document per section. */
export const SINGLETON_TYPES = new Set(['home', 'profile', 'section']);

/* Projects are listed per category, in drag-and-drop order: the order on the site.
   "Site anterior" keeps the works and sections the previous site (Três portas) still reads; nothing there is deleted. */
export const structure: StructureResolver = (S, context) =>
	S.list()
		.title('Conteúdo')
		.items([
			S.listItem().title('Página inicial').icon(HomeIcon).child(S.document().schemaType('home').documentId('home').title('Página inicial')),
			S.divider(),
			...CATEGORIES.map((c) =>
				orderableDocumentListDeskItem({
					type: 'project',
					id: `projects-${c.value}`,
					title: c.title,
					icon: ImagesIcon,
					filter: 'category == $category',
					params: { category: c.value },
					S,
					context,
				}),
			),
			S.listItem().title('Todos os projetos').icon(ThListIcon).child(S.documentTypeList('project').title('Todos os projetos')),
			S.divider(),
			S.listItem().title('Sobre').icon(UserIcon).child(S.document().schemaType('profile').documentId('profile').title('Sobre')),
			S.divider(),
			S.listItem()
				.title('Site anterior (Três portas)')
				.icon(ArchiveIcon)
				.child(
					S.list()
						.title('Site anterior')
						.items(
							SECTIONS.map((s) =>
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
						),
				),
		]);
