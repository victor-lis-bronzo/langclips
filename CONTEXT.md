# LangClips

Plataforma anônima de prática de compreensão auditiva em inglês: o usuário envia um vídeo curto, o sistema o transforma em um Deck de Clips com transcrição e o usuário pratica cada Clip em um nível de dificuldade, com correção palavra a palavra. Este glossário fixa o vocabulário canônico; onde a documentação antiga diverge do código, vale o código.

## Language

### Conteúdo

**Source Video**:
O vídeo original enviado pelo usuário, do qual um único Deck é derivado. É descartado depois que o Deck é salvo no dispositivo.
_Avoid_: vídeo bruto, arquivo bruto, upload, raw video

**Transcription**:
O texto falado oficial de um Clip, que serve de gabarito para a correção de toda Answer.
_Avoid_: legenda, subtitle, caption, texto

**Transcription Segment**:
Um trecho de fala com início, fim e texto, reconhecido no áudio do Source Video; cada segmento com duração aceitável dá origem a um Clip.
_Avoid_: frase, sentence, pausa

**Clip**:
Um recorte curto do Source Video contendo uma única fala e sua Transcription; é a unidade praticada em um Exercise.
_Avoid_: clipe, trecho, corte, cut, segmento

**Deck**:
O conjunto ordenado de Clips gerado a partir de um único Source Video; é o que o usuário salva, lista, pratica e apaga.
_Avoid_: sessão, questionário, coleção de vídeos, playlist

**Saved Deck**:
Um Deck cujos Clips já foram baixados e guardados no dispositivo, podendo ser praticado sem internet.
_Avoid_: deck offline, deck local, deck em cache

### Processamento

**Processing Job**:
O trabalho assíncrono que transforma um Source Video em um Deck, acompanhado pelo usuário até a conclusão ou falha; o Deck resultante herda o identificador do Job.
_Avoid_: tarefa, processo, conversão

**Processing Step**:
Cada etapa sequencial de um Processing Job, na ordem: Download, Audio Extraction, Transcription, Clip Generation, Clip Upload, Deck Construction, Deck Upload e, já no dispositivo, Local Save.
_Avoid_: fase, estágio, passo

**Local Save**:
A etapa final, feita no dispositivo do usuário, em que o Deck e seus Clips são baixados e guardados, tornando-o um Saved Deck.
_Avoid_: download do deck, sincronização, persistência

**Download Acknowledgement**:
A confirmação, enviada pelo dispositivo após o Local Save, de que o Deck foi recebido e os arquivos remotos (Source Video e Clips) podem ser descartados.
_Avoid_: ack, confirmação de recebimento, limpeza

### Prática

**Difficulty**:
O modo escolhido pelo usuário antes de praticar um Deck, que define como a Answer é montada: Easy, Medium ou Hard. A última escolha fica lembrada como dificuldade preferida.
_Avoid_: nível, level, tipo de exercício, modo

**Easy**:
Difficulty em que o usuário reconstrói a frase ouvida escolhendo, na ordem, as palavras da Transcription apresentadas embaralhadas em um Word Bank.
_Avoid_: múltipla escolha, iniciante, beginner

**Medium**:
Difficulty em que parte das palavras da Transcription fica visível e o usuário digita as palavras que faltam (Blanks).
_Avoid_: preencher lacunas, fill in the blanks, intermediário

**Hard**:
Difficulty em que o usuário digita a frase inteira que ouviu, sem nenhuma pista textual (Dictation).
_Avoid_: avançado, transcrição livre

**Word Bank**:
O conjunto embaralhado de palavras da Transcription oferecido no Easy, do qual o usuário escolhe as peças para montar a frase.
_Avoid_: banco de palavras, opções, alternativas, chips

**Blank**:
Uma palavra da Transcription ocultada no Medium, que o usuário precisa preencher.
_Avoid_: lacuna, gap, campo

**Dictation**:
O exercício de escrever a frase inteira ouvida; é o que define o Hard.
_Avoid_: ditado, transcrição do usuário

**Answer**:
A frase que o usuário submete para um Clip, montada conforme a Difficulty.
_Avoid_: resposta, guess, palpite, input

**Exercise**:
O registro de uma Answer submetida para um Clip de um Deck, com a Difficulty usada, o tempo gasto e o resultado (Hit ou Mistake).
_Avoid_: tentativa, attempt, guess, questão, pergunta, resolução

**Word Result**:
A classificação de cada palavra da Transcription ao comparar com a Answer: exata, diferente só em maiúsculas/minúsculas, errada ou faltando. Pontuação é ignorada na comparação.
_Avoid_: diff, erro, correção

