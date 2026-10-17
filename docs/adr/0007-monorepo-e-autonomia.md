# ADR-0007 — Monorepo e autonomia das aplicações

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípio:** P09  
**Aceitação:** pendente.

## Contexto

O Achados na Rota começa em um monorepo derivado de uma base anterior ([origem da base](../origem-da-base.md)). Não há aplicação legada a migrar nem projetos existentes a incorporar. Os consumidores declarados hoje são o app `achados-web` (Next.js), a vitrine `design-system` (Storybook) e a documentação de negócio `docs` (Fumadocs).

O documento de produto [02 — Arquitetura](../produto/02-arquitetura.md) prevê, como hipótese, um backend Node.js, um worker de PDF e eventos e componentes GoLink reutilizáveis "apenas após inventário técnico". Onde esses serviços vão morar, se neste repositório ou em outro, ainda não está decidido. O mesmo monorepo também deve servir de base para novos produtos ([ADR-0023](0023-scaffold-como-template.md)).

## Decisão proposta

Monorepo com aplicações autônomas, contratos públicos e compartilhamento explícito de capacidades. O [ADR-0011](0011-estrutura-monorepo.md) define apps/packages, o escopo `@achados`, pnpm e Turborepo; topologia de implantação permanece posterior.

### Compartilhamento

| Capacidade                     | Condição para compartilhar                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Result/Error                   | Contrato canônico e runtime compatível; sem dependência de framework.                           |
| Tokens de design               | Formato consumível pelas tecnologias reais dos consumidores.                                    |
| Contratos e cliente HTTP       | Mesma API/semântica; separar execução server-only de código que pode chegar ao navegador.       |
| UI React                       | Versões React, acessibilidade e contratos compatíveis nos consumidores declarados.              |
| DataBoundary e adaptação Query | Dependências de runtime explícitas; não obrigar consumidores sem Query a instalar seu provider. |
| Domínio compartilhado          | Regra de negócio realmente comum, com dono e contrato estável.                                  |
| Configurações e testes         | Base comum com adaptações necessárias por ferramenta/runtime.                                   |

Aplicações não importam aplicações. Pacotes não importam aplicações e não criam ciclos. Compartilhar o repositório não obriga compartilhar toda implementação, todo build, todo deploy ou uma única versão de dependência. Um consumidor que use outro framework pode consumir tokens e contratos sem consumir UI React.

Não mover automaticamente código para um pacote porque apareceu duas vezes. Promover quando os consumidores compartilham semântica, a API se estabilizou e alguém assume manutenção. Uma cópia temporária durante descoberta exige rastreio e retirada; não justifica dois cores Result ou dois padrões de erro.

### Entrada de uma nova aplicação ou serviço

Um backend, worker ou outro app só entra no workspace com:

1. Responsabilidade e dono definidos, com o ADR correspondente.
2. Manifest próprio, dependências declaradas e scripts `lint`, `typecheck`, `test` e `build` reais, sem tarefas fictícias.
3. Porta na faixa do monorepo ([README](../../README.md)), sem colidir com as existentes.
4. Contrato de comunicação com os demais apps (HTTP, eventos), em vez de import direto.
5. Inclusão nas verificações de arquitetura e na CI.

Componentes GoLink citados nos documentos de produto seguem a mesma regra: auditar primeiro, depois incorporar pelo contrato. Não copiar um módulo inteiro para dentro de um app e declarar a capacidade pronta ([09 — Prompt](../produto/09-prompt-claude.md), item 4).

### Base para outros produtos

O monorepo é base de novos produtos por um template derivado, não por cópias manuais divergentes ([ADR-0023](0023-scaffold-como-template.md)). Isso reforça a autonomia: pacotes genéricos não conhecem o Achados na Rota, e o que é do Achados na Rota fica em apps ou em pacotes nomeados por domínio.

## Alternativas consideradas

- Repositórios separados com bibliotecas publicadas: mantém isolamento, mas adiciona coordenação de versões; pode ser reconsiderado se a autonomia de equipes ou a implantação exigirem.
- Um único app Next contendo tudo (UI, documentação e vitrine): menos configuração, mas acopla deploys e dependências de públicos diferentes.
- Unificar todas as dependências por overrides globais: simplifica a instalação e esconde incompatibilidades entre consumidores.

## Consequências

Compartilhamento e verificações entre projetos ficam mais diretos. O monorepo exige contratos, donos e verificação dos consumidores afetados. A entrada de backend e worker depende de decisões ainda abertas ([princípios, seção 7](../arquitetura.md#7-decisões-ainda-abertas)).

## Verificação de aderência

| Regra                          | Evidência                                                | Estado                     |
| ------------------------------ | -------------------------------------------------------- | -------------------------- |
| Autonomia e imports válidos    | `pnpm check:architecture` e build dos consumidores       | Pendente neste repositório |
| Pacotes genéricos sem domínio  | Regra de imports e revisão; grep por nomes do produto    | Planejado                  |
| Nova aplicação segue o roteiro | Revisão do PR que a introduz, com ADR, portas e CI       | Planejado                  |
| Template sem dados de produto  | Geração de um projeto a partir do template e build limpo | Planejado (ADR-0023)       |

**Pendências:** local do backend e do worker, topologia de implantação e estratégia de publicação do template.
