# TDD: LangClips - Technical Design Document

**Autor(es):** Victor Lis Bronzo
**Data:** 04/07/2026
**Status:** Finalizado

## 1. Contexto e Objetivo

* A ideia é criar uma plataforma que, sem custos ou com custos baixos, seja possível entregar materiais de vídeo (em Inglês) e gerar exercícios de audição;
* É possível ver a tradução de palavras desconhecidas, tentar adivinhar as palavras ditas, também sendo possível ver a tradução completa;

## 2. Escopo

### In Scope

* Criação do frontend
* Criação do backend
* Criação da fila de processamento
* Criação do banco de dados IndexedDB para armazenamento local

### Out of Scope

* Sistema de autenticação;
* Banco de dados em nuvem;
* Criação de novas funcionalidades (além do escopo definido);

## 3. Arquitetura da Solução Proposta

A arquitetura adota um modelo de processamento assíncrono baseado em eventos para isolar operações intensivas de CPU e I/O. O fluxo opera nas seguintes etapas:

1. **Upload Direto (Client -> Cloudflare R2):** O frontend solicita uma URL assinada e transfere o vídeo diretamente para o R2, aliviando o servidor Fastify de lidar com streams de mídia pesados na mesma thread.
2. **Orquestração (Fastify -> Redis/BullMQ):** Com o upload concluído, a API registra um job no Redis via BullMQ, garantindo controle de concorrência e gerenciamento automático de retentativas.
3. **Processamento (Worker -> Whisper API):** Um processo Node.js isolado (Worker) consome o job, faz o download do R2, utiliza `fluent-ffmpeg` para extrair o áudio e o envia para a API do OpenAI Whisper. O Worker processa os timestamps, estrutura as lacunas para os exercícios e atualiza a fila.
4. **Comunicação em Tempo Real (SSE -> Client):** O status do job é transmitido em tempo real para o frontend através de Server-Sent Events (SSE). O cliente escuta ativamente o status em vez de fazer long-polling.
5. **Persistência Offline (Frontend -> IndexedDB):** O payload finalizado é consumido pelo cliente web, que faz o download da mídia cortada e armazena os dados estruturados no IndexedDB, habilitando o consumo integral do deck em modo offline.

## 4. Stack Tecnológica e Infraestrutura

* **Frontend:** Next.js (React) + Tailwind CSS + localforage (para facilitar manipulação do IndexedDB).
* Justificativa: Next.js atende ao requisito de UI moderna. O localforage abstrai a complexidade do IndexedDB permitindo salvar Blobs de vídeo de forma assíncrona com API baseada em Promises.


* **Backend (API):** Node.js com Fastify.
* Justificativa: Fastify suporta um throughput muito maior que o Express e possui ecossistema maduro para rate-limiting (`@fastify/rate-limit`) e SSE (`@fastify/reply-from` / streams nativas).


* **Fila e Cache:** Redis + BullMQ.
* Justificativa: BullMQ lida nativamente com controle de concorrência, retentativas e isolamento de jobs, essencial para não derrubar o servidor rodando FFmpeg.


* **Processamento de Mídia:** Worker Node.js isolado + fluent-ffmpeg + OpenAI Whisper API.
* Justificativa: Separar a extração de áudio/cortes da API principal evita que o event loop do Node bloqueie.


* **Object Storage (Nuvem):** Cloudflare R2.
* Justificativa (Foco em Custo): Ao contrário do AWS S3, o R2 não cobra taxa de egress (banda de saída). Como vídeos consomem muita banda, isso anula o risco de faturas astronômicas.



## 5. Modelo de Dados

### 5.1. Armazenamento Local (IndexedDB - Cliente)

Como a aplicação deve funcionar offline, os dados e mídias precisam viver no navegador do usuário.

#### Store: `decks`

* `id` (String, UUID)
* `title` (String)
* `createdAt` (Timestamp)

#### Store: `clips`

* `id` (String, UUID)
* `deckId` (String, FK para `decks`)
* `mediaBlob` (Blob - O arquivo de vídeo real salvo no dispositivo do usuário)
* `transcription` (Array de Objetos: `[{ word: "hello", start: 0.5, end: 1.0, isGap: false }]`)
* `status` (Enum: `PENDING`, `DONE`)

### 5.2. Estrutura do Redis (Servidor)

#### BullMQ Queue: `video-processing`