**Hit**:
Resultado de um Exercise considerado correto na comparação palavra a palavra; o oposto é Mistake.
_Avoid_: acerto, correct, success

**Mistake**:
Resultado de um Exercise considerado incorreto na comparação palavra a palavra.
_Avoid_: erro, wrong, falha

**Reveal**:
O momento, após submeter a Answer, em que a Transcription é exibida com os Word Results destacados antes de seguir para o próximo Clip.
_Avoid_: gabarito, correção, feedback

**Results**:
O resumo exibido ao terminar um Deck, com a contagem de Hits e Mistakes de cada Exercise do Deck.
_Avoid_: performance, relatório, placar, score

**Playback Speed**:
A velocidade de reprodução do Clip escolhida pelo usuário durante a prática.
_Avoid_: velocidade do vídeo, rate

## Relationships

- Um **Source Video** gera, por meio de um **Processing Job**, exatamente um **Deck**.
- Um **Processing Job** avança pelos **Processing Steps** em ordem; o último, **Local Save**, é seguido pelo **Download Acknowledgement**.
- Um **Deck** contém um ou mais **Clips**, em ordem; cada **Clip** pertence a um único **Deck** e tem uma única **Transcription**.
- Cada **Clip** nasce de um **Transcription Segment** do **Source Video**.
- Uma **Difficulty** é escolhida por prática de **Deck** e vale para todos os seus **Clips**.
- Cada **Answer** submetida gera um **Exercise**, que referencia um **Clip** e seu **Deck** e termina em **Hit** ou **Mistake**.
- **Results** agregam os **Exercises** de um **Deck**.

## Flagged ambiguities

- **Easy — múltipla escolha vs. Word Bank.** `docs/conceito.md`, `docs/glossario/termos.md` (Múltipla Escolha), RF06 e USR03 descrevem o nível mais fácil como escolher a legenda certa entre 3–4 opções. O código implementa Easy como montar a frase a partir de um Word Bank embaralhado. Não existe exercício de múltipla escolha no código. Termo canônico: **Easy** / **Word Bank**; "Múltipla Escolha" deve ser evitado.
- **Difficulty vs. tipo de exercício.** A documentação trata "Múltipla Escolha", "Preencher Lacunas" e "Ditado" como tipos de exercício escolhidos pelo usuário (RF06), separados do nível de dificuldade. No código há um único eixo, **Difficulty** (Easy/Medium/Hard), e cada valor corresponde a um único formato de Answer.
- **"Dictation" como título de todos os níveis.** A tela de prática mostra o título "Dictation" nas três Difficulties, embora só o Hard seja ditado de fato. Ainda não está definido se "Dictation" é o nome geral da atividade ou só do Hard; aqui, **Dictation** fica restrito ao Hard.
- **Deck como "coleção de vídeos".** `docs/glossario/termos.md` define Deck como uma coleção de vídeos escolhidos pelo usuário. No código, um Deck vem de um único Source Video e é uma coleção de Clips.
- **Clip "selecionado pelo usuário".** `docs/glossario/termos.md` diz que o Clip é escolhido pelo usuário. No código, os Clips são gerados automaticamente a partir dos Transcription Segments, sem seleção manual. `docs/conceito.md` também fala em escolher de 1 a 5 clipes "mais relevantes", mas o código mantém todos os segmentos com duração aceitável.
- **Duração aceitável de um Clip.** BR01 e o código usam de 2 a 20 segundos de fala. USR01 diz de 5 a 20 segundos.
- **Sessão Volátil.** `docs/glossario/termos.md` e `docs/conceito.md` falam em uma sessão temporária descartada ao fechar a página. No código não existe esse conceito: o Deck vira um **Saved Deck** no dispositivo e continua lá até o usuário apagá-lo. O que é descartado são só os arquivos remotos, depois do **Download Acknowledgement**.
- **"Tentativa" / "attempt" / "guess".** O código usa "attempt" para a avaliação de uma única Answer, "guesses" para os Exercises gravados e "nova tentativa" (em comentário) para uma nova passada pelo Deck inteiro. O registro gravado se chama **Exercise**. Não existe termo canônico para "uma passada completa por um Deck", e esse conceito ainda precisa de nome se for usado.
- **Valores de Difficulty.** `docs/data-model.md` grafa as dificuldades como `EASY | MEDIUM | HARD`, e o código usa `easy | medium | hard`. Os termos são os mesmos, só muda a grafia.
- **Tradução.** `docs/conceito.md`, RF08/RF09 e USR05 preveem tradução de frase e de palavra. Isso ainda não existe no domínio implementado, por isso o termo não entrou neste glossário.
