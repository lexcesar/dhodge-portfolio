# Direção: Daniel Hodge, portfólio (v3, "Folha de rosto")

**Briefing base:** pedido de voz do Daniel (abaixo, literal) e as decisões do Alex de 26/11/2026 · **Data:** 26/11/2026 ·
**Nicho:** ilustrador 2D, character designer e autor de livro infantil · **Publicidade regulada:** não.
**Escopo:** a estrutura nova inteira, PT/EN, do celular (320) ao Full HD (1920) e QuadHD. Substitui a v2 "Três portas",
congelada na tag `tres-portas-2026-11-26` e no branch `arquivo/tres-portas`.

**O pedido do Daniel (transcrição de voz, literal):** "Teria no topo da página inicial, teria dizendo que eu era só
escrito, né? Ilustrador, illustrator, character designer e author, né? Autor. Sei lá, separados por ponto. E teria um
menu embaixo com, seria character design, illustrations, children's book e personal art. Aí, quando eu clicasse em um,
por exemplo, character design, ele mostraria como se fosse uma imagem para cada projeto. Por exemplo, teria um projeto
que eu trabalhei que mostraria uma imagem principal. Aí, quando eu clicasse nessa imagem, ele mostraria outras imagens
também em formato de scroll, né? Você vai descendo e vai vendo as imagens com texto. E isso aconteceria também em
ilustração, children's book e personal art. E na parte de baixo estaria link do meu LinkedIn, Instagram, Behance,
Blue Sky e o cara. Basicamente isso. Aí na tela inicial também, embaixo do menu, teria só uma imagem que eu faria
depois, uma ilustração. Pode botar uma só como exemplo, mas eu poderia mudar depois. Depois também eu tenho que pensar
na minha logo. Eu botaria minha logo no topo da página também, posteriormente."

## 1. A frase
A página inicial é a folha de rosto de um livro: o nome do autor, os papéis, o sumário de quatro capítulos e uma
ilustração de frontispício. A interface fica quieta, como a moldura de uma galeria: o desenho é a estrela.

## 2. Ponto forte tímido
O processo continua sendo o forte (miniatura → linha → valores → cor), escondido no fim das galerias do Behance. Na v2
ele era o botão "ver processo"; agora as etapas são os próprios blocos do projeto, que se leem rolando, na ordem em
que o Daniel as publicou.

## 3. Oceano vermelho do segmento
Grade de miniaturas estilo ArtStation em fundo preto, "Hi, I'm…" no topo, carrossel, mesma moldura em tudo.
**Não teremos:** frase de efeito ou bio no topo ("só escrito": nome, papéis, menu), grade uniforme que corta a arte
(as capas ficam inteiras, em fileiras justificadas), eyebrow numerado, mono em rótulo, nav que rola para o lado
(reprovado pelo Alex), palavra dentro do cursor.

## 4. Material que o cliente tem
- As obras que já estão no Sanity (43 `work`, 75 imagens) e os jpgs de `design/assets/img/`; os projetos de origem no
  Behance (8) e no ArtStation (23), em `media/manifest.json`. Os títulos e datas vêm daí. **Descrições:** só as que o
  próprio Daniel escreveu nas fontes, copiadas ao pé da letra e no idioma em que estão (as introduções de Portais do Rio,
  Character Design, Polar Bearfolk Ranger, Finally we found a giant robot!, Turma da Mônica e Dr. Strange; o texto de
  Fizzban; as legendas de título de algumas imagens). Os outros campos de texto nascem vazios para o Daniel escrever.
- **Falta, e quem fornece:** o logo (Daniel, "depois"), a ilustração da página inicial (Daniel, "eu faria depois"),
  os endereços do Bluesky e do Cara (não achados com segurança), os textos de cada projeto.
- **Imagem de exemplo na página inicial:** o frame final de "Finally, we found a giant robot!" (2025): obra autoral,
  recente, horizontal (16:9) e a mais cinematográfica do acervo. Fan art fica fora da vitrine principal.

## 5. Marca
Sem logo ainda: o nome é o logotipo tipográfico (Anybody 800, 70 % de largura). O lugar do logo tem altura fixa, e a
imagem do campo `logo`, quando existir, entra nele sem mexer no layout.
Palco `#121113`, papel `#f2f0ec`, laranja de hover `#ff7a33` (borda, nunca preenchimento leitoso). Cada capítulo herda
uma tinta da própria arte, como as portas da v2:
- Character Design: azul-noite do Portais do Rio `#3f6ea8`.
- Illustrations: violeta da neve do urso `#6c5ce0`.
- Children's Books: amarelo do Tito `#f0be2a`.
- Personal Art: o papel do sketchbook `#f2f0ec` (lápis sobre papel).
As quatro tintas são os quatro traços do botão de menu.

