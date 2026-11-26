# Handoff: portfólio do Daniel Hodge no Sanity

Escrito em 25/11/2026, no fim da sessão que fez a versão mobile e o menu. A próxima sessão abre com `claude-sanity`
(liga o MCP `mcp.sanity.io`) e, lá dentro, `/modo dev` (liga o plugin `sanity@sanity-agent-toolkit`, com as skills
`content-modeling-best-practices`, `sanity-migration` e `sanity-best-practices`). Atenção: `claude-sanity` passa por
`cc`, que é `--dangerously-skip-permissions`.

## Onde as coisas estão

- **Fonte:**
  - `design/b-tres-portas/`: `index.html`, `style.css`, `main.js`, `motion.js`, `portrait.js` e `menu.js`.
  - `design/assets/`: `works.js` (dados), `i18n.js` (textos PT/EN), `common.js`, `img/` (~100 jpg) e `fonts/`.
  - HTML/CSS/JS puro, sem build.
- **Commits locais** (sem push), na branch `main` deste repo:
  - `44f756a`: desktop aprovado.
  - `d171f6e`: mobile v1.
  - O menu novo está no estado registrado em "Estado da publicação", no fim deste arquivo.
- **Publicação:**
  - https://dhodge.thisisaxia.com, pelo Worker `axia-mockups` (repo `~/Projetos/axia/mockups`, pasta `sites/dhodge/`, `scripts/deploy.sh`).
  - A cópia publicada tem os caminhos `../assets/` trocados por `assets/`.
  - O checkout principal do mockups está num branch local sem push, então publica-se pela worktree `~/Projetos/axia/mockups-dhodge-wt`, a partir de `origin/main`.
  - O Worker manda `X-Robots-Tag: noindex`.
- O site também aparece no portfólio da Axia (site-axia v31, `todosRedesigns`), com vídeo e capa do desktop.
- Servidor local de teste: `python3 -m http.server 4330 --bind 127.0.0.1 --directory design`, aberto em
  http://127.0.0.1:4330/b-tres-portas/.
- Playwright: `require('/Users/alexander/Projetos/axia/tools/site-analyzer/node_modules/playwright')`. O WebKit roda
  pelo `executablePath` do build `~/Library/Caches/ms-playwright/webkit-2336`.

## Decisões do Alex (25/11/2026)

1. **Dono:** o projeto Sanity fica na organização da Axia. O Daniel entra como editor.
2. **Escopo:** o Daniel edita todo o conteúdo: obras (imagens, etapas de processo, vídeos, fan art), ordem, destaques,
   textos PT/EN, bio, prêmio, trajetória, TV, contatos e fotos do Sobre. Layout e movimento continuam no código.
3. **Endereço:** o site continua em dhodge.thisisaxia.com. Por isso o conteúdo pode vir em tempo de execução, do CDN do
   Sanity, pelo navegador: a edição aparece na hora, sem montar e publicar o site de novo. O `works.js` atual fica como
   reserva, caso a busca falhe.

## Proposta técnica (a validar com as skills do plugin)

- **Loader:** busca em GROQ e devolve as mesmas formas de hoje (`window.WORKS`, `window.PROFILE` e os mapas de i18n).
  Assim o runtime atual (main, menu, common) quase não muda. É a mesma ideia do alexcesar-com, que gerava `data.js` no
  formato antigo, só que lá era em tempo de build.
- **Fonte de verdade:** importa-se uma vez do `works.js` para o Sanity. Depois disso, a fonte passa a ser o Sanity.
- **Studio:** hospedado em `<nome>.sanity.studio`, como o matma.
- **CORS:** liberar dhodge.thisisaxia.com e localhost:4330.
- **Imagens:** do CDN do Sanity, com hotspot e alt obrigatório (padrão do `bild.ts` do matma). O loader monta a URL com
  largura (`?w=&auto=format`).
- **i18n:** campos localizados `{pt, en}` em objeto. Nenhum projeto da Noevu tem padrão de i18n de conteúdo; o
  comentário em `i18n.js:3-4` já previa isso. Títulos, `kind` e etapas de obra, que hoje são PT com mapa EN em
  `i18n.js:102-121`, viram campos localizados.
- **Tipos prováveis:**
  - `work`: título, ano, seção, tipo, fan art, imagem, fonte, etapas[{rótulo, imagem}] e ordem.
  - `profile` (singleton): bio, prêmio com making-of, trajetória, TV, links e fotos do Sobre.
  - `siteSettings` (singleton): leads das seções, as três portas (imagem e obra em destaque, hoje fixas no HTML e
    em `main.js:149-151` e `menu.js:38-40`) e rótulos.
  - Contagens continuam calculadas.

## Lições já escritas sobre Sanity (do explorador, com fonte)

- Schema que passa em vitest/tsc pode ser recusado pelo Sanity. O portão é `sanity schema extract` + `sanity build`.
  Fonte: memória cyberdise `cyberdise-gates-schema-sanity.md`.
- Patch só no publicado deixa o rascunho velho, e o preview lê rascunhos: preencher os dois.
  Fonte: `alexcesar-com/sanity-setup.md:38`.
