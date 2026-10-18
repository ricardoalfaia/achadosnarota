# Registro de decisões de arquitetura do frontend

**Data inicial:** 16/10/2026. Cada ADR registra uma decisão com contexto, alternativas, consequências e evidências de aplicação.

## Dois registros de ADR

| Registro                                    | Onde                | Numeração             | Assunto                                                                     |
| ------------------------------------------- | ------------------- | --------------------- | --------------------------------------------------------------------------- |
| [ADRs de produto](../produto/adr/README.md) | `docs/produto/adr/` | `ADR-001` a `ADR-010` | O que o Achados na Rota é: curadoria, benefícios, resgate, pagamentos, LGPD |
| ADRs de frontend (este índice)              | `docs/adr/`         | `0001` em diante      | Como o frontend e o monorepo são construídos                                |

Os documentos de produto são a fonte do produto. Um ADR de frontend que depende de uma decisão de produto cita o ADR de produto e não a redefine. Dependências principais:

| ADR de produto                                                      | ADRs de frontend que dependem dele                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [ADR-001](../produto/adr/ADR-001.md) monólito modular e Next.js PWA | [0025](0025-app-pwa-do-assinante.md)                                           |
| [ADR-002](../produto/adr/ADR-002.md) PostgreSQL e Drizzle           | [0013](0013-ambientes-e-configuracao.md), [0024](0024-identificadores-ulid.md) |
| [ADR-003](../produto/adr/ADR-003.md) identidade e RBAC              | [0020](0020-autenticacao-e-sessao.md)                                          |
| [ADR-004](../produto/adr/ADR-004.md) separação editorial-comercial  | [0025](0025-app-pwa-do-assinante.md)                                           |
| [ADR-005](../produto/adr/ADR-005.md) resgate transacional           | [0025](0025-app-pwa-do-assinante.md) (resgate pendente na F4)                  |
| [ADR-008](../produto/adr/ADR-008.md) SEO e publicação editorial     | [0006](0006-estado-http-e-cache.md), [0025](0025-app-pwa-do-assinante.md)      |
| [ADR-010](../produto/adr/ADR-010.md) auditoria e observabilidade    | [0004](0004-result-error.md), [0010](0010-governanca.md)                       |

## Estado do registro

Os ADRs abaixo estão **Propostos** para revisão. A maior parte veio da base de origem e foi adaptada ao Achados na Rota ([origem da base](../origem-da-base.md)). As evidências registradas na origem não foram transferidas: onde o ADR diz "Pendente neste repositório", a verificação existia lá e ainda não foi executada aqui. Implementação e aceitação formal de uma decisão são estados distintos.

