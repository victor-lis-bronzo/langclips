# Especificação de API (OpenAPI / Swagger)

Esta especificação descreve a interface REST e endpoints disponíveis no backend do **LangClips** (construído sobre NestJS + Fastify).

---

## 1. Visão Geral & Documentação Interativa (Swagger UI)

Quando o backend estiver rodando localmente (ambiente de desenvolvimento), a documentação interativa Swagger/OpenAPI pode ser acessada em:

- **Swagger UI:** `http://localhost:3333/docs`
- **Porta Padrão:** `3333` (configurável via `PORT` no `.env`)

---

## 2. Endpoints do Domínio de Vídeos (`/videos`)

### 2.1. Processar Vídeo
Envia um pedido de processamento assíncrono (extração de áudio e transcrição/segmentação).

- **Rota:** `POST /videos/process`
- **Código de Sucesso:** `202 Accepted`

#### Payload da Requisição (JSON)
```json
{
  "fileKey": "uploads/video-12345.mp4"
}
```

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `fileKey` | `string` | Sim | Identificador do arquivo armazenado no S3 / Storage local temporário. |

#### Resposta de Sucesso (`202 Accepted`)
```json
{
  "message": "Upload acknowledged and job queued.",
  "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

#### Respostas de Erro
- **`400 Bad Request`**: Caso `fileKey` não seja informada ou seja inválida.

---

### 2.2. Acompanhamento de Progresso via Server-Sent Events (SSE)
Abre uma conexão persistente SSE para receber notificações do andamento do job de processamento.

- **Rota:** `GET /videos/events/:jobId`
- **Tipo de Resposta:** `text/event-stream`

#### Parâmetros de Path
| Parâmetro | Tipo | Descrição |
| :--- | :--- | :--- |
| `jobId` | `string` | ID do job retornado na rota `/videos/process`. |

#### Exemplo de Evento Recebido (JSON dentro de `data`)
```json
{
  "status": "PROCESSING",
  "progress": 50,
  "step": "extracting-audio"
}
```
*Observação: Ao finalizar com sucesso, os metadados dos clipes e o resultado final da transcrição são emitidos pelo evento.*

---

### 2.3. Confirmar Download e Limpeza de Arquivos
Notifica o backend que o frontend já fez o download dos recortes/arquivos de mídia necessários para a sessão, autorizando a remoção imediata do storage temporário.

- **Rota:** `POST /videos/acknowledge-download`
- **Código de Sucesso:** `200 OK`

#### Payload da Requisição (JSON)
```json
{
  "fileKeys": [
    "uploads/video-12345.mp4",
    "uploads/temp-audio-12345.mp3"
  ]
}
```

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `fileKeys` | `string[]` | Sim | Lista contendo as chaves dos arquivos no storage a serem deletados. |

#### Resposta de Sucesso (`200 OK`)
```json
{
  "acknowledged": true,
  "deletedCount": 2
}
```

#### Respostas de Erro
- **`400 Bad Request`**: Caso `fileKeys` esteja vazio ou não seja um array de strings.
