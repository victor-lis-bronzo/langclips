# ADR 004: Persistência de Dados e Mídia Local com IndexedDB

* **Status:** Aceito
* **Data:** 2026-07-24

## Contexto e Problema
Na Fase 1 (MVP) do LangClips, a privacidade do usuário e a ausência de infraestrutura cara de banco de dados em nuvem são requisitos essenciais. As mídias e pontuações do usuário devem persistir durante a utilização e ser gerenciadas localmente sem exigir um cadastro/login.

## Decisão
Decidimos utilizar o **IndexedDB** no navegador do cliente (através da biblioteca `idb`) como a fonte primária de armazenamento local dos clipes, decks e histórico de exercícios.

## Justificativa
1. **Armazenamento de Binários (Blobs):** O `LocalStorage` comum possui um limite rigoroso de ~5MB e armazena apenas strings. O IndexedDB suporta armazenamento de arquivos binários (`Blob` de vídeo/áudio) em grande volume.
2. **Desempenho Assíncrono:** Operações no IndexedDB não bloqueiam a thread principal de renderização do navegador.
3. **Privacidade:** Nenhum dado do usuário ou arquivo de vídeo recortado precisa ser mantido em servidores de terceiros após o término do processamento.

## Consequências
* **Positivas:** Custo zero de banco de dados em nuvem na primeira fase; velocidade imediata de reprodução dos recortes de mídia locais.
* **Negativas:** Caso o usuário limpe os dados do navegador ou troque de dispositivo, seu progresso e os vídeos locais não serão sincronizados automaticamente.
