# Direção — Daniel Hodge, portfólio (v1, duas direções)

**Briefing base:** `README.md` (levantamento dos perfis) + conversa de voz Alex/Daniel no claude.ai · **Data:** 24/11/2026 ·
**Nicho:** ilustrador e animador 2D · **Publicidade regulada:** não.
**Escopo desta rodada:** 2 layouts, **só desktop** (1280–1920), pedido do Alex por cota. Nada perguntado ao Daniel nesta versão.
Uma direção só é a regra da casa; aqui são duas por pedido explícito do Alex.

## 1. A frase
Portfólio de ilustrador mostra a arte pronta. Este mostra **como o Daniel pensa**: a mesma peça da miniatura à cor
final (A), ou o portfólio que se monta para quem chega, estúdio, produtora ou editora (B).

## 2. Ponto forte tímido
O processo. Está publicado, escondido no fim das galerias do Behance (miniaturas A/B/C, linha, valores, opções de cor
do urso polar, do Fizzban, do robô gigante e do Hearthstone) e no sketchbook do Instagram. Em A ele vira a primeira tela;
em B vira o botão "ver processo" em cada peça que o tem.

## 3. Oceano vermelho do segmento
Grade de miniaturas estilo ArtStation em fundo preto, "Hi, I'm…" no topo, carrossel de logos, mesma moldura em tudo.
**Não teremos:** grade uniforme, fundo preto genérico em A, frase de efeito no lugar do H1, eyebrow numerado, mono em rótulo.

## 4. Material que o cliente tem
- 101 imagens baixadas (ArtStation 44, Behance 57) em `media/`, versões web em `design/assets/img/`. Boa resolução nas
  peças de 2022–2025; as de 2015–2017 têm entre 800 e 1200 px.
- **Falta:** foto do Daniel (o dono é grande: pedir retrato), e-mail de contato, vídeos de Animação (Globo, Telecine),
  Lemon Sky/Streamline (NDA?), os cards de Disney/MTG/Marvel, sketchbook do Instagram (a ferramenta bloqueou a coleta).
  Nenhuma imagem de banco ou de IA: só obra dele.
- Fan art (Hearthstone, Zelda, Dr. Strange, Udyr, Turma da Mônica) entra com selo "fan art · <IP>".

## 5. Marca
Não existe marca nem logo. A marca é o traço dele; o nome entra como logotipo tipográfico.
- **A:** papel neutro `#f4f3f0`, grafite `#1c1b1a`, o cinza das pranchas de processo dele `#8a8987` como superfície de
  palco, acento **vermelho do lápis** `#c22f28` (o lápis vermelho do sketchbook). Escala de apoio do grafite 50…950.
- **B:** palco escuro `#121113` e papel `#f2f0ec`; cada porta herda uma tinta da própria arte (dado, não papel):
  Games violeta da neve do urso `#6c5ce0`, Animação azul-noite do Portais do Rio `#3f6ea8`, Livros amarelo do Tito `#f0be2a`.

## 6. Referências
Sem referência externa. O material dele dita: as pranchas cinza de processo (A), as molduras de card ovais e o formato de
carta do Hearthstone (B, no destaque de Cards).

## 7. A feature que o cliente não imaginou
- **A:** o "palco de processo": uma régua que passa de miniatura → linha → valores → cor na mesma peça; e o visualizador
  de processo em toda peça que tem etapas.
- **B:** a **seleção sob medida**: o visitante (ou o próprio Daniel) marca peças e copia um link que abre o portfólio só
  com elas. O Daniel manda um link diferente para cada estúdio.

## 8. Estrutura (desktop)
A: topo · primeira tela (H1 + bio + palco do urso) · Games (com Cards) · Animação · Livros infantis · Sketchbook · Sobre
(linha do tempo) · Contato.
B: topo · primeira tela (H1 + três portas) · seções reordenadas pela porta escolhida · Sketchbook · Sobre · Contato ·
bandeja da seleção.
Conteúdo: títulos e datas dos perfis; bio aprovada na ligação; currículo do LinkedIn. Sem texto inventado sobre as peças.

## 9. Movimento
Passagens e estados: transição em todo controle (200–300 ms), imagens com fade, portas que abrem (B), crossfade no palco (A).
`prefers-reduced-motion` respeitado. Sem coreografia por scroll nesta rodada.

## 10. Restrições
Só desktop nesta rodada. Futuro: Sanity como publicador (o `assets/works.js` já tem a forma do schema). Fontes
hospedadas conosco (Bricolage Grotesque e Anybody, OFL, via Fontsource 5.3.0). Conteúdo em pt-BR; inglês fica em aberto.

## 11. Portões que rodam
Prints em 1280, 1440 e 1920; teclado no palco, nas portas e no visualizador; contraste dos pares de papéis.
**Pulado nesta rodada:** o moodboard com aprovação (`moodboard_gate.py`) e o celular. Os dois layouts fazem as vezes de
style frame.

## 12. O que o Alex precisa olhar
1. A ou B como base (ou A com a seleção sob medida de B).
2. O vermelho do lápis em A e as tintas por porta em B.
3. Português só, ou português e inglês (estúdios de fora são público).
