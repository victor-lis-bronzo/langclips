# ADR 003: Gerenciamento de Filas de Processamento de Vídeo com BullMQ

* **Status:** Aceito
* **Data:** 2026-07-24

## Contexto e Problema
O processamento de vídeo envolve tarefas computacionalmente pesadas e demoradas (extração de áudio via FFmpeg, transcrição via Whisper API/local, segmentação em clipes). Executar essas tarefas de forma síncrona dentro da requisição HTTP causaria *timeouts* no cliente e bloquearia a API.

## Decisão
Decidimos utilizar **BullMQ** alimentado por **Redis** para o gerenciamento da fila de tarefas assíncronas no backend.

## Justificativa
1. **Desacoplamento:** O controller HTTP aceita o pedido imediatamente (`202 Accepted`) e delega a execução para o worker em segundo plano.
2. **Resiliência:** O BullMQ oferece suporte a tentativas de reexecução (retries), controle de concorrencia e tratamento de falhas.
3. **Monitoramento:** Facilidade de integração com o Bull Board (`@bull-board/nestjs`) para visualizar o status das filas em ambiente de desenvolvimento.

## Consequências
* **Positivas:** API de resposta rápida e não-bloqueante; processamento de mídia resiliente e monitorável.
* **Negativas:** Adiciona dependência da infraestrutura do Redis para o funcionamento completo da aplicação.
