/* Works data. Same shape as the future Sanity "work" document:
   id, title, year, section, kind, fan (third-party IP or null), img, w, h, steps[], source.
   Titles and years come from Daniel's ArtStation / Behance pages (collected 24/11/2026). */
const AS = 'https://www.artstation.com/artwork/';
const BE = 'https://www.behance.net/gallery/';

window.WORKS = [
	// Games
	{ id: 'bear', title: 'Polar Bearfolk Ranger', year: 2022, section: 'games', kind: 'Ilustração de personagem', fan: null,
		img: 'bear-final', w: 911, h: 1463, source: AS + 'OmxKlb',
		steps: [['Miniaturas', 'bear-sketches'], ['Linha', 'bear-line'], ['Valores', 'bear-values'], ['Cor', 'bear-final']] },
	{ id: 'fizzban', title: 'Fizzban, the Pirate', year: 2025, section: 'games', kind: 'Arte de card', fan: 'Hearthstone',
		img: 'fizzban-final', w: 1343, h: 1800, source: BE + '228542169/Hearthstone-Fan-Art-Fizzban-the-Pirate',
		steps: [['Miniaturas', 'fizzban-thumbs'], ['Esboços', 'fizzban-sketch-e'], ['Linha', 'fizzban-lines'], ['Cor', 'fizzban-color'], ['Final', 'fizzban-final']] },
	{ id: 'ooops', title: 'Ooops!', year: 2025, section: 'games', kind: 'Arte de card', fan: 'Hearthstone',
		img: 'ooops-final', w: 1800, h: 1350, source: BE + '228544059/Hearthstone-Fan-Art-Ooops',
		steps: [['Miniaturas', 'ooops-thumbs'], ['Opções', 'ooops-thumbs-b'], ['Final', 'ooops-final']] },
	{ id: 'dontstop', title: "Don't Stop Me Now", year: 2025, section: 'games', kind: 'Arte de card', fan: 'Hearthstone',
		img: 'dontstop-final', w: 1464, h: 1800, source: BE + '228543643/Hearthstone-Fan-Art-Dont-Stop-Me-Now',
		steps: [['Miniaturas', 'dontstop-thumbs'], ['Cor', 'dontstop-color'], ['Final', 'dontstop-final']] },
	{ id: 'boots', title: 'Seven League Boots', year: 2015, section: 'games', kind: 'Personagem', fan: null,
		img: 'seven-league-boots', w: 1024, h: 1393, source: AS + 'nJ8mX' },
	{ id: 'hut', title: 'Hut of brown, now sit down', year: 2016, section: 'games', kind: 'Personagem', fan: null,
		img: 'hut-of-brown', w: 1000, h: 1322, source: AS + 'YqLGP' },
	{ id: 'udyr', title: 'Udyr', year: 2016, section: 'games', kind: 'Splash', fan: 'League of Legends',
		img: 'udyr', w: 1024, h: 576, source: AS + 'Kv6rB' },
	{ id: 'leon', title: 'Leon the Knife-Thrower', year: 2015, section: 'games', kind: 'Personagem', fan: null,
		img: 'leon', w: 1000, h: 883, source: AS + 'eR48b' },
	{ id: 'giuseppe', title: "Giuseppe 'Corpse Face' Gambino", year: 2015, section: 'games', kind: 'Personagem', fan: null,
		img: 'giuseppe', w: 900, h: 1200, source: AS + '8Bo4q' },
	{ id: 'clayton', title: 'Clayton, the sea wolf', year: 2016, section: 'games', kind: 'Retrato', fan: null,
		img: 'clayton', w: 800, h: 753, source: AS + 'XN6bL' },
	{ id: 'sinbad', title: 'Sinbad the sailor', year: 2015, section: 'games', kind: 'Personagem', fan: null,
		img: 'sinbad', w: 1000, h: 1294, source: AS + 'LZRYw' },
	{ id: 'severino', title: 'Severino', year: 2016, section: 'games', kind: 'Personagem', fan: null,
		img: 'severino', w: 1200, h: 1200, source: AS + 'ZJ63m' },
	{ id: 'bride', title: 'The Bride', year: 2017, section: 'games', kind: 'Retrato', fan: null,
		img: 'bride', w: 1200, h: 1200, source: AS + 'QPO0r' },
	{ id: 'linebeck', title: 'Linebeck', year: 2016, section: 'games', kind: 'Personagem', fan: 'The Legend of Zelda',
		img: 'linebeck', w: 1200, h: 1285, source: AS + 'E9GDA' },
	{ id: 'strange', title: 'Dr. Strange', year: 2016, section: 'games', kind: 'Ilustração', fan: 'Marvel',
		img: 'dr-strange', w: 1200, h: 849, source: AS + '6Zy8x' },
	{ id: 'torero', title: 'El Torero', year: 2015, section: 'games', kind: 'Personagem', fan: null,
		img: 'el-torero', w: 1200, h: 900, source: AS + 'wOrLV' },
	{ id: 'feb', title: 'Soldado da FEB', year: 2015, section: 'games', kind: 'Personagem', fan: null,
		img: 'feb-soldier', w: 800, h: 1159, source: AS + 'Ba5b9' },
	{ id: 'vampire', title: 'The Vampire', year: 2015, section: 'games', kind: 'Personagem', fan: null,
		img: 'vampire', w: 1000, h: 1250, source: AS + 'zzwBQ' },

	// Animation
	{ id: 'robot', title: 'Finally, we found a giant robot!', year: 2025, section: 'animacao', kind: 'Do design ao frame', fan: null,
		img: 'robot-5', w: 1800, h: 1013, source: BE + '223698601/Finally-we-found-a-giant-robot',
		steps: [['Design', 'robot-1'], ['Storyboard', 'robot-2'], ['Layout 3D', 'robot-3'], ['Câmera', 'robot-4'], ['Frame final', 'robot-5']] },
	{ id: 'portais', title: 'Portais do Rio', year: 2015, section: 'animacao', kind: 'Projeto pessoal · cenários e personagens', fan: null,
		img: 'portais-4', w: 1200, h: 900, source: AS + 'Y8gE3',
		steps: [['Personagens', 'portais-1'], ['Expressões', 'portais-2'], ['Figurino', 'portais-3'], ['Cena', 'portais-4'], ['Cena', 'portais-5'], ['Portal', 'portais-6']] },
	{ id: 'space', title: 'Projeto pessoal', year: 2016, section: 'animacao', kind: 'Cena e personagem', fan: null,
		img: 'space-boy', w: 1200, h: 675, source: AS + '8rl2Q',
		steps: [['Cena', 'space-boy'], ['Cenário', 'building'], ['Personagem', 'boy-megaphone'], ['Model sheet', 'boy-sheet']] },

	// Children's books
	{ id: 'tito', title: 'Tito Club', year: 2016, section: 'livros', kind: 'Livro infantil', fan: null,
		img: 'tito-2', w: 1454, h: 1000, source: AS + 'r0O0J' },
	{ id: 'abc-a', title: 'Tito Club · A', year: 2018, section: 'livros', kind: 'Abecedário', fan: null, img: 'abc-a', w: 1000, h: 1000, source: BE + '63447693/Book-Illustration' },
	{ id: 'abc-b', title: 'Tito Club · B', year: 2018, section: 'livros', kind: 'Abecedário', fan: null, img: 'abc-b', w: 1000, h: 1000, source: BE + '63447693/Book-Illustration' },
	{ id: 'abc-e', title: 'Tito Club · E', year: 2018, section: 'livros', kind: 'Abecedário', fan: null, img: 'abc-e', w: 1200, h: 1200, source: BE + '63447693/Book-Illustration' },
	{ id: 'abc-p', title: 'Tito Club · P', year: 2018, section: 'livros', kind: 'Abecedário', fan: null, img: 'abc-p', w: 1200, h: 1200, source: BE + '63447693/Book-Illustration' },
	{ id: 'abc-s', title: 'Tito Club · S', year: 2018, section: 'livros', kind: 'Abecedário', fan: null, img: 'abc-s', w: 1200, h: 1200, source: BE + '63447693/Book-Illustration' },
	{ id: 'abc-w', title: 'Tito Club · W', year: 2018, section: 'livros', kind: 'Abecedário', fan: null, img: 'abc-w', w: 1200, h: 1200, source: BE + '63447693/Book-Illustration' },
	{ id: 'kitchen', title: 'Na cozinha', year: 2018, section: 'livros', kind: 'Ilustração de livro', fan: null, img: 'kitchen', w: 1600, h: 1000, source: BE + '63447693/Book-Illustration' },
	{ id: 'kings', title: 'O trono', year: 2018, section: 'livros', kind: 'Ilustração de livro', fan: null, img: 'kings', w: 1200, h: 907, source: BE + '63447693/Book-Illustration' },
	{ id: 'dino', title: 'O robô dinossauro', year: 2018, section: 'livros', kind: 'Ilustração de livro', fan: null, img: 'robot-dino', w: 880, h: 800, source: BE + '63447693/Book-Illustration' },
	{ id: 'chase', title: 'A perseguição', year: 2018, section: 'livros', kind: 'Ilustração de livro', fan: null, img: 'dog-chase', w: 1380, h: 800, source: BE + '63447693/Book-Illustration' },
	{ id: 'protetores', title: 'Tito e os Protetores', year: 2015, section: 'livros', kind: 'Projeto pessoal', fan: null, img: 'tito-protetores', w: 1024, h: 500, source: AS + 'wPxRw' },
	{ id: 'plumba', title: 'Plumba', year: 2016, section: 'livros', kind: 'Personagem', fan: null, img: 'plumba', w: 1200, h: 1304, source: AS + 'P2GQ3' },
	{ id: 'rooster', title: 'Rockabilly Rooster', year: 2015, section: 'livros', kind: 'Personagem', fan: null, img: 'rooster', w: 1000, h: 1681, source: AS + 'ZParX' },
	{ id: 'rui', title: 'Rui', year: 2015, section: 'livros', kind: 'Projeto pessoal', fan: null, img: 'rui', w: 1000, h: 1415, source: AS + 'DYQoO' },
	{ id: 'monica', title: 'Turma da Mônica', year: 2026, section: 'livros', kind: 'Ilustração', fan: 'Turma da Mônica', img: 'monica-3', w: 1800, h: 1794, source: BE + '254081021/Turma-da-Monica-Fan-Art',
		steps: [['Nanquim', 'monica-2'], ['Cor', 'monica-3'], ['Cena', 'monica-1']] },

	// Sketchbook (process sheets)
	{ id: 'sk-bear', title: 'Urso polar · miniaturas A, B, C', year: 2022, section: 'sketchbook', kind: 'Esboço', fan: null, img: 'bear-sketches', w: 1800, h: 1052, source: AS + 'OmxKlb' },
	{ id: 'sk-witch', title: 'Bruxa, lápis de cor', year: 2018, section: 'sketchbook', kind: 'Lápis de cor sobre papel', fan: null, img: 'witch-pencil', w: 1800, h: 1800, source: BE + '63447693/Book-Illustration' },
	{ id: 'sk-fizz-a', title: 'Pirata · estudos de pose', year: 2025, section: 'sketchbook', kind: 'Esboço', fan: 'Hearthstone', img: 'fizzban-sketch-c', w: 1800, h: 996, source: BE + '228542169/Hearthstone-Fan-Art-Fizzban-the-Pirate' },
	{ id: 'sk-robot', title: 'Robô gigante · storyboard', year: 2025, section: 'sketchbook', kind: 'Storyboard', fan: null, img: 'robot-2', w: 1800, h: 838, source: BE + '223698601/Finally-we-found-a-giant-robot' },
	{ id: 'sk-fizz-b', title: 'Pirata · lineup', year: 2025, section: 'sketchbook', kind: 'Esboço', fan: 'Hearthstone', img: 'fizzban-sketch-a', w: 1800, h: 938, source: BE + '228542169/Hearthstone-Fan-Art-Fizzban-the-Pirate' },
	{ id: 'sk-dont', title: 'Miniaturas de composição', year: 2025, section: 'sketchbook', kind: 'Esboço', fan: 'Hearthstone', img: 'dontstop-thumbs', w: 1800, h: 586, source: BE + '228543643/Hearthstone-Fan-Art-Dont-Stop-Me-Now' },
	{ id: 'sk-monica', title: 'Nanquim', year: 2026, section: 'sketchbook', kind: 'Nanquim', fan: 'Turma da Mônica', img: 'monica-2', w: 1800, h: 1620, source: BE + '254081021/Turma-da-Monica-Fan-Art' },
];

