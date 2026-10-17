# ADR-0001 — Módulos coesos e responsabilidade única

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípios:** P01, P02  
**Aceitação:** pendente.

## Contexto

O Meuproduto começa sem código legado, mas a experiência com sistemas que concentram responsabilidades mostra o custo: mudanças locais ficam difíceis de testar. Separar arquivos por extensão ou mover toda a lógica para um hook grande apenas desloca o problema. Precisamos de unidades que possam mudar independentemente, com dependências legíveis.

## Decisão proposta

Organizar o novo código por capacidades de negócio, com alta coesão e contratos públicos. A estrutura física será definida em outro ADR. Cada unidade tem um motivo principal para mudar: apresentação, coordenação de uma interação, regra ou integração.

Regras de negócio que pertencem ao frontend são funções independentes de React. Hooks conectam ciclo de vida, estado e recursos do React; casos de uso coordenam operações; adaptadores traduzem contratos externos. A API continua sendo a autoridade das regras e permissões; tenant e autorização são decididos no servidor ([ADR-003 de produto](../produto/adr/ADR-003.md)).

Não é obrigatório criar classe, interface e repository para cada operação. Introduzir um contrato de integração quando ele permite substituir uma dependência real ou testar a operação sem rede. Evitar camadas que apenas repassam os mesmos argumentos.

### Dependências permitidas

| Unidade                    | Pode depender de                                            | Não depende de                                   |
| -------------------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| Core Result/Error          | Tipos básicos e utilitários próprios do contrato            | React, Next.js, Query, UI, aplicações e features |
| Regra de domínio           | Core e tipos do seu domínio                                 | DOM, hooks, transporte, Next.js e cache          |
| Caso de uso / consulta     | Regras, core e contratos de integração                      | Componentes e stores de UI                       |
| Adaptador HTTP             | Core, schemas e contratos da API                            | JSX e store de interface                         |
| Adaptador React/Next/Query | Contratos da funcionalidade e bibliotecas do runtime        | Internos de outra funcionalidade                 |
| UI genérica                | Tokens, primitivas e contratos visuais                      | Domínios de aplicação, HTTP e autenticação       |
| Aplicação                  | APIs públicas dos módulos e composição dos seus adaptadores | Internos de outra aplicação                      |

O ponto de composição da aplicação liga casos de uso a adaptadores concretos. O código que representa a regra depende do contrato da integração; não precisa importar a implementação HTTP.

Uma funcionalidade só usa outra por seu contrato público. Não importar caminhos internos para contornar esse contrato, criar dependências circulares ou um diretório genérico que acumule qualquer responsabilidade. Um módulo de domínio compartilhado pode existir se houver consumidores e semântica comum demonstrados; a restrição de domínio zero se aplica à UI genérica, não a todo pacote do monorepo.

DTO externo é convertido na fronteira adequada. Quando a apresentação precisar de uma forma diferente, usar um modelo de apresentação tipado. Não criar mapeamento sem transformação útil. Tipos gerados descrevem o contrato estático; entradas externas também precisam de validação em runtime.

### Critério de extração

Extrair quando uma parte possui regra, interação, contrato, ciclo de dados ou teste próprio; quando pode mudar sem alterar o restante; ou quando mistura interesses independentes. Funções privadas relacionadas podem permanecer juntas. Ter poucos arquivos ou um arquivo por função não é meta.

## Alternativas consideradas

- Separar todo o projeto em grandes pastas globais de components, hooks e services: dificulta identificar a capacidade dona do código.
- Mover toda a lógica de cada tela para um hook: melhora o JSX, mas preserva o acoplamento entre regra, I/O e estado.
- Aplicar uma estrutura de Clean Architecture completa a toda função: adiciona navegação e indireção onde não há complexidade que as justifique.

## Consequências

Mudanças têm fronteiras menores e regras podem ser testadas sem browser. É necessário definir exportações públicas e revisar o grafo de dependências. A primeira funcionalidade deverá mostrar o nível adequado de separação antes de replicá-lo nas demais capacidades.

## Verificação de aderência

| Regra                            | Evidência                                                             | Estado         |
| -------------------------------- | --------------------------------------------------------------------- | -------------- |
| Imports seguem o grafo permitido | Checagem de dependências, sem ciclos e sem imports internos           | Planejado      |
| Regra independe do framework     | Teste da função sem render, servidor Next ou rede                     | Planejado      |
| Caso de uso depende de contrato  | Teste com adaptador controlado                                        | Planejado      |
| Responsabilidade única           | Revisão: explicar cada unidade em uma frase e seus motivos de mudança | Revisão manual |

Nenhuma ferramenta de análise estática comprova sozinha responsabilidade única. O [ADR-0010](0010-governanca.md) separa verificações automáticas de revisão.
