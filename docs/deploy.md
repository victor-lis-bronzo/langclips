# Runbook de Deploy

Este documento descreve como operar o pipeline de release por tag (`.github/workflows/release.yml`)
deste repositório: quais secrets e variables configurar no GitHub, como preparar a VPS e a Cloudflare,
como cortar um release, como fazer rollback, e o que foi deliberadamente deixado fora do escopo.

O projeto não usa banco de dados (a persistência é local, via IndexedDB no navegador — ver
[`docs/adr/004-armazenamento-local-indexeddb.md`](./adr/004-armazenamento-local-indexeddb.md)), então
não existe nenhuma etapa de migration neste pipeline.

## Secrets do repositório GitHub

Configurar em **Settings → Secrets and variables → Actions → Secrets**, no escopo do repositório
(não no environment `production` — ver aviso abaixo).

| Secret | Descrição | Onde/como obter |
|---|---|---|
| `SSH_PRIVATE_KEY` | Chave privada SSH do usuário de deploy da VPS | Gerada ao criar o usuário `deploy` na VPS (ver "Setup da VPS") |
| `SSH_KNOWN_HOSTS` | Entrada de known_hosts da VPS | `ssh-keyscan -H <host-da-vps>` |
| `GHCR_TOKEN` | Personal Access Token (fine-grained), escopo `read:packages` | Usado para `docker login ghcr.io` na VPS ao puxar as imagens publicadas pelo pipeline |
| `CLOUDFLARE_API_TOKEN` | Token com permissão "Workers Scripts:Edit" | Painel Cloudflare → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | ID da conta Cloudflare | Painel Cloudflare, barra lateral da conta |
| `BACKUP_PASSPHRASE` | Senha usada para cifrar (`gpg -c`) os backups de `.env` e o snapshot do Redis | Gerar uma senha forte e guardar num gerenciador de segredos |

## Variables do repositório GitHub

Configurar em **Settings → Secrets and variables → Actions → Variables**, mesmo escopo (repositório).

| Variable | Descrição | Exemplo |
|---|---|---|
| `SSH_TARGET` | Usuário e host SSH da VPS | `deploy@203.0.113.10` |
| `VPS_APP_DIR` | Diretório na VPS com `compose.prod.yml` e os `.env` de produção | `/home/deploy/langclips` |
| `VPS_BACKUP_DIR` | Diretório de destino dos backups cifrados | `/home/deploy/backups/langclips` |
| `BACKUP_RETENTION_DAYS` | Dias de retenção antes do prune automático dos backups | `14` |
| `API_PUBLIC_URL` | URL pública da api, usada pelo smoke test em `GET $API_PUBLIC_URL/health` | `https://api.langclips.com` |
| `WEB_PUBLIC_URL` | URL pública do web (Cloudflare Workers), usada pelo smoke test | `https://langclips.com` |
| `WEB_VITE_API_URL` | Mesma URL de `API_PUBLIC_URL`, injetada em build-time no bundle do web via `VITE_API_URL` | `https://api.langclips.com` |

`WEB_VITE_API_URL` existe como variable separada de `API_PUBLIC_URL` porque o Vite faz *inline* dessa
variável no bundle no momento do build — não é possível trocá-la depois via secret de runtime. O
artefato do `web` é, portanto, específico do ambiente em que foi construído.

### Aviso importante

Secrets e variables devem ficar no escopo **repositório**, e não no GitHub Environment `production`.
Os jobs `smoke` e `backup` do pipeline não declaram `environment: production` — se os valores forem
movidos para o escopo do environment, esses jobs simplesmente não os enxergam.

## Setup da VPS

1. Criar um usuário `deploy` dedicado (não usar `root`) com Docker e Docker Compose instalados.
2. Criar o diretório `${VPS_APP_DIR}` e, dentro dele, os arquivos `api.env`, `worker.env` e
   `redis.env` — copiados de [`infra/api.env.example`](../infra/api.env.example),
   [`infra/worker.env.example`](../infra/worker.env.example) e
   [`infra/redis.env.example`](../infra/redis.env.example), preenchidos com valores reais e com
   permissão `chmod 600`.
3. Garantir que a rede Docker `proxy-network` (externa) já existe na VPS antes do primeiro
   `docker compose up` — é a mesma rede usada pelo nginx que já roda os outros serviços dessa VPS
   (`docker network create proxy-network`, se ainda não existir).

### Passo manual fora deste repositório

Adicionar um server block no nginx da VPS com `proxy_pass http://langclips-api:3333;` e emitir
certificado TLS via certbot para o domínio da api. Isso vive na configuração de infraestrutura da
VPS, fora deste repositório, e não é feito pelo pipeline.