window.PROFILE = {
	name: 'Daniel Hodge',
	bio: {
		pt: 'Oito anos em games, com Street Fighter 5, Diablo, Riot e Sony. Cards para Disney, Magic: The Gathering e Marvel. Aberturas de novela da Globo, livros infantis e o curta Ex Machina, eleito pelo público do Anima Mundi 2013 o melhor filme brasileiro de estudante.',
		en: 'Eight years in games, on Street Fighter 5, Diablo, Riot and Sony. Cards for Disney, Magic: The Gathering and Marvel. TV openings for Globo, children’s books, and Ex Machina, a short voted Best Brazilian Student Film by the Anima Mundi 2013 audience.',
	},
	/* Anima Mundi 2013. Source: the festival's own winners list ("Premiados 2013", Wayback snapshot),
	   IMDb tt26469510, and the MELIES / co-director YouTube uploads. */
	award: {
		festival: 'Anima Mundi', year: 2013,
		work: 'Ex Machina', workYear: 2012, video: ['youtube', '3sjBzNjgFrI'], still: 'ex-machina',
		prize: { pt: 'Melhor filme brasileiro de estudante, pelo voto do público do Rio e de São Paulo', en: 'Best Brazilian student film, by audience vote in Rio and São Paulo' },
		given: { pt: 'Prêmio Núcleo de Cinema de Animação de Campinas', en: 'Núcleo de Cinema de Animação de Campinas Award' },
		credits: { pt: 'Curta de animação 3D, 2012. Direção e roteiro de Daniel Hodge e Eduardo Watanabe Ribeiro, como trabalho de conclusão do curso Voyage, na Melies.', en: '3D animated short, 2012. Written and directed by Daniel Hodge and Eduardo Watanabe Ribeiro as their Voyage course final project at Melies.' },
		about: { pt: 'Um mundo de máquinas, em clima de distopia. Sete meses de trabalho, e o primeiro filme dos dois.', en: 'A dystopian world of machines. Seven months of work, and the first film for both of them.' },
		making: [
			[['youtube', 'DIN3CD-5qYA'], { pt: 'Making of da animação', en: 'Animation making-of' }, 'exm-making-anim'],
			[['youtube', 'acqga1xKvzE'], { pt: 'Making of do rig', en: 'Rigging making-of' }, 'exm-making-rig'],
		],
		source: 'https://web.archive.org/web/20140518140826/http://www.animamundi.com.br/2014/festival/premiados-2013/',
	},
	timeline: [
		['2019–2024', 'Lemon Sky', { pt: '2D Concept Artist · Malásia', en: '2D Concept Artist · Malaysia' }],
		['2017–2018', 'Streamline Studios', { pt: '2D Concept Artist · Kuala Lumpur', en: '2D Concept Artist · Kuala Lumpur' }],
		['2012–2013', 'BeeldMotion', { pt: 'Ilustrador · abertura de A Grande Família (Globo), Reis da Comédia (Telecine Fun)', en: 'Illustrator · A Grande Família opening (Globo), Reis da Comédia (Telecine Fun)' }],
		['—', 'MELIES', { pt: 'Escola de Cinema 3D e Animação', en: '3D Film and Animation School' }],
	],
	/* TV work at BEELD (Rio), from BEELD's official Vimeo (vimeo.com/beeldmotion); Daniel is in each crew list.
	   "Reis da Comédia" (Telecine Fun) is on his LinkedIn but has no official video online. */
	tv: [
		{ title: 'A Grande Família', year: 2012, length: '0:45', video: ['vimeo', '39794288'], still: 'tv-grande-familia',
			what: { pt: 'Abertura da série da Rede Globo, usada nas temporadas de 2012 e 2013. A família atravessa a história, da pré-história até hoje.', en: 'Opening titles for the Rede Globo sitcom, used in the 2012 and 2013 seasons. The family travels through history, from the Stone Age to today.' },
			credit: { pt: 'BEELD e Videographics/CGCOM · Rede Globo', en: 'BEELD and Videographics/CGCOM · Rede Globo' } },
		{ title: 'Ultrapassagem perigosa', year: 2012, length: '0:30', video: ['vimeo', '48329960'], still: 'tv-ultrapassagem',
			what: { pt: 'Campanha “Vida Real, Riscos Reais”', en: '“Real Life, Real Risks” campaign' }, credit: { pt: 'AAB, FIA e Rede Globo', en: 'AAB, FIA and Rede Globo' } },
		{ title: 'Celular e direção', year: 2012, length: '0:30', video: ['vimeo', '48042271'], still: 'tv-celular',
			what: { pt: 'Campanha “Vida Real, Riscos Reais”', en: '“Real Life, Real Risks” campaign' }, credit: { pt: 'AAB, FIA e Rede Globo', en: 'AAB, FIA and Rede Globo' } },
		{ title: 'Bebida e direção', year: 2013, length: '0:27', video: ['vimeo', '57070896'], still: 'tv-bebida',
			what: { pt: 'Campanha “Vida Real, Riscos Reais”', en: '“Real Life, Real Risks” campaign' }, credit: { pt: 'AAB, FIA e Rede Globo', en: 'AAB, FIA and Rede Globo' } },
	],
	tvAlso: { pt: 'Também na BEELD: Reis da Comédia, pacote de chamadas para o Telecine Fun.', en: 'Also at BEELD: Reis da Comédia, a promo package for Telecine Fun.' },
	links: [
		['ArtStation', 'https://www.artstation.com/dhodge'],
		['Behance', 'https://www.behance.net/dhodge'],
		['Instagram', 'https://www.instagram.com/dlh.suzuki/'],
		['LinkedIn', 'https://www.linkedin.com/in/daniel-hodge-201aa470/'],
	],
	/* Travel photos for the About section (same size, 4:3). Captions are jokes, editable. */
	photos: [
		{ img: 'about-1', alt: { pt: 'Daniel de braços abertos em T, diante de uma parede de fotos antigas', en: 'Daniel in a T-pose, arms wide, in front of a wall of old photos' },
			caption: { pt: 'Pose em T. Antes do rig.', en: 'T-pose. Before rigging.' } },
		{ img: 'about-2', alt: { pt: 'Daniel em plena queda na escada, borrado de movimento', en: 'Daniel mid-fall on a staircase, motion-blurred' },
			caption: { pt: 'Comprime e estica, ao vivo.', en: 'Squash and stretch, live.' } },
		{ img: 'about-3', alt: { pt: 'Daniel parado sobre o gelo de uma geleira, montanhas ao fundo', en: 'Daniel standing on a glacier, mountains behind' },
			caption: { pt: 'A única foto em que ele ficou parado.', en: 'The only photo where he held still.' } },
	],
};
