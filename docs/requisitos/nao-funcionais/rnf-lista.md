### Requisitos Não Funcionais (RNF) - Como o sistema deve fazer

Esta seção define as restrições técnicas, de segurança, usabilidade e desempenho da plataforma.

| ID        | Descrição                                                                                                                                                                                                     | Categoria    | Prioridade |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------- |
| **RNF01** | O player deve iniciar a reprodução em menos de 2 segundos em conexões de 10Mbps e conseguir sustentar um buffer que evite pausas durante a execução.                                                          | Arquitetura  | Alta       |
| **RNF02** | Um 'deck' com mais de um 'clip' deve entregar eles por partes, ao invés de entregar tudo de uma vez.                                                                                                          | Arquitetura  | Alta       |
| **RNF03** | O cliente web deve suportar degradação de rede implementando retentativas automáticas e limitando o payload de upload a um bitrate máximo predefinido caso a latência da conexão do usuário ultrapasse 500ms. | Média        | Alta       |
| **RNF04** | A interface deve atingir pontuação mínima de 90 no Lighthouse para Acessibilidade e Performance. Especialmente em aparelhos mobile, como Tablets ou Smartphones.                                              | Layout UI/UX | Baixa      |