## 6. Referências
Sem referência externa. Fica da v2: tipografia, paleta, hover de borda laranja e a foto com glitch do Sobre. Saíram
por pedido do Alex (26/11/2026: "sabe os efeitos de cursor? Pode remover. […] a estrela é o desenho dele"): o cursor próprio, a rolagem
inercial, as revelações por recorte, o menu "teste de lápis" e os morphs, exceto o da capa.

## 7. A feature que o cliente não imaginou
**A capa que leva ao projeto.** A capa clicada atravessa a troca de página e vira a imagem grande do projeto (e volta ao
cartão no botão voltar), em 320 ms. É o único objeto que se move entre páginas; ajuda a saber onde se está. O
"frontispício que se desenha" (tinta e teste de lápis no hover do sumário) foi feito e retirado em 26/11/2026: chamava
atenção para a interface, não para o desenho.

## 8. Estrutura
Roteamento por parâmetro (`?category=`, `?project=`, `?page=about`): o host estático não reescreve caminho e o Editor
visual quebra `#hash`. Cada projeto tem endereço próprio e compartilhável; voltar, link direto e troca de idioma funcionam.
1. **Início** (celular primeiro): logo · papéis separados por ponto médio (texto do Sanity) · sumário com os quatro
   capítulos (lista no celular, uma linha de quatro no desktop) · uma ilustração grande · rodapé. Sobre e PT/EN ficam no
   canto do topo. A barra fixa só aparece quando o sumário sai da tela.
2. **Capítulo** (`?category=`): título grande e a contagem; o primeiro projeto em destaque; os outros em fileiras
   justificadas, capa inteira, título, ano, selo de fan art; no fim, a porta do próximo capítulo.
3. **Projeto** (`?project=`): voltar ao capítulo, título, ano, selo, link da fonte; a capa grande; texto de abertura
   (opcional); a sequência vertical de blocos (imagem com legenda e texto opcionais, bloco de texto); a porta do próximo
   projeto. Clique numa imagem abre o visualizador.
4. **Sobre** (`?page=about`, discreto: no topo, junto do idioma, e no rodapé): bio, fotos com glitch, prêmio do Anima
   Mundi, trabalhos para a TV, trajetória. Animação sai do menu e, por ora, mora aqui.
5. **Rodapé** em toda página: LinkedIn, Instagram, Behance, Bluesky, Cara (os vazios ficam ocultos), Sobre, crédito.

## 9. Movimento
Pouco, curto e a serviço do desenho (Alex, 26/11/2026). Cursor do sistema. Rolagem nativa. Nenhuma imagem se move
enquanto é vista: sem zoom no hover, sem paralaxe, sem revelação ao rolar; a imagem só esmaece ao chegar. Estados
(hover, foco, ativo, aberto/fechado) mudam por cor, fio laranja ou esmaecimento de 150 a 250 ms, nunca no seco. Troca de
página: esmaecimento de 180 a 220 ms, e só a capa viaja até o projeto (320 ms). Menu do celular e visualizador abrem e
fecham esmaecendo; a troca de imagem no visualizador é um esmaecimento de 200 ms. Na rolagem do início, a barra só entra
quando o sumário sai da tela. O glitch das fotos fica só no Sobre. `prefers-reduced-motion`: sem
esmaecimentos nem viagem da capa.

## 10. Restrições
HTML/CSS/JS puro, sem build, servido de `design/site/` (local: porta 4330). Conteúdo do Sanity lido no navegador, com o
snapshot `assets/projects.js` de reserva enquanto não houver `project` no dataset. Editor visual obrigatório, ao vivo,
sem refresh. Fontes locais. Nada de texto inventado sobre as obras.

## 11. Portões que rodam
QA de visitante em Playwright (Chromium e WebKit) de 320 a 2560: home, os quatro capítulos, projetos até o fim, voltar,
link frio, troca de idioma, teclado e foco, movimento reduzido, sem overflow horizontal, zero erro de console;
`sanity schema extract` e `sanity build` do Studio; dry-run da migração.

## 12. O que o Alex precisa olhar
1. A distribuição dos projetos nos quatro capítulos (tabela no relatório).
2. O movimento enxuto (26/11): se ainda sobra algo que chama mais atenção que o desenho.
3. Animação dentro do Sobre como lugar provisório.
