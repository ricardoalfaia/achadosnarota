# ADR-0014 — Ferramental do monorepo: versões, testes, tipos e CI

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípios relacionados:** P09, P11, P12  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; a configuração veio da base de origem; a CI foi reescrita para GitHub Actions.

## Contexto

O [ADR-0011](0011-estrutura-monorepo.md) definiu apps/packages, pnpm e Turborepo. O [ADR-0012](0012-formatacao-e-hooks.md) cobriu formatação e hooks, e o [ADR-0013](0013-ambientes-e-configuracao.md) cobriu ambientes. Na base de origem, estas decisões de ferramental apareceram durante a configuração inicial e foram registradas aqui; o Achados na Rota as herda:

- As mesmas versões de `react`, `typescript`, `eslint`, `vitest` e outras estavam repetidas em até cinco `package.json`; `@types/node` divergia entre `^20` e `^24`.
- `engines` exigia Node 24, mas nada informava a versão a gerenciadores de Node e à CI.
- `pnpm test:e2e` chamava o Playwright sem garantir um build; o teste sobe o app com `next start`.
- O app não tinha testes unitários, apenas E2E.
- O preset de TypeScript tinha só `strict`; o [ADR-0010](0010-governanca.md) deixou opções adicionais para avaliação.
- Sem pipeline, toda verificação dependeria de alguém rodar `pnpm check` na própria máquina. A base usava Azure Pipelines; o Achados na Rota fica no GitHub.

## Decisão proposta

### Versões em um catálogo

Dependência usada por mais de um projeto tem a versão declarada uma vez no `catalog` de [pnpm-workspace.yaml](../../pnpm-workspace.yaml), e cada projeto a referencia com `"catalog:"`. Hoje o catálogo contém `react`, `react-dom`, `@tanstack/react-query`, `zod`, `typescript`, `eslint`, `@types/node`, `@types/react`, `@types/react-dom`, `vite` e `vitest`.

- A dependência continua declarada em cada projeto que a usa; só a versão é centralizada.
- `peerDependencies` mantêm faixas explícitas (`^19.2.8`, `^4.6.5`): apontá-las para o catálogo as tornaria versões exatas.
- Dependência de um único projeto fica no próprio `package.json`.

### Versão do Node

[.nvmrc](../../.nvmrc) fixa a linha 24, coerente com `engines` e com `@types/node` `^24`. O pipeline lê a versão desse arquivo.

### Testes por projeto, coordenados pelo Turborepo

- Cada projeto com regra testável tem seu Vitest e seu script `test`; a raiz só chama `turbo run test`. O cache é por projeto, e cada um escolhe o ambiente (Node ou jsdom) sem carregar a configuração dos outros.
- O app tem Vitest para as regras de `src/shared` e das capacidades em `src/features`.
- `test:e2e` é uma task do Turborepo com `dependsOn: ["build"]`. `pnpm test:e2e` na raiz constrói antes de testar.
- A vitrine do design system roda suas histórias como testes em Chromium, pelo modo navegador do Vitest ([ADR-0008](0008-design-system.md)). Por isso `pnpm test` e o `pre-push` exigem o Chromium do Playwright instalado.
- Portas locais ficam na faixa 4500 a 4599, para não colidir com outros sistemas da máquina (que usam 3300 a 3399). Cada aplicação tem uma dezena; a unidade 1 é o servidor do E2E. A tabela está no [README](../../README.md).
- No Playwright, quando `CI` está definido, há duas novas tentativas e relatório HTML; localmente, nenhuma nova tentativa.

Não há modo `projects` do Vitest na raiz: ele roda tudo em um processo e perde o cache por projeto.

### Tipos mais rígidos no preset base

`noUncheckedIndexedAccess` está ligado em [base.json](../../packages/typescript-config/base.json): acesso por índice devolve `T | undefined`. Os ajustes de adoção já vieram no código da base. O `tsconfig.json` do app declara apenas `paths`; o restante vem do preset.

### Sequência de verificação

`pnpm check` executa, nesta ordem: `format:check`, `check:architecture`, `check:env` e `turbo run lint typecheck test build`. É o comando único para validar o repositório antes de enviar.

