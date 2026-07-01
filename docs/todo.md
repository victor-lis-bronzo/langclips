# Roteiro de Engenharia e Documentação: Projeto LangClips

Este documento serve como um guia passo a passo para a construção de todos os artefatos de engenharia de software do projeto LangClips, do conceito ao código.

---

## 1. Fase de Concepção e Produto (Discovery)

O objetivo aqui é alinhar a visão geral do projeto antes de detalhar a técnica.

- [x] **Documento de Visão e Escopo:** (Concluído! É o texto base que você já escreveu).
- [x] **Definição de Personas:** Criar 2 a 3 perfis de usuários fictícios *(ex: "Maria, estudante intermediária que quer treinar o listening", "João, professor que precisa de exercícios rápidos")*.
- [x] **Glossário do Projeto:** Uma lista simples definindo termos técnicos do seu domínio *(ex: o que é um "Clip", "Sessão Volátil", "Deck", "Ditado")*.

---

## 2. Engenharia de Requisitos

Tradução do escopo para itens testáveis e acionáveis.

- [X] **Documento de Requisitos Funcionais (RF):** Lista enumerada do que o sistema faz *(ex: RF01 - O sistema deve permitir upload de arquivos MP4 e MOV até 50MB)*.
- [X] **Documento de Requisitos Não Funcionais (RNF):** Lista enumerada de restrições técnicas *(ex: RNF01 - O processamento do vídeo deve ocorrer em memória RAM, sem persistência em disco)*.
- [X] **Product Backlog (Histórias de Usuário):** Transformar os requisitos no formato ágil *(ex: Como [Estudante], eu quero [ver a transcrição com lacunas] para [praticar minha audição])*.
- [X] **Critérios de Aceite:** Definir 2 a 3 regras para considerar cada História de Usuário como "pronta".

---

## 3. Modelagem de Comportamento (UML Dinâmico)

Mapeando as interações e os fluxos lógicos antes de codar.

- [ ] **Diagrama de Casos de Uso:** Desenho mostrando os atores (Usuário Anônimo, API Whisper) e as ações principais *(Fazer Upload, Responder Exercício, Ver Tradução)*.
- [ ] **Diagrama de Atividades (Fluxo Principal):** Fluxograma detalhando o caminho do vídeo *(Início -> Upload -> Extração de Áudio via FFmpeg -> Chamada API Whisper -> Geração de Clipes -> Fim)*.
- [ ] **Diagrama de Máquina de Estados (Opcional):** Mapear os estados do arquivo de vídeo *(Recebido -> Em Processamento -> Fatiado -> Descartado)*.

---

## 4. Design e Arquitetura (UML Estrutural)

Definindo as peças do quebra-cabeça técnico.

- [ ] **Diagrama de Componentes (ou Modelo C4 - Nível 2):** Mostrar a relação macro *(Frontend Next.js <-> Backend Node.js <-> FFmpeg <-> API OpenAI)*.
- [ ] **Diagrama de Classes (Foco no Domínio):** Modelar as classes/interfaces TypeScript *(ex: class VideoProcessor, interface Clip { id: string, text: string, startTime: number, endTime: number }, class ExerciseSession)*.
- [ ] **Diagrama de Sequência:** Mostrar a linha do tempo da comunicação de um processo crítico *(ex: O clique no botão "Enviar Vídeo" até o retorno do "Exercício Gerado")*.

---

## 5. Interface e Prototipação (UI/UX)

Visão final do usuário.

- [ ] **Wireframes (Baixa Fidelidade):** Rascunho estrutural das telas *(Tela de Upload, Tela do Player/Exercício, Tela de Resumo)*.
- [ ] **Prototipação (Alta Fidelidade - Figma/Penpot):** Design com cores, botões e tipografia reais.
- [ ] **Mapeamento de Navegação:** Diagrama simples mostrando como o usuário vai de uma tela para outra.

---

## 6. Documentação Técnica Orientada ao Código (Dev)

Artefatos criados paralelamente ou logo antes de escrever o código.

- [ ] **Especificação de API (OpenAPI/Swagger):** Documentar os endpoints do seu backend *(ex: POST /api/v1/process-video, detalhando o payload que recebe o FormData e a resposta JSON com os clipes)*.
- [ ] **Decisões de Arquitetura (ADRs - Architecture Decision Records):** Documentos curtos justificando escolhas tecnológicas *(ex: "Por que escolhemos Node.js com Multer ao invés de Python para a Fase 1?")*.
- [ ] **Modelo de Dados (Estado / LocalStorage):** Como não há banco na Fase 1, documentar o formato do JSON que o frontend vai guardar no estado global (Zustand/Context API) para manter a pontuação da sessão atual.

---

## 7. Qualidade e Entrega

Garantindo que a plataforma funciona conforme documentado.

- [ ] **Plano de Testes:** Definir quais fluxos terão testes automatizados *(ex: Testar se a função de verificar resposta do ditado lida bem com pontuação e letras maiúsculas/minúsculas)*.
- [ ] **README.md do Repositório:** O documento principal do seu GitHub. Deve conter: O que é o projeto, Stack utilizada, Como rodar localmente, e Como contribuir.

