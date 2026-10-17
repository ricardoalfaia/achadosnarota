# Origem da base

**Data:** 16/10/2026 · **Origem:** monorepo Phibra.Web.Next (somente leitura; não foi alterado) · **Estado:** cópia feita e adaptada; verificações neste repositório a confirmar.

## De onde veio

O monorepo do Achados na Rota foi criado em 16/10/2026 copiando a base Phibra.Web.Next, um frontend Next.js feito para um cliente da GoLink. O responsável pediu a mesma arquitetura, os mesmos princípios (P01–P12), o mesmo formato de ADR e o mesmo ferramental, porque esse é o padrão que ele adota.

**O histórico git não foi trazido, de propósito.** O histórico da origem contém código, nomes e regras do domínio do cliente. Começar sem ele garante que nada disso fique acessível no repositório do Achados na Rota, nem em commits antigos. A consequência é que não há rastro, aqui, de quando e por que cada linha da base foi escrita; o raciocínio que importa está nos ADRs.

As evidências de execução registradas nos ADRs da origem (testes que passaram, medições, conferências visuais) **não foram transferidas**. Nos ADRs do Achados na Rota elas aparecem como "Pendente neste repositório" até serem refeitas aqui.

## O que foi reaproveitado

| O quê                   | Onde                                                   | Observação                                                                                                                               |
| ----------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Result/Error            | `packages/core`                                        | Contrato sem mudança ([ADR-0004](adr/0004-result-error.md)); a chave global do reporter ainda usa o identificador de outro produto.      |
| DataBoundary            | `packages/data-boundary`                               | Com a correção do retry e os testes de regressão ([ADR-0005](adr/0005-data-boundary.md)).                                                |
| Design system           | `packages/ui`, `apps/design-system`                    | Campos, botões, diálogos, abas, tabela, hooks e tokens semânticos; paleta e fonte trocadas.                                              |
| Configurações           | `packages/typescript-config`, `packages/eslint-config` | Presets e fronteiras.                                                                                                                    |
| Scripts da raiz         | `scripts/`                                             | Verificação de arquitetura e de ambiente; carregador de `.env.homolog`.                                                                  |
| Formatação e hooks      | Raiz                                                   | Prettier, lint-staged, Husky e commitlint ([ADR-0012](adr/0012-formatacao-e-hooks.md)).                                                  |
| Padrões do app          | `apps/achados-web/src/shared`                          | Preferências em cookie, idiomas com next-intl, configuração por ambiente validada, divisão `app`/`features`/`shared`.                    |
| Sessão no servidor      | `apps/achados-web`                                     | O princípio (sessão lida no servidor, proxy só faz triagem) continua; o mecanismo mudou ([ADR-0020](adr/0020-autenticacao-e-sessao.md)). |
| Documentação de negócio | `apps/docs`                                            | Fumadocs com idiomas no endereço e busca local ([ADR-0019](adr/0019-documentacao.md)).                                                   |
| Princípios e ADRs       | `docs/arquitetura.md`, `docs/adr/`                     | Mesma estrutura e rigor, adaptados ao Achados na Rota.                                                                                   |

## O que foi removido

- Telas e regras do domínio do cliente: cadastro de fundos, data do pregão, módulo de rebate, seletor de filiais e o catálogo de cadastros com o mega menu.
- A integração com a API de identidade do cliente (Phina), o "vigia de banco" que detectava troca de base de dados e o documento de segurança daquela API.
- Os locais reservados para projetos que existiam só na origem (um HelpDesk e um app CRA legado) e os ADRs de migração gradual.
- O pipeline do Azure DevOps (`azure-pipelines.yml`), substituído por GitHub Actions.
- Logotipos, textos institucionais e dados provisórios da origem.

Algumas remoções no código do app estão em andamento enquanto este documento é escrito; a busca por nomes da origem no repositório (`grep -ri phibra`, `grep -ri phina`) é a conferência final.

## O que mudou

| Tema                 | Na origem                                   | No Achados na Rota                                                                                                           |
| -------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Escopo dos pacotes   | Escopo do cliente                           | `@achados/*`                                                                                                                 |
| Prefixo dos tokens   | Prefixo do cliente                          | `--ar-`                                                                                                                      |
| Cores e fonte        | Paleta e fonte do cliente                   | Paleta Achados na Rota e Inter ([ADR-0022](adr/0022-identidade-visual-achados.md))                                           |
| Casca                | Menu escuro com grupos, mega menu           | Mockup Achados na Rota: menu claro com itens planos, busca, notificações e avatar ([ADR-0018](adr/0018-casca-do-sistema.md)) |
| Identidade e sessão  | API externa, cookie JWE próprio, pré-sessão | Better Auth no app, organização e tenant próprios, RLS ([ADR-0020](adr/0020-autenticacao-e-sessao.md))                       |
| Portas               | Faixa 3300–3399                             | Faixa 4500–4599 ([README](../README.md))                                                                                     |
| CI                   | Azure Pipelines                             | GitHub Actions ([ADR-0014](adr/0014-ferramental-do-monorepo.md))                                                             |
| Infraestrutura local | Não havia                                   | Postgres e SeaweedFS (S3) em Docker ([ADR-0013](adr/0013-ambientes-e-configuracao.md))                                       |
| Documentação técnica | Wiki do Azure DevOps sobre `docs/`          | `docs/` lida no próprio repositório ([ADR-0019](adr/0019-documentacao.md))                                                   |

## Conferência

- Nomes da origem: buscar `phibra` e `phina` (sem diferenciar maiúsculas) no repositório. Este documento e uma linha nos princípios citam a origem de propósito.
- Verificações: `pnpm check` e `pnpm test:e2e` neste repositório, com os resultados registrados nos ADRs.