- O Presentation varre o DOM uma vez. Texto inserido depois por JS não fica clicável, e arrastar para reordenar não
  funciona em site estático. Este site renderiza por JS, então o Visual Editing vai ser limitado.
  Fonte: `sanity-setup.md:40-41`.
- O Presentation percent-encoda o fragmento e quebra roteamento por hash.
  Fonte: `sanity-setup.md:35`.
- Sincronizar site→Sanity perde conteúdo em silêncio. A importação é uma só, com prova (md5 do snapshot, ids com
  prefixo do seed). Fontes: `sanity-schema-nao-cobre-o-site.md` e `seed-idempotencia-por-md5.md`.
- Renomear campo em 5 passos com `coalesce`. Fazer dump antes de migrar, e migração com dry-run por padrão.
  Fonte: physiopraxis `SCHEMA-CHANGE-SEQUENCE.md`.
- `sanity documents query` esconde rascunhos; para contá-los, usar `--api-version v2021-06-07`.
- Tokens só no Keychain, com nome do projeto (ex.: `DHODGE_SANITY_WRITE_TOKEN`). Nunca `.env` no repo.

Projetos de referência:
- `~/Projetos/axia/clients/noevu/matma-website/studio/` (o mais maduro).
- `~/Projetos/axia/clients/noevu/physiopraxis-website/studio/`.
- O template `~/Projetos/axia/mockups/templates/cinetico-sanity/`.

## Precisa de ok explícito do Alex antes

- Criar o projeto Sanity, o dataset, tokens ou CORS. O login é dele.
- Convidar o Daniel: isso envia e-mail.
- Importar dados no dataset.
- Publicar uma versão que lê do Sanity.

## Pendências e divergências

- `design/DIRECAO.md` foi reescrito em 26/11/2026 para a v3 ("Folha de rosto"); a direção da v2 fica no histórico do git.
- O `README.md` e o `works.js` têm bios diferentes. A certa é a do `works.js`: Ex Machina, eleito pelo público
  do Anima Mundi 2013 o melhor filme brasileiro de estudante, conferido em fontes.
- Falta só o e-mail do Daniel (o Alex vai passar; serve para o convite). O sketchbook é o Instagram que já está no
  site, e os retratos já estão no Sobre (Alex, 25/11/2026).
- O mobile não foi visto em iPhone ou Android de verdade, nem com VoiceOver.

## Estado em 25/11/2026 (2ª sessão): Sanity no ar

- **Projeto Sanity** `arbdqygj` ("Daniel Hodge · Portfólio"), org Axia `oyGCgNRv9`, dataset `production` **público**.
  - Studio em https://dhodge.sanity.studio (`studio/` neste repo; `pnpm dev` na porta 3333, `pnpm deploy`).
  - Sem tokens de API. Os dois que o create_project gerou vazaram no histórico e foram revogados. O site lê sem token, e
    scripts rodam com `sanity exec … --with-user-token` (login do CLI do Alex).
  - CORS sem credenciais: `https://dhodge.thisisaxia.com`, `http://127.0.0.1:4330`, `http://localhost:4330`. Com
    credenciais: `http://localhost:3333` (Studio local). **Outro host (domínio do Daniel, preview) precisa entrar no CORS**,
    senão o site cai calado no `works.js`.
- **Modelo:**
  - `work`: campos `{pt, en}`, seção, etapas e lista arrastável por seção (orderable-document-list).
  - `section` (`section-games` etc.): lead, destaque e miniaturas.
  - `profile`: bio, fotos, trajetória, prêmio, TV e perfis.
  - Ids sem ponto, porque id com ponto é privado mesmo em dataset público.
- **Importação** feita uma vez (`studio/scripts/import.ts`, md5 do snapshot `f5804d43…`): 49 docs, 75 imagens. Usa
  createIfNotExists, então rodar de novo não apaga edição do Daniel. 14 jpgs de `design/assets/img` não eram usados pelo
  site e não subiram.
- **Site:**
  - `design/assets/cms.js` busca no apicdn e monta `WORKS`/`PROFILE`/`SECTIONS`/`DH_IMG`. Depois injeta os scripts de
    `data-then`. Se falhar ou passar de 3 s, carrega `works.js`.
  - Uma edição publicada chega ao apicdn em ~0,3 s, mas o navegador guarda a resposta por até 60 s
    (`max-age=60`): avisar o Daniel.
  - Texto do CMS é escapado (`I18N.esc`) e os links só aceitam https.
  - Sem CSP: `script-src 'self'` barrava o beacon do Cloudflare Web Analytics e o JS Detections inline, que a Cloudflare
    injeta na borda a cada requisição. Liberar com `'unsafe-inline'` anularia a CSP.
  - O `works.js` é só reserva: **não editar mais**, porque a fonte de verdade é o Sanity.
- **Revisões:**
  - menu (4 achados) e integração (2 bloqueios + 7) corrigidos e verificados em Chromium e WebKit;
  - scripts de teste no scratchpad da sessão 0db4c706 (`check.cjs`, `menu-fix.cjs`, `hash.cjs`, `t1-t5.cjs`).
