# Revisão crítica do `tag-release-template`

O pipeline de release por tag deste repositório (`.github/workflows/release.yml` e arquivos
relacionados) foi construído usando
[`tag-release-template`](https://github.com/victor-lis-bronzo/tag-release-template) como base. Este
documento registra, por dois motivos, o que está errado ou melhorável nesse template:

1. Explicar por que este projeto divergiu do template em vários pontos.
2. Servir de backlog de correções para o template na origem.

## Seção 1 — Bugs e gaps confirmados no template

| # | Problema | Impacto |
|---|---|---|
| 1 | `verify.yml`/`_backup.yml` são chamados via `uses: ./.github/workflows/verify.yml` **sem passar `ref`** — um workflow reutilizável local sempre roda no ref do caller | Em `workflow_dispatch` de rollback disparado a partir de `main`, o `verify` valida **`main`, não a tag** que está sendo rollbackada. O sinal de verificação é falso |
| 2 | O input `skip_migrations` gateia só o job `migration-dryrun`; o job `deploy` roda `prisma migrate deploy` **incondicionalmente**, sem checar esse input | O input mente sobre o que faz. Em um rollback com `skip_migrations: true`, as migrations são aplicadas mesmo assim |
| 3 | `DB_ROOT_PASSWORD` e `BACKUP_PASSWORD` são passados como **argumento posicional** para o shell remoto via SSH | Ficam visíveis via `ps aux` para qualquer usuário local da própria VPS enquanto o comando roda. O README do template admite essa limitação |
| 4 | A segunda etapa de `_backup.yml` não segue o padrão `bash -s` com heredoc usado nas outras 5 chamadas remotas do template | `BACKUP_PASSWORD` acaba também no `argv` do **runner** do GitHub Actions, não só na VPS — inconsistência de segurança dentro do próprio template |
| 5 | O arquivo `last-release-<project>.txt` é escrito no job `deploy` e **nenhum workflow do template o lê** | É um registro de rollback "automático" que na prática não existe. Pior: é escrito *antes* do check de worktree suja e do checkout, então um deploy que falhou já sobrescreveu o registro; e rodar a mesma tag de novo destrói o registro da tag anterior — exatamente o dado que seria necessário para um rollback |
| 6 | O job `smoke` falhando **não dispara nenhum rollback**; produção fica na tag nova mesmo assim | Combinado com o item 5, significa que não existe caminho de recuperação automatizado nem dado confiável para um rollback manual rápido |
| 7 | `verify.yml` declara `concurrency: verify-${{ github.ref }}` com `cancel-in-progress: true`, mas como workflow reutilizável ele NÃO herda o grupo `production-release` do `release.yml` que o chamou | Um `workflow_dispatch` avulso do `verify.yml` no mesmo ref pode **cancelar o verify de um release em andamento** |
| 8 | O backup gera arquivos `prefix-<DATA>.sql.gz` sem nenhuma rotação/prune | Enche o disco da VPS silenciosamente ao longo do tempo, sem alerta |
| 9 | Dentro do job `deploy`, o `prisma migrate deploy` da api roda **antes** do checkout/build do web | Se o build do web falhar depois, o banco já está no schema novo, o web continua rodando código antigo, e o PM2 nunca reiniciou — um estado meio-aplicado sem remediação automática |
| 10 | O banco de dados temporário (scratch DB) criado pelo `migration-dryrun` só é dropado no caminho de sucesso — `set -e` aborta o script antes do `DROP` final em caso de falha | Lixo acumulado no MySQL a cada dry-run que falhar. Defensável para post-mortem, mas deveria ser um `trap` explícito documentado, não um efeito colateral do `set -e` |
| 11 | Apesar do nome "tag-release-template", **nenhum workflow cria um GitHub Release de fato** — todo workflow declara `permissions: contents: read`, sem nenhum `gh release create` | Quem adota o template esperando Releases com notas geradas não encontra isso pronto |
| 12 | `pnpm` é fixado em major `9` no `verify.yml`, mas o build de produção usa o pnpm instalado na própria VPS (não controlado pelo template) | Possível skew silencioso entre o que o CI valida e o que a produção efetivamente constrói |
| 13 | `ubuntu-latest` em todos os jobs, sem nenhum pin | É a única superfície de dependência não pinada, num template cuja premissa declarada é pinar tudo por SHA de commit |
| 14 | `env: TAG: ${{ env.TAG }}` é redeclarado no nível do step em `release.yml`, quando o `env.TAG` do job já está em escopo | Ruído sem função — não é um bug funcional, só ruído de manutenção |
| 15 | `if: github.repository != 'victor-lis-bronzo/tag-release-template'` desliga os jobs `verify` e `migration-check` quando rodam no próprio repositório do template | Os workflows do template **nunca são exercitados de verdade** no repositório de origem — só o `actionlint` roda. Um bump do Dependabot que quebre comportamento só seria percebido no projeto que adotou o template, não no template em si |

## Seção 2 — Acoplamentos que limitam o reuso como template

Não são bugs, mas o README do template se vende como genérico e na prática não é:

- MySQL, Prisma, Vitest, PM2, nvm e pnpm 9 estão todos hardcoded nos workflows.
- A matrix `project: [api, web]` fixa a forma específica de um monorepo de 2 apps.
- O esquema de tag única `vX.Y.Z` sem suporte a prerelease impede fluxos de canário/beta — uma tag
  como `v1.2.0-beta` até passa pelo glob do trigger (`v[0-9]*.[0-9]*.[0-9]*`), mas depois **falha** no
  regex estrito do job `resolve`, gerando um run vermelho em vez de simplesmente ser ignorada.

## Seção 3 — Melhorias propostas ao template, priorizadas

Correções diretas dos itens da Seção 1:

1. Passar `ref` explícito (a tag resolvida) ao chamar `verify.yml`/`_backup.yml`.
2. Fazer `skip_migrations` gatear de fato o `prisma migrate deploy` do job `deploy`, não só o
   `migration-dryrun`.
3. Entregar segredos remotos por stdin (ex.: `--passphrase-file` com arquivo `chmod 600` enviado por
   `scp`, ou `--password-stdin`) em vez de argumento posicional.
4. Usar `trap` para garantir o `DROP` do scratch DB mesmo em caminho de falha.
5. Adicionar rotação ao backup (retenção configurável + prune).
6. Adicionar um job de criação de GitHub Release (`gh release create --generate-notes --verify-tag`).
7. Derivar o grupo de concurrency do `verify.yml` a partir do grupo do caller, para não competir com
   o `production-release`.
8. Remover o `last-release-*.txt` ou passar a lê-lo de fato para um rollback automático.

O que este projeto (langclips) incorporou e que vale subir de volta para o template como sugestão:

- Publicar artefato imutável por tag em um registry de containers (GHCR) em vez de fazer build na
  própria VPS a cada deploy.
- Retry com backoff exponencial no smoke test em vez de um `sleep` fixo.
- Upload do relatório de teste (ex. Playwright) como artifact do CI quando o job falha.

## Seção 4 — O que foi descartado neste projeto, e por quê

Para deixar claro que foi decisão consciente, não esquecimento:

- **Sem `migration-check` nem `migration-dryrun`**: o langclips não usa banco de dados relacional — a
  persistência é no cliente via IndexedDB (decisão em
  [`docs/adr/004-armazenamento-local-indexeddb.md`](./adr/004-armazenamento-local-indexeddb.md)).
- **Sem backup de banco como gate pré-deploy**, já que não há banco a proteger. O backup existente
  aqui cobre só `.env` de produção e um snapshot do Redis (fila BullMQ), e roda isolado por cron, não
  bloqueando releases.
