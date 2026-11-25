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

- `design/DIRECAO.md` está desatualizado: diz "só desktop" e "só pt-BR". O site já é PT/EN e tem mobile.
- O `README.md` e o `works.js` têm bios diferentes. A certa é a do `works.js`: Ex Machina, eleito pelo público
  do Anima Mundi 2013 o melhor filme brasileiro de estudante, conferido em fontes.
- Falta: e-mail de contato do Daniel, sketchbook do Instagram e retrato dele.
- O mobile não foi visto em iPhone ou Android de verdade, nem com VoiceOver.

## Estado da publicação (primeira tarefa da sessão nova)

O menu mobile novo ("teste de lápis", feito pelo Opus) está commitado localmente e **ainda não foi publicado**. O Alex
já autorizou a publicação em 25/11/2026, mas a revisão adversarial foi interrompida antes do fim.

1. Rodar o `revisor-critico` no diff `d171f6e..HEAD -- design/`, lendo `menu.js` inteiro. Pontos a atacar:
   - corridas: toque duplo no gatilho, tocar numa seção ou trocar o idioma durante a animação, girar o aparelho para
     ≥1024 px com o menu aberto, popstate/hash;
   - os ~1,7 MB de quadros carregados em segundo plano: disparam no desktop? respeitam Save-Data?
   - vazamentos de WAAPI, rAF ou listeners depois da troca de idioma;
   - navegador sem View Transitions;
   - a trava de rolagem;
   - a convivência com o `dialog.viewer` e com o `motion.js`;
   - a faixa de 1024–1279 px;
   - as regras de 600–1023 px que foram removidas.
2. Corrigir o que for grave e publicar pelo mockups, como descrito em "Onde as coisas estão".
3. Material da verificação do Opus, em
   `/private/tmp/claude-501/-Users-alexander-Projetos-axia-clients-dhodge/ff6a939c-e55b-47a5-8a67-468ffd29b0ff/scratchpad/menu/`:
   vídeos, quadros-chave e prints. Pode ter sido apagado na limpeza do tmp.
   - O desktop foi conferido idêntico em 1280, 1440 e 1920, PT e EN.
   - Zero rolagem horizontal, zero alvos menores que 44 px, contraste AA.