- **Editor visual (25/11/2026, tarde):** o Studio abre no "Editor visual" (Presentation), que é padrão em todo projeto,
  por pedido do Alex.
  - O site detecta que está dentro dele (iframe + `?sanity-preview-perspective=`, pai = Studio) e carrega
    `design/assets/preview.js`, gerado por `studio/preview/preview.ts` com `pnpm build:preview`: core-loader em live mode
    mais `@sanity/visual-editing-standalone`. O visitante comum não baixa nada disso.
  - Rascunhos vêm do próprio Studio (login do editor), sem token no site. Texto clicável por stega, imagens de obra por
    `data-sanity`.
  - **Ao vivo, sem refresh:** a edição redesenha no lugar (`DH_RERENDER`: prateleiras, destaques, portas, retrato,
    visualizador aberto, menu). Medido: ~1,6 s do rascunho salvo à prévia, sem reload.
  - Teste: `ve.cjs`/`ve2.cjs` no scratchpad da sessão, com o Studio local na porta 3333 e o site na 4330.
- **Daniel convidado como Editor** (daniel.hodge@gmail.com, 25/11/2026, convite pendente).
- **Falta:**
  - escrever um guia curto do Studio para o Daniel;
  - e-mail de contato no site: o campo saiu do schema até existir no layout;
  - fotos com GPS: o CDN serve o original a quem tiver a URL, então tirar EXIF antes de subir;
  - teste em iPhone/Android de verdade e com VoiceOver.

## Estado em 26/11/2026: a estrutura pedida pelo Daniel (branch `redesign/estrutura-daniel`, sem merge)

- **Pedido do Daniel, por voz:**
  - no topo, o logo (por ora o nome) e "Ilustrador · Character designer · Autor";
  - um menu com Character design, Ilustração, Livros infantis e Arte pessoal;
  - cada categoria mostra uma capa por projeto, e o projeto abre numa rolagem de imagens com texto;
  - no rodapé, LinkedIn, Instagram, Behance, Bluesky e Cara;
  - na página inicial, uma ilustração que ele troca depois.
- **Site v3 "Folha de rosto":**
  - Fica em `design/site/` (index.html, app.js, stage.js, menu.js, motion.js, portrait.js, style.css), com
    `design/assets/{cms,common,i18n}.js` reescritos. Local: http://127.0.0.1:4330/site/.
  - Rotas por parâmetro: `?category=`, `?project=`, `?page=about` e `?lang=`. Links antigos (`?para=`, `#sobre` etc.)
    são convertidos.
  - Animação e Sobre saíram do menu. O Sobre fica no topo e no rodapé, e a Animação mora no Sobre.
- **O site publicado (v2) não muda:**
  - `design/b-tres-portas/` carrega cópias congeladas de `main` em `design/assets/v2/`.
  - Os tipos `work` e `section` continuam no Studio, em "Site anterior (Três portas)". Nada foi apagado.
- **Modelo novo:**
  - `project`: título `{pt,en}`, slug, categoria, ano, fan art, capa com alt e legenda, introdução, blocos (imagem com
    legenda e texto, ou só texto), link da fonte e ordem arrastável por categoria.
  - `home` (singleton): papéis, logo, ilustração, links.
  - Categorias fixas em `studio/schemaTypes/categories.ts`.
- **Dados:**
  - Enquanto o dataset não tiver `project`, o site usa o snapshot `design/assets/projects.js`, de 23 projetos. Ele
    também cobre erro e timeout.
  - O snapshot é gerado pela migração e tem o mesmo formato da consulta.
- **Migração** (`studio/scripts/migrate-projects.ts`):
  - `pnpm migrate:dry` só lê e escreve o snapshot.
  - `pnpm migrate` (precisa do ok do Alex) sobe 6 imagens que faltam e cria 23 `project` e o `home` com
    createIfNotExists. Rodar de novo não sobrescreve edição do Daniel.
  - Textos só das fontes, ao pé da letra.
- **Editor visual:**
  - `presentation.ts` abre `/site/` no Studio local e `/` no hospedado.
  - **O deploy do Studio tem que andar junto com a publicação da v3**: antes disso, o Studio hospedado abriria a v2
    na raiz, que não entende `?project=`.
  - `preview.js` foi regerado (v=5).
  - As duas armadilhas continuam tratadas: a perspectiva fica guardada na sessão, com rascunhos por padrão, e há um
    `$load` novo a cada carga.
  - O roteador avisa o Studio por `dh:navigate`, e o Studio navega por `dh:route`.
  - Cada edição redesenha no lugar (`DH_RERENDER`) sem replay da entrada.
  - O ao vivo de verdade só dá para testar depois da migração, porque sem `project` no dataset a prévia fica no
    snapshot.
- **QA:** scripts em `qa/` no scratchpad da sessão d9121b74: `smoke.cjs`, `flow.cjs`, `widths.cjs`, `live.cjs`,
  `reduced.cjs` e `vt.cjs`.