O server block deve repassar o IP do cliente com
`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`.

### IP real do cliente atrás do proxy (`TRUST_PROXY`)

O rate limit da api (`@nestjs/throttler`, ex.: 5/min em `POST /videos/process`) conta requisições
por `request.ip`. Atrás do nginx, sem configuração, esse IP é sempre o do proxy — e o limite vira
global, compartilhado por todos os usuários. A variável opcional `TRUST_PROXY` em `api.env` define
de quem a api aceita o header `X-Forwarded-For`:

| Valor | Comportamento |
|---|---|
| ausente, vazio, `false` ou `0` (padrão) | Headers de proxy ignorados; `request.ip` é o peer da conexão TCP |
| lista de IPs/CIDRs separada por vírgula, ex. `172.18.0.0/16` (recomendado) | Só confia no `X-Forwarded-For` quando a conexão vem de um desses endereços (aceita também `loopback`, `linklocal`, `uniquelocal`) |
| número de hops, ex. `1` | Confia nos N proxies mais próximos, independentemente do endereço do peer |

`true` (confiar em qualquer hop) é rejeitado na inicialização: permitiria a qualquer cliente forjar
o próprio IP via `X-Forwarded-For` e burlar o rate limit. Valores inválidos também impedem a api de
subir.

Em produção, use o subnet da rede `proxy-network` (`docker network inspect proxy-network --format
'{{(index .IPAM.Config 0).Subnet}}'`). `1` também é aceitável porque o `compose.prod.yml` não publica
portas da api — o único caminho até ela é o nginx — mas a lista de CIDRs continua correta mesmo se
isso mudar no futuro.

## Setup do Cloudflare

Criar o token de API com a permissão "Workers Scripts:Edit" e confirmar o Account ID antes do
primeiro deploy do `web`.

## Como fazer um release

```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

A tag precisa ser **anotada** (`-a`) — uma tag leve é rejeitada pelo job `resolve` do pipeline. Se a
tag foi criada errada, nunca a mova: delete e recrie.

```bash
git tag -d v0.1.0
git push origin :refs/tags/v0.1.0
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

## Como fazer rollback

Disparar o workflow `release.yml` manualmente (`workflow_dispatch`), informando a tag anterior
estável em `tag`, `confirm: yes`, e opcionalmente `skip_verify: true` para pular a verificação numa
emergência. Como as imagens são publicadas por tag no GHCR (imutáveis), o rollback é apenas um novo
`pull` + `up -d` da tag antiga — não requer rebuild.

## O que foi deliberadamente deixado de fora deste pipeline, e por quê

- **Sem stage de migration/dry-run de banco.** O projeto não usa banco de dados relacional — a
  persistência é no cliente, via IndexedDB (decisão documentada em
  [`docs/adr/004-armazenamento-local-indexeddb.md`](./adr/004-armazenamento-local-indexeddb.md)).
- **Backup de `.env`/Redis não é gate do release.** Roda isolado via cron diário
  (`.github/workflows/backup.yml`), sem bloquear deploys.
- **Falha no `smoke` não dispara rollback automático.** Fica registrado aqui como ação manual do
  operador — ver seção "Como fazer rollback" acima.
- **`api`'s `pnpm run test:e2e` não roda no `verify.yml`.** Descoberto durante a implementação deste
  pipeline: `api/test/app.e2e-spec.ts` sobe o `AppModule` inteiro com uma conexão real do BullMQ,
  sem serviço de Redis disponível em CI e sem fechar essa conexão no teardown — `app.close()` nunca
  resolve, e o teste trava até o timeout em vez de falhar rápido. É um problema pré-existente (não
  causado por este pipeline), simétrico ao que o commit `2608d43` já corrigiu para os testes
  unitários, mas que nunca chegou ao e2e. Para habilitar esse step no `verify.yml`, é necessário:
  adicionar um `services: redis` ao job `quality` (matrix `api`) e garantir que o teste feche a
  conexão do BullMQ (ex.: mock da fila igual ao usado nos testes unitários, ou `afterAll` explícito
  fechando o `BullModule`). Ficou fora do escopo deste PR por ser correção de infraestrutura de
  teste, não um bloqueador de deploy.

## Configuração que o pipeline não gerencia

A lifecycle rule de 10 minutos no prefixo `tmp/` do bucket R2 (ver
[`docs/TDD/tdd.md`](./TDD/tdd.md), seção 7) continua sendo configuração manual direto no painel da
Cloudflare — não é provisionada por este repositório nem pelo pipeline.
