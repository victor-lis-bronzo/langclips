# Product Backlog (Histórias de Usuário)

Esta seção documenta o Product Backlog do projeto na forma de Histórias de Usuário (User Stories - USR). Todas as histórias seguem o modelo padrão definido abaixo para garantir rastreabilidade com os Requisitos Funcionais (RF), Requisitos Não Funcionais (RNF) e Regras de Negócio (BR).

---

## 📋 Modelo de Template de USR (Padrão) - Estrutura Given-When-Then

```markdown
### USRXX - [Título Curto da História]

- **Descrição:** Como `[Ator/Persona]`, eu quero `[Funcionalidade/Ação]` para `[Valor de Negócio/Objetivo]`.
- **Requisitos Funcionais Associados:**
  - [RFXX - Título do Requisito](../funcionais/rf-lista.md)
- **Requisitos Não Funcionais Associados:**
  - [RNFXX - Título do Requisito](../nao-funcionais/rnf-lista.md)
- **Regras de Negócio Associadas:**
  - [BRXX - Título da Regra](../regras/br-lista.md)
- **Critérios de Aceitação:**
  - [ ] **Cenário 1:** Dado que [condição inicial], quando [ação realizada], então [resultado esperado].
```

---

## 🗂️ Histórias de Usuário Ativas

### USR01 - Exercício de Preenchimento de Lacunas

- **Descrição:** Como `Ana Maria`, eu quero `ver a transcrição com lacunas associada a um clip de áudio/vídeo` para `praticar e testar minha compreensão auditiva`.
- **Requisitos Funcionais Associados:**
  - [RF04 - Agrupamento em deck e estrutura de lacunas](../funcionais/rf-lista.md)
  - [RF05 - Escolha de tipos de exercícios (Preencher Lacunas)](../funcionais/rf-lista.md)
  - [RF11 - Player claro e de fácil entendimento](../funcionais/rf-lista.md)
- **Requisitos Não Funcionais Associados:**
  - [RNF02 - Entrega de deck/clips por partes](../nao-funcionais/rnf-lista.md)
- **Regras de Negócio Associadas:**
  - [BR01 - Duração mínima e máxima do clip com fala](../regras/br-lista.md)
- **Critérios de Aceitação:**
  - [ ] **Cenário 1: Exibição do exercício.** Dado que o estudante selecionou o exercício de "Preencher Lacunas", quando o player carregar o clip, então a transcrição deve ser apresentada ocultando palavras específicas (lacunas) e o player de vídeo deve estar visível e funcional.
  - [ ] **Cenário 2: Validação de duração do clip.** Dado um clip pertencente ao deck do exercício, quando o sistema validar a sua duração, então ele deve ter obrigatoriamente entre 5 e 20 segundos de fala conforme a regra de negócio.

### USR02 - Submissão de Vídeo

- **Descrição:** Como `Ana Maria`, eu quero `pode submeter um vídeo da minha escolha` para `gerar exercícios com meus vídeos preferidos`.
- **Requisitos Funcionais Associados:**
  - [RF01 - Limite de Upload](../funcionais/rf-lista.md)
  - [RF02 - Armazenamento Temporário](../funcionais/rf-lista.md)
  - [RF03 - Processamento do Vídeo](../funcionais/rf-lista.md)
  - [RF04 - Agrupamento em deck e estrutura de lacunas](../funcionais/rf-lista.md)
  - [RF09 - Feedback claro de erros)](../funcionais/rf-lista.md)
- **Requisitos Não Funcionais Associados:**
  - [RNF02 - Entrega de deck/clips por partes](../nao-funcionais/rnf-lista.md)
- **Regras de Negócio Associadas:**
  - [BR01 - Duração máxima e mínima](../regras/br-lista.md)
  - [BR04 - Submissão de vídeo somente com internet](../regras/br-lista.md)
- **Critérios de Aceitação:**
  - [ ] **Cenário 1: Submissão de vídeo dentro dos limites.** Dado que Ana Maria está na tela de submissão de vídeos, quando ela enviar um vídeo válido de no máximo 50MB, então o sistema deve processar o arquivo, criar os clips e apresentar o resultado do exercício.
  - [ ] **Cenário 2: Submissão de vídeo acima do limite.** Dado que Ana Maria está na tela de submissão de vídeos, quando ela enviar um vídeo com duração/tamanho acima do limite permitido, então o sistema deve cortar o vídeo no limite permitido, processar a parte recortada, criar os clips e apresentar o resultado do exercício.
  - [ ] **Cenário 3: Submissão de vídeo sem internet.** Dado que Ana Maria está tentando submeter um vídeo, quando ela estiver sem conexão de internet, então o sistema deve rejeitar o arquivo e apresentar um feedback claro de erro (log descritivo).
  - [ ] **Cenário 4: Submissão de vídeo menor que o permitido.** Dado que Ana Maria está na tela de submissão de vídeos, quando ela enviar um vídeo com duração menor que o mínimo permitido, então o sistema deve rejeitar o arquivo e apresentar um feedback claro de erro (log descritivo).
  - [ ] **Cenário 5: Submissão de vídeo pelo tablet.** Dado que Ana Maria está acessando a plataforma via tablet, quando ela enviar um vídeo válido para processamento, então o sistema deve processar o arquivo, criar os clips e apresentar o resultado do exercício de forma responsiva.

### USR03 - Realizando Exercícios

