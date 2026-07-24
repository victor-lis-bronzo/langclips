# ADR 001: Escolha do Framework Frontend (TanStack Start + TanStack Router)

* **Status:** Aceito
* **Data:** 2026-07-24

## Contexto e Problema
A aplicação LangClips necessita de uma interface web altamente reativa e interativa para exibição de vídeos curtos, execução de exercícios com feedback em tempo real e gerenciamento de arquivos em mídia local. Era preciso escolher um framework moderno que oferecesse suporte completo a TypeScript com garantia de segurança de tipos (type-safety) de ponta a ponta na navegação e nos estados.

## Decisão
Decidimos utilizar **TanStack Start** (baseado em Vite e React 19) integrado ao **TanStack Router**.

## Justificativa
1. **Type-Safety Estrito:** O TanStack Router oferece autocomplete e validação de rotas e parâmetros em tempo de compilação, eliminando erros comuns de navegação.
2. **Desempenho & DX:** Integração nativa com Vite proporcionando build extremamente rápido e Hot Module Replacement (HMR) leve.
3. **Ecosistema Unificado:** Integração simples com `@tanstack/react-query` e `@tanstack/store` para controle de estado.

## Consequências
* **Positivas:** Redução drástica de bugs causados por URLs e parâmetros incorretos; carregamento sob demanda eficiente de recursos.
* **Negativas:** Curva de aprendizado levemente maior em comparação com roteamento tradicional baseado em pastas do Next.js.