* `jobId`: UUID
* `data`: `{ fileKey: "uploads/abc-123.mp4", durationLimit: 180, language: "en" }`

## 6. Contratos de API (Endpoints)

Todos os endpoints utilizam Fastify. Não há tráfego de Blob/Vídeo através da API para evitar OOM (Out of Memory).

### `POST /api/v1/uploads/presigned-url`

* **Objetivo:** Retorna uma URL segura e temporária para o frontend fazer o upload direto no Cloudflare R2.
* **Request Body (application/json):**
```json
{
  "filename": "video.mp4",
  "fileSize": 45000000,
  "contentType": "video/mp4"
}

```


* **Response (200 OK):**
```json
{
  "uploadUrl": "https://<bucket>.r2.cloudflarestorage.com/tmp/abc-123.mp4?signature=...",
  "fileKey": "tmp/abc-123.mp4"
}

```


* **Response (400 Bad Request):** Tamanho excede 50MB ou extensão de mídia não suportada.
* **Response (429 Too Many Requests):** Limite de requisições por IP atingido no decorrer da hora.

### `POST /api/v1/jobs/process`

* **Objetivo:** Avisa o backend que o upload no S3/R2 terminou e insere na fila de processamento.
* **Request Body (application/json):**
```json
{
  "fileKey": "tmp/abc-123.mp4"
}

```


* **Response (202 Accepted):**
```json
{
  "jobId": "e12b9a7c-3b64-4e2a-8d19-4a6c8e3a00f1",
  "status": "QUEUED"
}

```


* **Response (404 Not Found):** `fileKey` inválida ou não localizada temporariamente no R2.

### `GET /api/v1/jobs/:jobId/events`

* **Objetivo:** Conexão SSE (Server-Sent Events). O frontend fica escutando aqui até o processamento terminar.
* **Headers:** `Accept: text/event-stream`
* **Response Stream (Fluxo Nominal):**
```http
event: progress
data: {"status": "PROCESSING", "progress": 50, "step": "audio_extraction"}

event: completed
data: {"status": "COMPLETED", "clips": [...dados textuais e urls finais...]}

```


* **Response Stream (Erro de Processamento):**
```http
event: error
data: {"status": "FAILED", "reason": "Unprocessable Media or Whisper API timeout"}

```



## 7. Segurança, Riscos e Gargalos (Invoice Protection)

* **Risco 1:** Fatura estourar por armazenamento fantasma no S3/R2.
* Mitigação: Configurar Lifecycle Rules no bucket (S3/R2). Qualquer arquivo no prefixo `tmp/` é deletado automaticamente pelo provedor após 10 minutos. A API nunca precisa se preocupar em deletar.


* **Risco 2:** Ataque DDoS abusando da API do Whisper.
* Mitigação: Implementar `@fastify/rate-limit`. Máximo de 5 envios de vídeos por IP a cada 1 hora. Implementar Cloudflare Turnstile (Captcha invisível) no Frontend antes de solicitar a pre-signed URL.


* **Risco 3:** Arquivos maliciosos ou gigantes.
* Mitigação: A Pre-signed URL será assinada com um limite estrito de Content-Length-Range de 1MB a 50MB. Se o usuário tentar upar 51MB direto no R2, o provedor rejeita.


* **Risco 4:** OOM (Out of Memory) no IndexedDB.
* Mitigação: Implementar uma política de LRU (Least Recently Used) no Frontend. Ao salvar um novo deck, o sistema do IndexedDB deleta o deck mais antigo, substituindo ele.



## 8. Alternativas Consideradas

* **FFmpeg via WebAssembly (WASM) rodando direto no navegador (Frontend):** Parecia uma excelente ideia para economizar custos de servidor, forçando o PC do usuário a fazer o corte do vídeo. Porém, contraria a Persona Paulo Barbosa (PCs fracos de escolas). Processar vídeo em um i3 de 4ª geração via WASM faria o navegador travar, arruinando a experiência.
* **WebSockets vs Server-Sent Events (SSE):** WebSockets são bidirecionais e consomem mais recursos/setup (ping/pong frames). Como precisamos apenas que o servidor informe o cliente que o vídeo ficou pronto, o SSE é mais leve, opera no protocolo HTTP padrão e é nativamente suportado por navegadores sem bibliotecas pesadas como Socket.io.