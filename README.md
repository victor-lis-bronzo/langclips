# LangClips 🎬

> Uma plataforma de processamento de vídeos e geração autônoma de exercícios de listening baseada em IA, projetada com arquitetura offline-first.

O **LangClips** resolve o problema de acessibilidade e interatividade no aprendizado de idiomas. A plataforma permite o upload de vídeos curtos, realiza a segmentação e transcrição automática utilizando Inteligência Artificial, e gera dinamicamente exercícios (Lacunas, Ditado, Múltipla Escolha). Todo o consumo do material pelo usuário final foi desenhado para suportar degradação de rede, funcionando de forma consistente até mesmo em ambientes totalmente offline.

## 🏗 Arquitetura e Decisões de Engenharia

O projeto foi estruturado como um monorepo (`pnpm workspaces`) para compartilhar tipagens e configurações, dividindo responsabilidades entre interface, API e processamento em background.

- **Processamento Assíncrono (Workers & Fila):** Manipulação de mídia (FFmpeg) e requisições de transcrição de IA (Whisper) são custosas. A arquitetura isola essas tarefas do fluxo principal. A API atua apenas como orquestradora, enfileirando _jobs_ no **Redis** (via BullMQ) e liberando o cliente imediatamente.
- **Edge Storage & Pre-signed URLs:** Para evitar sobrecarga de I/O no servidor principal e economizar banda, os uploads de vídeo (até 50MB) não passam pela API. O front-end solicita uma Pre-signed URL e envia o arquivo diretamente para o **Cloudflare R2** (S3-compatible).
- **Offline-First (IndexedDB):** Pensando em usuários com conectividade intermitente (ex: salas de aula públicas), o front-end consome e salva os "Decks" (vídeos + exercícios) localmente no navegador utilizando **IndexedDB**. A reprodução de mídia e a validação das respostas ocorrem localmente sem requisições adicionais.
- **Proteção de Infraestrutura:** Implementação de limite de payload na assinatura das URLs e controle estrito de _rate-limit_ para mitigar abusos de consumo na API do Whisper.

## 💻 Tech Stack

- **Front-end:** Next.js, React, Tailwind CSS, IndexedDB (Armazenamento Local).
- **Back-end (API):** NestJS, TypeScript.
- **Processamento (Worker):** Node.js, FFmpeg (Extração e Chunking de Áudio), OpenAI Whisper API (Transcrição).
- **Infraestrutura & Storage:** Redis (Filas/Mensageria), Cloudflare R2 (Buckets S3), Docker Compose.
- **Gerenciamento:** Turborepo, pnpm workspaces.

## 📂 Estrutura do Monorepo

```text
langclips/
├── api/          # Back-end principal (NestJS). Orquestra rotas, presigned URLs e enfileiramento.
├── web/          # Aplicação Front-end (Next.js). Interface Bento Grid e lógica offline-first.
├── worker/       # Serviço de background. Processa FFmpeg, extrai áudio e consome IA.
├── infra/        # Configurações de contêineres e serviços auxiliares (Docker Compose).
└── docs/         # Documentação de requisitos (RF/RNF/BR), arquitetura e design (Figma/Wireframes).

```

## 🚀 Como executar localmente

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (v8+)
- [Docker](https://www.docker.com/) & Docker Compose
- [FFmpeg](https://ffmpeg.org/) instalado e configurado nas variáveis de ambiente do SO (necessário para o Worker).

### 2. Configuração de Variáveis de Ambiente

Crie os arquivos `.env` baseando-se nos exemplos fornecidos em cada pacote:

- `api/.env` (Configurações do R2, Redis, CORS)
- `worker/.env` (Chaves da OpenAI/Whisper, credenciais do R2, Redis)
- `web/.env` (URLs da API local)

### 3. Subindo a Infraestrutura

Inicie o Redis utilizando o Docker Compose:

```bash
cd infra
docker compose up -d

```

### 4. Instalando dependências e iniciando

Na raiz do projeto, instale todas as dependências do monorepo e inicie os serviços em paralelo:

```bash
pnpm install
pnpm dev
```

Este comando utilizará o Turborepo para iniciar simultaneamente a `api`, o `web` e o `worker`.

- **Interface Web:** `http://localhost:3000`
- **API:** `http://localhost:3333` (ou a porta definida no seu .env)

## 📌 Status Atual do Projeto

O projeto encontra-se em fase de **polimento e finalização** (Quase Pronto).
A esteira de processamento de vídeos (upload -> fila -> ffmpeg -> transcrição) e o fluxo offline-first já estão desenhados e implementados. Refinamentos de UI/UX e skeleton states (Bento Grid) estão sendo estabilizados.
