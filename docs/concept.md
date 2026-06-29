# Escopo do Projeto: LangClips (Nome Provisório)

## 1. Visão Geral do Produto

O **LangClips** é uma plataforma interativa de aprendizado de inglês baseada em vídeos curtos. O objetivo principal é tornar o aprendizado de idiomas mais engajador, dinâmico e adaptável ao nível do usuário, utilizando conteúdo real (trechos de filmes, séries, entrevistas, etc.) submetidos pelo próprio usuário.

Nesta versão inicial, a plataforma funcionará de forma totalmente temporária e anônima. O sistema processará os vídeos enviados, gerará os exercícios e, ao fechar a página ou concluir a sessão, os arquivos de mídia serão completamente descartados do servidor.

## 2. Público-Alvo

- **Estudantes de inglês:** De níveis iniciante a avançado.
- **Pessoas focadas em compreensão auditiva:** Que buscam melhorar a compreensão auditiva (*listening*) e vocabulário com sotaques e velocidades de fala reais.
- **Professores:** Que desejam gerar exercícios rápidos em sala de aula a partir de um vídeo, sem necessidade de cadastro.

## 3. Funcionalidades Principais (Core Features)

### 3.1. Upload e Processamento de Vídeo Temporário

- **Upload:** O usuário poderá fazer upload de pequenos trechos de vídeo (ex: `.mp4`, `.avi`, `.mov`). Restrição sugerida: vídeos de até 3 minutos ou 50MB para otimizar o processamento.
- **Armazenamento Volátil:** O vídeo será salvo apenas na pasta temporária do servidor (ou em memória) exclusivamente para o processamento. Após a geração das frases ou fim da sessão, o arquivo original e os recortes serão deletados.
- **Transcrição Automática (Speech-to-Text):** O sistema utilizará uma API de reconhecimento de fala (como `Whisper` da OpenAI) para gerar a transcrição.
- **Segmentação:** O sistema dividirá o vídeo automaticamente em "clipes" menores, baseados em frases completas ou pausas naturais.

### 3.2. Geração Automática de Exercícios (O "Questionário")

A partir da segmentação, a plataforma selecionará de 1 a 5 clipes (frases) mais relevantes ou claros do vídeo para criar a sessão de exercícios.

#### Tipos de Exercício (Níveis de Dificuldade)

- **Nível 1 (Iniciante) - Múltipla Escolha:** A cena é exibida e o usuário escolhe a legenda correta entre 3 a 4 opções (opções incorretas usam palavras de sonoridade similar).
- **Nível 2 (Intermediário) - Preencher as Lacunas:** A legenda é exibida com palavras-chave faltando. O usuário deve digitar as palavras.
- **Nível 3 (Avançado) - Ditado (Dictation):** O usuário assiste ao clipe e deve digitar a frase inteira.

### 3.3. Interface de Resolução e Feedback

- **Player Integrado:** Um player simples para exibir a cena. Botão para repetir o áudio facilmente, com opção de velocidade reduzida (`0.75x`).
- **Feedback Imediato (Correção):**
  - Exibe a legenda oficial após a submissão.
  - **Análise de Erros:** Destaca as palavras erradas, comparando a digitação com o correto (ex: *"Você escreveu though, mas o correto era thought"*).
- **Tradução:** Opção de revelar a tradução da frase para o português.

### 3.4. Gestão de Usuários e Armazenamento em Nuvem (Planejado para o Futuro)

Para a versão inicial, a plataforma não terá banco de dados de usuários nem persistência de mídia.

Em atualizações futures, planeja-se adicionar:
- Criação de contas (Email, Google).
- Histórico de vídeos processados e salvamento de vocabulário.
- Gamificação e pontuação progressiva.
- Armazenamento em nuvem (`S3`/`GCS`) para compartilhar os "decks" de vídeos criados.

## 4. Fluxo do Usuário (User Journey)

1. **Entrada:** O usuário acessa a plataforma (web) sem necessidade de login.
2. **Ação:** Faz o upload de um arquivo de vídeo curto.
3. **Espera (Loading):** O sistema processa o vídeo temporariamente no servidor (transcrição e segmentação).
4. **Exercício:** O usuário é direcionado para a tela do questionário e o primeiro clipe é exibido.
5. **Interação:** O usuário escolhe o nível de dificuldade na própria tela e responde à pergunta.
6. **Feedback:** Clica em "Verificar". O sistema avalia, destaca erros e oferece tradução.
7. **Continuação:** Avança até completar os 1 a 5 clipes.
8. **Conclusão e Limpeza:** Tela final de resumo. O servidor apaga os arquivos de mídia associados àquela sessão.

## 5. Requisitos Técnicos e Ferramentas Sugeridas (Para a versão Temporária)

- **Frontend:** `React`, `Vue.js` ou `Next.js`.
- **Backend:** `Node.js` (`Express`) ou `Python` (`FastAPI`).
- **Banco de Dados:** Nenhum necessário inicialmente (pode-se usar o estado do React no frontend para gerenciar a pontuação da sessão atual).
- **Armazenamento de Vídeo:** Sistema de arquivos local do servidor (ex: pastas `/tmp`) ou bibliotecas que processem o arquivo diretamente em memória (ex: `multer` em `Node.js`), com scripts de limpeza automática (*cron jobs*) para arquivos órfãos.
- **Processamento e IA:** `FFmpeg` (para cortar áudio/vídeo) e OpenAI `Whisper API`.

## 6. Riscos e Desafios

- **Sobrecarga do Servidor:** Como os vídeos serão processados localmente antes de descartar, múltiplos usuários simultâneos podem travar a máquina.
  - *Mitigação:* Definir limites estritos de tamanho de arquivo e implementar uma fila (*queue*) de processamento caso os acessos aumentem.
- **Custo de APIs:** A transcrição via API gera custos por minuto processado.
  - *Mitigação:* O limite de 3 minutos de vídeo é crucial para controlar este custo inicial.
- **Qualidade do Áudio:** Ruído de fundo ou fala sobreposta geram transcrições ruins.
  - *Mitigação:* Instruções claras na tela de upload recomendando vídeos com áudio nítido.

## 7. Fases de Desenvolvimento Sugeridas

- **Fase 1 (MVP - Foco em Sessão Temporária):** Upload -> Processamento (Whisper) -> Armazenamento Temporário -> Tela de exercício "Preencher lacunas" -> Descarte de arquivos após uso. Sem login, sem banco de dados.
- **Fase 2:** Inclusão de níveis Múltipla Escolha e Ditado, além da tradução (Google/DeepL API) e melhor feedback visual de erros na mesma estrutura "sem login".
- **Fase 3 (Grande Atualização):** Introdução de banco de dados, sistema de usuários, persistência opcional de mídia na nuvem (AWS `S3`) e criação de perfis/histórico.