[.github/workflows/ci.yml](../../.github/workflows/ci.yml) repete a sequência em máquina limpa, em todo push na `main` e em todo pull request: Node da `.nvmrc`, pnpm pela versão do `packageManager`, `pnpm install --frozen-lockfile`, instalação do Chromium, `pnpm check` e `pnpm test:e2e`, publicando os relatórios do Playwright como artefato. A barreira de PR depende de exigir esse workflow na proteção da branch `main` no GitHub.

## Alternativas consideradas

- **Versões repetidas em cada projeto:** não exige recurso do pnpm, mas cada atualização passa por vários arquivos e as versões divergem com o tempo, como já ocorria com `@types/node`.
- **Dependências comuns só na raiz:** um lugar único, porém os projetos passam a usar pacotes que não declaram, o que o `check:architecture` e o pnpm estrito existem para impedir.
- **Vitest único na raiz com `projects`:** um relatório e uma cobertura unificados, sem cache por projeto. Pode ser acrescentado depois só para cobertura.
- **Build do E2E por script (`pnpm build && playwright test`):** simples, mas refaz o build mesmo sem mudança; a task do Turborepo reaproveita o cache.
- **Ligar todas as opções rígidas de uma vez** (`exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`): mais garantias, com atrito alto nas tipagens de bibliotecas. Ficam para avaliação caso a caso.
- **Testes no `pre-commit`:** impede commit quebrado, mas torna o commit lento e incentiva `--no-verify`. A verificação fica no `pre-push`, só do que foi afetado ([ADR-0012](0012-formatacao-e-hooks.md)), e a garantia fica na CI.

## Consequências

Atualizar uma dependência comum é uma linha no catálogo. `pnpm check` e o pipeline executam os mesmos passos. O E2E sempre roda contra um build atual.

Custos e limites:

- `catalog:` é recurso do pnpm; os `package.json` deixam de ser instaláveis com npm ou yarn.
- Um backend ou worker com versões diferentes declara suas dependências fora do catálogo ou em um catálogo nomeado.
- `noUncheckedIndexedAccess` exige tratar `undefined` em acessos por índice, inclusive onde o índice é sabidamente válido.
- A CI consome minutos do GitHub Actions a cada execução, e o E2E instala o Chromium toda vez.

## Verificação de aderência

| Regra                                    | Evidência esperada                                                   | Estado                     |
| ---------------------------------------- | -------------------------------------------------------------------- | -------------------------- |
| Versão comum declarada uma vez           | `catalog`; `pnpm install --frozen-lockfile` sem alteração            | Pendente neste repositório |
| Testes por projeto passam                | `pnpm test` em `core`, `ui`, `data-boundary`, `achados-web` e `docs` | Pendente neste repositório |
| E2E roda contra build atual              | `pnpm test:e2e`: build seguido dos testes Chromium                   | Pendente neste repositório |
| Preset rígido sem erros                  | `turbo run typecheck` com `noUncheckedIndexedAccess`                 | Pendente neste repositório |
| Sequência única de verificação           | `pnpm check`: tasks do Turborepo e os três checks da raiz            | Pendente neste repositório |
| Pipeline executa a sequência             | Execução real do workflow e proteção da branch `main`                | Escrito; nunca executado   |
| Nenhum projeto repete versão do catálogo | Regra no `check:architecture`                                        | Planejado                  |

## Pendências e exceções

- O repositório ainda não tem commits nem remoto. Faltam criar o repositório no GitHub, o primeiro push, a primeira execução da CI e a proteção da branch `main`.
- Atualização automática de dependências (Dependabot ou Renovate), agora que a hospedagem é o GitHub.
- Cobertura de testes não é medida.

Nenhuma exceção registrada.

## Referências

- [ADR-0009](0009-testes.md) — estratégia de testes
- [ADR-0010](0010-governanca.md) — barreiras verificáveis
- [ADR-0011](0011-estrutura-monorepo.md) — estrutura do monorepo
- [ADR-0012](0012-formatacao-e-hooks.md) — formatação e hooks
- [ADR-0013](0013-ambientes-e-configuracao.md) — ambientes e configuração
- [pnpm: catalogs](https://pnpm.io/catalogs)
- [Turborepo: configuração de tasks](https://turborepo.dev/docs/reference/configuration)
- [TypeScript: noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess)
