# Guia de Padrões Visuais (LangClips)

## 1. Identidade Visual (O Estilo "Sketch/Excalidraw")

O design deve transmitir a sensação de um quadro negro ou caderno de anotações interativo, mantendo a organização rígida de um **Bento Grid**. A estética "desenhada à mão" deve ser aplicada nas bordas e na tipografia, mas o alinhamento dos elementos deve ser matematicamente preciso para não parecer desleixado.

## 2. Tipografia

A tipografia é o maior ponto de falha potencial neste design. **Não use fontes cursivas complexas.**

*   **Fonte Principal (Hand-drawn legível):** Utilize fontes web-safe que simulem escrita à mão com alta legibilidade (ex: *Caveat*, *Kalam*, ou *Virgil* - a própria fonte do Excalidraw, se licenciada corretamente).
*   **Fonte Secundária (Fallback/UI estrita):** Para inputs de texto do usuário, logs de erro ou blocos densos de texto, tenha uma fonte Sans-Serif limpa (ex: *Inter* ou *Nunito*) para garantir que a leitura em telas pequenas (a partir de 320px) não seja prejudicada.

## 3. Paleta de Cores (Themes)

O sistema deve suportar uma variedade de temas, focando primariamente na alternância entre **Dark** e **Light** mode. A paleta deve ser monocromática na sua base para dar destaque absoluto aos vídeos e aos feedbacks de acerto/erro.

### Dark Mode (Padrão dos Wireframes)

*   **Background (Fundo):** Escuro sólido (ex: `#121212` ou `#1e1e1e`). Evite o preto puro `#000000` para reduzir o cansaço visual.
*   **Superfícies (Cards do Bento Grid):** Fundo transparente ou levemente mais claro que o background principal (ex: `#1a1a1a`).
*   **Texto e Bordas (Traços):** Branco ou cinza muito claro (ex: `#e0e0e0`).

### Light Mode

*   **Background (Fundo):** Branco roto ou bege muito claro (lembrando papel, ex: `#f8f9fa` ou `#fdf6e3`).
*   **Superfícies (Cards do Bento Grid):** Fundo branco puro ou cinza claro.
*   **Texto e Bordas (Traços):** Quase preto (ex: `#2d2d2d`).

### Cores Semânticas (Acentos)

*   **Sucesso/Acerto:** Verde pastel/giz (ex: `#4ade80`). Usado no checkmark e na contagem de acertos (ex: *3 acertos*).
*   **Erro/Alerta:** Vermelho pastel/giz (ex: `#f87171`). Usado para sublinhar palavras erradas e na contagem de erros (ex: *2 erros*).
*   **Clipes/Seleção:** Laranja, azul e verde (conforme visto na tela de seleção de vídeos). Devem manter um tom dessaturado para combinar com o aspecto de "giz/lápis".

## 4. Formas, Bordas e Bento Grid

A estrutura fundamental do layout se baseia no Bento Grid, onde a tela é dividida em blocos bem definidos.

*   **Cards Base:** Todos os containers principais devem ter bordas sólidas, finas (1px ou 2px) e cantos arredondados (ex: `border-radius: 12px` ou `16px`).
*   **Áreas de Interação (Dropzone / Processamento):** Utilizar bordas tracejadas (`border-dashed`), indicando áreas de transição, upload ou progresso.
*   **Sombras (Shadows):** Evite sombras difusas pesadas (drop-shadows convencionais). Se for usar sombra para destacar um card ativo no grid, use sombras sólidas (*hard shadows*) para manter o estilo 2D/desenhado.

## 5. Estados e Micro-interações

As micro-interações devem manter a fluidez e modernidade da aplicação, aproximando-a da dinâmica de redes sociais.

*   **Skeleton States:** Durante o processamento do clipe ou carregamento da API Whisper, não use apenas spinners genéricos. Utilize Skeleton States com bordas tracejadas e preenchimentos que pulsam suavemente para indicar carregamento.
*   **Inputs de Exercício:** Onde o usuário digita (Ditado ou Lacunas), utilize a metáfora visual de "linhas de caderno" (como visto nos wireframes). A linha deve mudar de cor (verde/vermelho) após a correção.
*   **Hover/Focus:** Botões (como "Prosseguir") devem inverter as cores (fundo preenchido, texto vazado) ou apresentar um outline de foco claro ao serem interagidos ou navegados por teclado (crucial para acessibilidade).