# ADR 002: Escolha do Framework Backend (NestJS + Fastify)

* **Status:** Aceito
* **Data:** 2026-07-24

## Contexto e Problema
O backend do LangClips é responsável por orquestrar o upload de arquivos de mídia, comunicação com filas de processamento e emissão de eventos em tempo real para o cliente. Era necessária uma estrutura sólida, com boa arquitetura de código, facilidade de injeção de dependências e documentação de API automatizada.

## Decisão
Decidimos utilizar **NestJS** configurado com o adaptador **Fastify** ao invés do Express padrão.

## Justificativa
1. **Arquitetura Modular:** NestJS força uma organização limpa orientada a módulos, controllers e serviços.
2. **Desempenho com Fastify:** O Fastify oferece um rendimento (throughput) de requisições por segundo significativamente superior ao Express.
3. **Swagger Integrado:** O suporte ao `@nestjs/swagger` permite gerar especificações OpenAPI diretamente a partir de decorators nos DTOs e Controllers.

## Consequências
* **Positivas:** Manutenibilidade e escalabilidade do código do servidor; geração automatizada de documentação OpenAPI.
* **Negativas:** Menor disponibilidade de plugins de terceiros que dependem estritamente do middleware do Express, exigindo eventuais adaptações para Fastify.
