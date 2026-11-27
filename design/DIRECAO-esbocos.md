# Direção: Daniel Hodge, versão dos esboços (`design/site-v3/`)

**Base:** três esboços a lápis do Daniel (`design/referencias/esbocos-daniel-2026-11-27/esboco-{1,2,3}.jpeg`) e a
fala dele, por voz, de 27/11/2026. Decisões do Alex no mesmo dia: "é só seguir". **Data:** 27/11/2026.
**A versão anterior fica:** `design/site/` (tag `estrutura-daniel-v1`), publicada em dhodge-portfolio.thisisaxia.com.

## 1. A frase
Uma folha branca com o desenho no meio. A interface é a moldura de uma galeria, em letra pequena em volta; o desenho é
a estrela (Alex, 26/11).

## 2. O que segue o esboço, ao pé da letra
- **Topo:** "DANIEL HODGE" e, ao lado, menor, "illustrator & character designer", numa linha só, no alto à esquerda.
  "Author" saiu do papel.
- **Menu:** "illustration • projects • children's book", centralizado, sobre um fio horizontal comprido. O item ativo
  fica sublinhado.
- **Home:** uma ilustração só, pequena, no meio da tela, com muito ar em volta. Hover num item do menu troca a imagem
  pela da categoria, num esmaecimento cruzado. O foco pelo teclado faz o mesmo.
- **Categoria:** grid de 3 colunas, um cartão por projeto. No hover, a imagem esmaece e o título aparece por cima,
  centralizado.
- **Projeto:** as imagens grandes, uma depois da outra, rolando para baixo, com os textos do Daniel entre elas.
- **Rodapé:** "LinkedIn / Instagram / Bsky / Cara", em texto simples, embaixo à esquerda. O Behance saiu.

## 3. O que precisou ser decidido (fora do esboço)
- **Claro e escuro pelo sistema** (`prefers-color-scheme`), sem botão. Claro: papel `#fcfcfb`, tinta `#151515`
  (17,8:1), texto secundário `#5e5e5a` (6,3:1). Escuro: papel `#101010`, tinta `#ecece8` (16,1:1), secundário
  `#a2a29c` (7,4:1). Sem cor de destaque: a cor é a do desenho.
- **Letra:** as mesmas fontes locais das versões anteriores. Anybody, em caixa alta, no nome; Bricolage Grotesque em
  todo o resto, num peso só, menos os títulos.
- **PT/EN:** fica, pequeno, no canto direito do topo ("PT / EN"). Menu em PT: ilustração • projetos • livro infantil.
- **Grid:** células 4:5 (a proporção do esboço), com a arte recortada ao centro; a peça inteira está no projeto. O
  ponto de recorte de cada capa pode ser ajustado em `data.js` (`focus`).
- **Toque (sem hover):** o título fica sempre visível, abaixo da imagem, discreto. Na home do celular fica a imagem
  padrão, e tocar num item navega.
- **Grid no celular:** 1 coluna até 559 px, 2 até 1023 px, 3 daí para cima.
- **Projeto:** cada imagem cabe inteira na altura da tela (até 86% dela). Título e ano centralizados acima, pequenos;
  as legendas de etapa do Daniel ("Linha", "Cor"…) ficam embaixo de cada imagem. No fim, "Próximo projeto", dentro da
  mesma categoria.
- **Fora da interface:** Sobre e Animação. Não há visualizador ampliado: as imagens já estão grandes.
- **Dados:** o snapshot `design/assets/projects.js`, lido sem alteração. Tudo o que o Daniel vai trocar (as 4 imagens
  da home, a troca de categoria por projeto, o recorte do grid e os links) fica num lugar só: `design/site-v3/data.js`.
  Sanity parado (Alex, 26/11).

## 4. Movimento
Curto e discreto. Hover, foco e ativo mudam por cor ou sublinhado que esmaece (150 a 220 ms). A imagem da home troca
num esmaecimento cruzado de 360 ms; o cartão esmaece para 12% em 360 ms e o título aparece em 220 ms. Toda imagem chega
com um esmaecimento. Troca de tela: esmaecimento de 160 a 220 ms. Nada desliza, cresce ou segue o cursor; cursor do
sistema. `prefers-reduced-motion`: sem transições.

## 5. O que esta versão não terá
Cursor próprio, revelação ao rolar, paralaxe, zoom no hover, rolagem inercial, eyebrow, legenda inventada, texto sobre a
obra que não esteja nas fontes.

## 6. Portões que rodam
`node --check`; console limpo em Chromium e WebKit; sem rolagem lateral de 320 a 1920; claro e escuro; teclado (foco
igual ao hover); movimento reduzido; `axia-design/scripts/states.js` sem salto; contraste AA nos dois temas.

## 7. Moodboard
Os esboços do Daniel fazem o papel do moodboard e da aprovação (o Alex mandou seguir). O `moodboard_gate.py` não se
aplica a esta rodada.
