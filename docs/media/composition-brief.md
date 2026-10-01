# Hyperframes Composition Brief: LangClips

## Objective
Short launch-style brag video for LangClips (portfolio / LinkedIn / GitHub README).

## Output
- Composition directory: `brag-output/composition/` (working directory, not versioned)
- Rendered video: `brag.mp4` (+ `brag-20s.mp4`), published in `docs/media/`
- Format: landscape — 1920x1080, 30fps
- Duration: 30.4s (user-approved 30s ± 1s; exceeds the /brag 15-25s default by explicit plan decision). 20s cut optional.

## Source Material
- Project root: repository root
- Primary files read: `README.md`, `web/package.json`, `web/src/styles/fonts.css`, `brag-output/brag-plan.md`, `brag-output/capture/record.mjs`, `capture/scenes.json`, `capture/deck-info.json`, `capture/hard-typed.txt`
- Product name: LangClips
- Tagline / strongest claim: "Transform videos into practical lessons" (shown in PT: "Transforme vídeos em aulas práticas.")
- Key UI moment: the real Select Difficulty screen (Easy/Medium/Hard cards, green/yellow/red borders).
- Real footage (Playwright recording of the running app, cursor overlay kept) pre-cut, cropped and sped up with ffmpeg into `composition/assets/footage/`:
  - `home.mp4` — home hero + drop zone turning green on drag-over (real 2.2–6.0s)
  - `processing.mp4` — 8-step stepper, real 5.8–14.6s at 2.4x (~3.7s)
  - `difficulty.mp4` — hover Easy → Medium → Hard, 1.55x
  - `easy.mp4` — clicking words to build "Good morning, my name is Anna." + green answer
  - `medium.mp4` — typing into the blanks ("drink", "coffee", "day") + green answer
  - `hard.mp4` — dictation typed with a wrong word ("many" instead of "drink"), correction shows "drink" in red
  - `results.mp4` — results screen (shown blurred, see "Avoid")
- Copy that must appear (PT captions):
  - "Você já assistiu série em inglês..." / "e entendeu metade?"
  - "LangClips" · "Transforme vídeos em aulas práticas."
  - "Upload → FFmpeg → Whisper → clipes → deck"
  - "Escolha seu nível."
  - "Easy — monte a frase" · "Medium — complete as lacunas" · "Hard — ditado, sem rede de proteção"
  - "Acompanhe seu desempenho" · "Tudo salvo no navegador." · "IndexedDB · funciona offline"
  - Outro: LangClips · stack chips · "Feito por Victor Lis Bronzo" · github.com/victor-lis-bronzo/langclips

## Creative Direction
- Tone preset: polished
- Creative direction: "quiet premium dev-portfolio film"
- Interpretation: dark #121212 canvas, mint-green accents, soft blurred green blobs like the app; calm eases (power3/expo out), no bounces or jokes; each caption held long enough to read; real UI always framed in a rounded panel.
- Angle: drop any short video → AI pipeline turns it into listening exercises in three real modes → it all runs offline in the browser.
- Hook: "Você já assistiu série em inglês... e entendeu metade?" with a subtitle line where half the words are blurred (from the real deck transcription "I like to drink coffee every day.").
- Outro / punchline: LangClips wordmark + stack chips + author + repo.
- Avoid:
  - Generic SaaS language; "múltipla escolha" (the code has no multiple choice)
  - Any claim of accuracy/percentages: the recorded results screen shows 100% despite a Hard mistake (known app bug), so it appears only blurred behind the offline message
  - Secrets, internal URLs, personal data

## Visual Identity
- Background: `#121212`
- Text: `#ffffff` / zinc-400 `#a1a1aa`
- Accent: `#4ade80` (primary), emerald-400 `#34d399` / emerald-500 `#10b981`
- Difficulty: green-500 `#22c55e`, yellow-500 `#eab308`, red-500 `#ef4444`
- Display font: Caveat (wordmark + handwritten notes, as the app logo) — local woff2 from @fontsource
- Body font: Inter 400–800 — local woff2 from @fontsource
- Visual references: app logo "▷ Lang Clips", rounded-2xl cards with 2px colored borders, zinc-800/40 surfaces.

## Storyboard (scene summary)
1. Hook — 0.00–3.20 — question + half-blurred subtitle
2. Reveal — 3.20–6.90 — LangClips wordmark + PT tagline, home footage (drop zone)
3. Pipeline — 6.90–10.50 — stepper footage + 5 pipeline chips lighting in sequence
4. Levels — 10.50–13.70 — "Escolha seu nível." + chips synced to real hover on the 3 cards (poster)
5. Easy — 13.70–16.90 — build the sentence by clicking words
6. Medium — 16.90–20.10 — fill the blanks
7. Hard — 20.10–23.45 — dictation, punch-in on the red wrong word + Caveat note
8. Result + offline — 23.45–26.20 — blurred results, offline/IndexedDB message
9. Outro — 26.20–30.40 — wordmark, stack chips, author, repo

## Audio
- Audio role: sparse professional accents over a warm, low bed
- Audio arc: fade in under hook, steady through demo, swell on outro, fade out by 30.4s
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (polished pick)
- Music treatment: ~0.28 peak, volume lane fade-in 0–0.8s, fade-out 28.4–30.4s
- Music cue guidance: bundled preset `<skill-dir>/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json` (tempo ~110 BPM; beat grid 0.546s). Strong cues used: 13.11 (Hard chip on levels), 21.84 area (Hard correction). Pipeline chips snap to beats 7.09/7.64/8.19/8.74/9.29.
- Audio-reactive treatment: subtle — bass/RMS drives background green blob opacity/scale only. Data pre-extracted with hyperframes-creative `extract-audio-data.py` → `assets/data/audio-data.js`.
- Audio-coupled moments: pipeline chips (soft clicks), difficulty hovers (rollover), Easy word clicks (clicks), Medium/Hard typing (sparse keypresses), correct answers (soft bong), Hard correction (soft impact), offline badge (bong), outro logo (bell, quiet).
- SFX selection guidance: low HF-risk picks from sfx-analysis.md; quiet (0.3–0.55).
- Audio files copied to `composition/assets/music` and `composition/assets/sfx`.

## Hyperframes Instructions
Composition built following hyperframes-core / -animation / -creative / -keyframes / -cli (skills fetched from github.com/heygen-com/hyperframes into the session scratchpad, since only hyperframes-cli ships with the npm CLI). `npx hyperframes check` is the gate before render.
