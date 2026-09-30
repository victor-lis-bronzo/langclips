# LangClips — Brag Plan

Público: GitHub (README / topo do repo) + LinkedIn (recrutadores e devs). Vídeo mudo-friendly (legendas na tela; música baixa opcional).

## Rubrica (9 perguntas)

1. **O que é:** Plataforma que transforma qualquer vídeo curto em exercícios de listening de inglês — upload, transcrição por IA (Whisper), clipes automáticos e exercícios em 3 níveis. Funciona offline.
2. **Claim mais forte:** "Transform videos into practical lessons" + "No registration, no hassle, 100% free."
3. **Gancho visual:** Os 3 cards de dificuldade (verde / amarelo / vermelho) sobre fundo `#121212`, com blobs verdes desfocados.
4. **UI a mostrar:** Home (drop de arquivo) → Processing stepper (8 etapas) → Select Difficulty → exercício nos 3 modos → Results (precision circle).
5. **Vídeo mais curto que funciona:** 30s (mais que os 15–25s padrão: são 3 modos de exercício + um beat de engenharia; existe corte de 20s abaixo).
6. **Tom:** preset `polished`; direção: *"quiet premium dev-portfolio film"* — dark, verde-menta, limpo, sem piada forçada.
7. **Áudio:** cama de música ambiente baixa, SFX discretos (tick nos cards, whoosh nas transições, "ding" no acerto). Sem voz. Tudo legendado.
8. **Caption:** *"Joguei um vídeo de série no LangClips e ele virou uma aula de listening em 3 níveis — offline-first, com fila BullMQ, FFmpeg e Whisper por baixo."*
9. **Fluxo do usuário:** solta um vídeo → vê o pipeline processar → escolhe Easy / Medium / Hard → resolve e vê a precisão.

## Identidade visual (do código)

- Fundo `#121212`, texto branco, primária `#4ade80` (verde), acentos emerald-400/500.
- Dificuldades: green-500 / yellow-500 / red-500.
- Fontes: **Inter** (corpo/títulos), **Caveat** (notas manuscritas).
- Cards: `rounded-2xl`, `bg-zinc-800/40`, borda 2px colorida.

## Os 3 níveis — atenção: o código difere do doc `conceito.md`

`docs/conceito.md` diz Múltipla Escolha / Lacunas / Ditado, mas o **código real** (`answer-easy/medium/hard.tsx`) é:

| Nível | Mecânica real | Como filmar |
|---|---|---|
| **Easy** (verde) | Palavras embaralhadas — o usuário toca nas palavras para **montar a frase** na ordem | Clicar 4–5 palavras em sequência |
| **Medium** (amarelo) | **Lacunas** — ~35% das palavras visíveis, resto em inputs para digitar | Digitar nas lacunas |
| **Hard** (vermelho) | **Ditado** — textarea pautada (estilo caderno), digitar a frase inteira | Digitar no caderno |

Comum aos três: player com velocidades 0.5×–1.5×, correção palavra a palavra, progress dots.
Vou usar a descrição do **código** no vídeo (é o que aparece na tela).

## Roteiro / Storyboard (30s, landscape 1920×1080)

| # | Tempo | Cena | Visual | Texto na tela | SFX |
|---|---|---|---|---|---|
| 1 | 0–3s | **Hook** | Tela preta → clipe de série "vira" texto: legenda com palavras se embaralhando | **"Você já assistiu série em inglês... e entendeu metade?"** | whoosh suave |
| 2 | 3–7s | **Reveal** | Home real: hero + drop de arquivo; logo LangClips; vídeo arrastado para o drop | **LangClips** · "Transform videos into practical lessons" | tick de drop |
| 3 | 7–11s | **Pipeline** | Processing stepper real avançando pelos 8 passos (ficam verdes um a um) | "Upload → FFmpeg → Whisper → clipes → deck" | ticks em cascata |
| 4 | 11–14s | **Os 3 níveis** | Tela *Select Difficulty*: 3 cards entram escalonados; hover verde→amarelo→vermelho | **"Escolha seu nível."** | tick por card |
| 5 | 14–17s | **Easy** | Tela do exercício: clicar palavras para montar a frase | "Easy — monte a frase" (chip verde) | pop por palavra |
| 6 | 17–20s | **Medium** | Lacunas sendo preenchidas | "Medium — complete as lacunas" (chip amarelo) | teclado leve |
| 7 | 20–23s | **Hard** | Digitando no caderno pautado; correção destaca palavra errada em vermelho | "Hard — ditado, sem rede de proteção" (chip vermelho) | teclado + ding |
| 8 | 23–26s | **Resultado + offline** | Results (precision circle preenchendo) → badge "IndexedDB · funciona offline" | "Tudo salvo no seu navegador. Funciona offline." | ding final |
| 9 | 26–30s | **Outro** | Stack em chips (TanStack Start · NestJS · BullMQ · Redis · FFmpeg · Whisper · R2) + nome + GitHub | **LangClips** · github.com/victor-lis-bronzo/langclips · "Feito por Victor Lis Bronzo" | swell + fade |

**Corte curto de 20s** (LinkedIn feed): remover cena 3 (pipeline) e comprimir 5–7 para 2s cada.

## Notas de produção

- **Mídia real:** gravar a tela do app rodando em 1920×1080 (OBS, ou posso capturar via Playwright — o projeto já tem `web/tests/e2e`). Usar um clipe de teste **sem direitos autorais** (ex.: um trecho seu ou de domínio público), para o GitHub/LinkedIn não dar problema.
- **Dados:** nada de `.env`/chaves na tela; conferir que nenhuma URL interna aparece no stepper.
- **Legendas embutidas** (LinkedIn autoplay é mudo). Manter cada linha ≥ 1s na tela.
- **Thumbnail/poster:** cena 4 (3 cards coloridos) — é o frame mais reconhecível.
- **GitHub:** o README não aceita `<video>` de arquivo grande; subir o `.mp4` (<10 MB) arrastando num issue/PR/README pelo editor do GitHub, ou usar GIF de 10s do corte curto.

## Music cue guidance

Sem cues pré-detectados; detectar batidas no momento da composição (`references/audio.md`). Prioridade: legibilidade > sincronia.

## Share copy (rascunho)

> Construí o **LangClips**: você joga um vídeo curto e ele vira exercícios de listening em 3 níveis (Easy, Medium, Hard). Upload direto ao R2 via presigned URL, fila BullMQ + FFmpeg + Whisper no worker, e consumo offline-first com IndexedDB. Monorepo NestJS + TanStack Start. 👉 github.com/victor-lis-bronzo/langclips
> #buildinpublic #typescript #nestjs #ai #english