- **Descrição:** Como `Ana Maria`, eu quero `realizar os exercícios` para `praticar e aprender com meus conteúdos preferidos`.
- **Requisitos Funcionais Associados:**
  - [RF03 - Exercícios Offline, após processamento](../funcionais/rf-lista.md)
  - [RF06 - Escolha o nível de dificuldade dos exercícios](../funcionais/rf-lista.md)
  - [RF07 - Resultado imediato do exercício](../funcionais/rf-lista.md)
  - [RF10 - Feedback claro de erros](../funcionais/rf-lista.md)
- **Requisitos Não Funcionais Associados:**
  - [RNF01 - Reprodução fluida](../nao-funcionais/rnf-lista.md)
  - [RNF02 - Reprodução consistente em diferentes niveis de internet](../nao-funcionais/rnf-lista.md)
- **Regras de Negócio Associadas:**
  - [BR02 - Permissividade em relação a "case sensitive" e "punctuation"](../regras/br-lista.md)
- **Critérios de Aceitação:**
  - [ ] **Cenário 1: Exercício de preenchimento de lacunas.** Dado que Ana Maria iniciou o exercício de preenchimento de lacunas, quando ela responder e submeter a sua resposta, então o sistema deve avaliar a resposta e apresentar o resultado/feedback imediatamente.
  - [ ] **Cenário 2: Exercício de múltipla escolha.** Dado que Ana Maria iniciou o exercício de múltipla escolha, quando ela selecionar uma opção e submeter, então o sistema deve avaliar a resposta e apresentar o resultado/feedback imediatamente.
  - [ ] **Cenário 3: Exercício de ditado.** Dado que Ana Maria iniciou o exercício de ditado, quando ela digitar o texto ouvido e submeter, então o sistema deve avaliar a resposta e apresentar o resultado/feedback imediatamente.

### USR04 - Alterando o velocidade do vídeo

- **Descrição:** Como `Ana Maria`, eu quero `alterar a velocidade do vídeo` para `conseguir compreender melhor e adaptar ao nível de entendimento`.
- **Requisitos Funcionais Associados:**
  - [RF11 - Player claro e de fácil entendimento](../funcionais/rf-lista.md)
  - [RF12 - Player deve incluir a funcionalidade de alterar a velocidade do vídeo](../funcionais/rf-lista.md)
- **Requisitos Não Funcionais Associados:**
  - [RNF01 - Reprodução fluida](../nao-funcionais/rnf-lista.md)
  - [RNF02 - Reprodução consistente em diferentes niveis de internet](../nao-funcionais/rnf-lista.md)
- **Regras de Negócio Associadas:**
- **Critérios de Aceitação:**
  - [ ] **Cenário 1: Alteração de velocidade.** Dado que Ana Maria está visualizando o player de vídeo de um exercício, quando ela clicar na opção de alterar a velocidade e selecionar uma nova velocidade, então o player deve reproduzir o vídeo na velocidade selecionada de forma fluida.

### USR05 - Expandindo o vocabulário

- **Descrição:** Como `Ana Maria`, eu quero `expandir o vocabulário` para `conhecer novas palavras e expressões`.
- **Requisitos Funcionais Associados:**
  - [RF08 - Consulta da tradução das palavras faladas](../funcionais/rf-lista.md)
  - [RF09 - Consulta da tradução da frase](../funcionais/rf-lista.md)
- **Requisitos Não Funcionais Associados:**
- **Regras de Negócio Associadas:**
- **Critérios de Aceitação:**
  - [ ] **Cenário 1: Tradução de frase.** Dado que Ana Maria está visualizando a transcrição de um exercício, quando ela clicar na opção de traduzir a frase, então o sistema deve apresentar a tradução completa da frase.
  - [ ] **Cenário 2: Tradução de palavras.** Dado que Ana Maria está visualizando a transcrição de um exercício, quando ela clicar em uma palavra específica da transcrição, então o sistema deve apresentar a tradução daquela palavra.

### USR06 - Acessando Exercícios Offline

- **Descrição:** Como `Paulo Barbosa`, eu quero `acessar os exercícios sem internet` para `apresentar os exercícios sem me preocupar com a internet para os alunos em sala de aula`.
- **Requisitos Funcionais Associados:**
  - [RF03 - Exercícios Offline, após processamento](../funcionais/rf-lista.md)
  - [RF13 - Variedade de temas](../funcionais/rf-lista.md)
  - [RF15 - Entrega de deck/clips por partes](../funcionais/rf-lista.md)
- **Requisitos Não Funcionais Associados:**
  - [RNF02 - Reprodução consistente em diferentes niveis de internet](../nao-funcionais/rnf-lista.md)
- **Regras de Negócio Associadas:**
  - [BR05 - Acesso offline a decks salvos](../regras/br-lista.md)
- **Critérios de Aceitação:**
  - [ ] **Cenário 1: Acessando a plataforma depois de ter fechado.** Dado que Paulo Barbosa fechou a plataforma e a abriu novamente, quando ele acessar a tela de exercícios, então os exercícios salvos localmente devem ser exibidos e estar disponíveis.
  - [ ] **Cenário 2: Acessando a plataforma sem internet.** Dado que Paulo Barbosa está sem conexão de internet, quando ele abrir a plataforma e acessar a tela de exercícios, então os exercícios salvos localmente devem ser exibidos e estar disponíveis para execução offline.
