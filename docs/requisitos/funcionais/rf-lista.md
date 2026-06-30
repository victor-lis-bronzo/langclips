### Requisitos Funcionais (RF) - O que o sistema deve fazer

Esta seção lista todas as ações e comportamentos que o sistema deve executar.

| ID       | Descrição                                                                                                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RF01** | O sistema deve permitir upload de arquivos MP4 e MOV até 50MB.                                                                                                                                                                    |
| **RF02** | O sistema deve armazenar o vídeo original temporariamente no servidor exclusivamente durante a sessão de processamento, descartando-o automaticamente ao término, permitindo a persistência local mediante comando do usuário.    |
| **RF03** | O sistema deve processar o vídeo enviado, mapear os tempos de fala e segmentar o arquivo bruto em múltiplos 'clips' sincronizados.                                                                                                |
| **RF04** | O sistema deve agrupar os 'clips' processados em um 'deck' e construir a estrutura de dados das 'lacunas' textuais necessária para o motor de exercícios.                                                                         |
| **RF05** | Os exercícios, antes de começar deverão permitir a escolha dos tipos de exercícios. Variando entre "Múltipla Escolha", "Preencher Lacunas" e "Ditado"                                                                             |
| **RF06** | O sistema deverá entregar o resultado imediato do exercício feito, diferença entre palavras, erros, faltas...                                                                                                                     |
| **RF07** | O sistema deverá possibilitar a consulta da tradução das palavras faladas (caso o usuário clique por isso)                                                                                                                        |
| **RF08** | O sistema deverá possibilitar a consulta da tradução da frase (caso o usuário clique por isso)                                                                                                                                    |
| **RF09** | O sistema deverá entregar um feedback ao usuário claro e compreensível em casos de exceções.                                                                                                                                      |
| **RF10** | O player deverá ser claro e de fácil entendimento. Tendo recursos como Pausa, Volume, Avançar e Voltar.                                                                                                                           |
| **RF11** | O sistema deve oferecer uma variedade de temas, para satisfazer os mais variados gostos e ambientes.                                                                                                                              |
| **RF12** | O sistema deve oferecer alternativas de download que não seja apenas por arquivos brutos `mp4` ou `.mov`. Uma implementação necessária a longo é prazo é permitir a instalação através de APIs como do TikTok, Instagram, Youtube |
| **RF13** | No painel dashboard podem ter sugestões de 'clips' para o usuário treinar, conhecer a plataforma e já ter um gatilho.                                                                                                             |