| ADR                                       | Decisão                                                           | Estado                                                                     |
| ----------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [0001](0001-modularidade.md)              | Módulos coesos, responsabilidade única e contratos públicos       | Proposto                                                                   |
| [0002](0002-react19-e-nextjs.md)          | React 19 e Next.js: servidor como padrão, cliente por necessidade | Proposto                                                                   |
| [0003](0003-componentes-explicitos.md)    | Componentes explícitos e composição de partes                     | Proposto                                                                   |
| [0004](0004-result-error.md)              | Result/Error canônico e adaptadores para frameworks               | Proposto; contrato herdado da base                                         |
| [0005](0005-data-boundary.md)             | DataBoundary, Suspense e recuperação por região                   | Proposto; componente herdado da base                                       |
| [0006](0006-estado-http-e-cache.md)       | Estado HTTP, Actions, Query e políticas de cache                  | Proposto                                                                   |
| [0007](0007-monorepo-e-autonomia.md)      | Monorepo e autonomia das aplicações                               | Proposto                                                                   |
| [0008](0008-design-system.md)             | Tailwind, tokens e design system acessível                        | Proposto; paleta trocada (0022)                                            |
| [0009](0009-testes.md)                    | Testes rápidos, integração e E2E com Playwright                   | Proposto                                                                   |
| [0010](0010-governanca.md)                | ADRs, regras automatizadas e revisão de aderência                 | Proposto                                                                   |
| [0011](0011-estrutura-monorepo.md)        | Estrutura apps/packages, pnpm e Turborepo                         | Proposto; base copiada, verificação pendente                               |
| [0012](0012-formatacao-e-hooks.md)        | Prettier, lint-staged e Husky instalados uma vez na raiz          | Proposto; base copiada, verificação pendente                               |
| [0013](0013-ambientes-e-configuracao.md)  | Ambientes, configuração do app e infraestrutura local             | Proposto; base copiada, infraestrutura criada                              |
| [0014](0014-ferramental-do-monorepo.md)   | Catálogo de versões, testes por projeto, tipos rígidos e CI       | Proposto; CI escrita, nunca executada                                      |
| [0015](0015-tabela-de-dados.md)           | Tabela de dados própria sobre TanStack Table e Virtual            | Proposto; componente herdado da base                                       |
| [0016](0016-recursos-do-react-19.md)      | Recursos do React 19.2: quais usar, onde e quando não usar        | Proposto                                                                   |
| [0017](0017-idiomas-e-preferencias.md)    | Idiomas com next-intl e preferências do usuário                   | Proposto; mecanismo herdado da base                                        |
| [0018](0018-casca-do-sistema.md)          | Casca do sistema (painel SaaS da base)                            | Substituída no app pelo ADR-0025; volta a valer para a área administrativa |
| [0019](0019-documentacao.md)              | Documentação técnica em `docs/` e de negócio com Fumadocs         | Proposto; app adaptado                                                     |
| [0020](0020-autenticacao-e-sessao.md)     | Autenticação e sessão com Better Auth                             | Proposto; adaptado ao app do assinante (registro de 2026-10-17)            |
| [0021](0021-paginas-de-cadastro.md)       | Páginas de cadastro: listagem e formulário em seções              | Proposto; sem implementação                                                |
| [0022](0022-identidade-visual-achados.md) | Identidade visual Achados na Rota no design system                | Proposto; implementado                                                     |
| [0023](0023-scaffold-como-template.md)    | Scaffold do monorepo como template no GitHub                      | Proposto; não implementado                                                 |
| [0024](0024-identificadores-ulid.md)      | Identificadores de linha em ULID                                  | Proposto; implementado                                                     |
| [0025](0025-app-pwa-do-assinante.md)      | App PWA do assinante: rotas, casca, dados e PWA                   | Proposto; implementado                                                     |
| [0026](0026-app-administrativo.md)        | App administrativo: casca, telas de cadastro e dados provisórios  | Proposto; fase visual implementada, sem banco e sem login                  |
| [0027](0027-foto-do-perfil-no-r2.md)      | Foto do perfil: ajuste no navegador, regravação no servidor e R2  | Proposto; implementado no app do assinante                                 |
| [0028](0028-assinantes-e-cortesia.md)     | Assinantes no painel e cortesia de 7 dias                         | Proposto; implementado, migration 0006 só no banco local                   |

## Ciclo de uma decisão

1. Criar um ADR a partir do [template](template.md), com o próximo número livre.
2. Registrar o problema, as opções, a recomendação e as consequências reais.
3. Revisar com o responsável pela arquitetura. Registrar nome e data ao aceitar; evidência de implementação é registrada depois, quando existir.
4. Implementar código, testes e verificações de aderência no mesmo trabalho autorizado.
5. Para mudar uma decisão aceita, escrever outro ADR e marcar o anterior como Substituído, com ligação entre ambos. Não reescrever o histórico como se a decisão nunca tivesse existido.

Estados: **Proposto**, **Aceito**, **Rejeitado**, **Substituído**. Uma decisão proposta pode conter uma recomendação completa sem antecipar sua aceitação. Os ADRs de produto usam seus próprios estados (`Proposta`, `Aceita após validação`, `Substituída`).

## Quando criar um ADR

Mudanças em fronteiras de módulos, contratos públicos, estratégia de dados ou erros, dependências arquiteturais, armazenamento, segurança, compartilhamento entre aplicações, testes de base ou deploy precisam de ADR. Uma exceção a uma decisão aceita também precisa de registro.

Novo componente, ajuste de texto, correção local ou função que já segue os contratos existentes não precisa de um ADR próprio. Não há regra de pedir uma decisão arquitetural para todo detalhe de implementação.
