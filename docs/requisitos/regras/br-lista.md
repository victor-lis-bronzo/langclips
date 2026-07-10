### Business Rules (BR) - Regras do Negócio

Essa seção lista todas as regras de negócio que o sistema deve seguir.

| **BR01** | Um 'clip' para ser considerado apto a 'deck' deve ter, no mínimo, 5 segundos de fala. E no máximo 20s | Arquitetura | Alta |
| **BR02** | O sistema dever ser permissivo em relação a "case sensitive" e "punctuation", ou seja, a resposta do usuário deve ser comparada com a resposta gerada pelo sistema desconsiderando maiúsculas, minúsculas e pontuações | Arquitetura | Média |
| **BR03** | Após o processamento de vídeos recebidos e retorno dos 'decks' (com 'clips'), o vídeo original deve ser imediatamente colado na fila para deletação, e então deletado. | Arquitetura | Alta |
| **BR04** | A submissão de vídeos para criação de 'decks' será apenas sob acesso à internet estável. | Arquitetura | Alta |
| **BR05** | Caso o usuário esteja sem internet, é apenas possível consumir decks já salvos localmente. | Arquitetura | Alta |
| **BR06** | Deverá ser implementado um 'garbage colletor' através de uma cron, que revisará arquivos orfãs ou processos sem conclusão em até 6h. | Arquitetura | Alta |
| **BR07** | Deverá ser implementado um 'limite de upload', caso o R2 já possua metade da sua cota excedida (cota total: 10GB, metade: 5GB), nenhum usuário poderá realizar novos uploads. | Arquitetura | Alta |
