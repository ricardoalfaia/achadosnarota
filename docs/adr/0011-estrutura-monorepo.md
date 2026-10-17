# ADR-0011 — Estrutura do monorepo com pnpm e Turborepo

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípios:** P01, P02, P03, P09, P12  
**Aceitação:** detalhes estruturais propostos para revisão; a estrutura veio da base de origem e foi adaptada ao Achados na Rota por autorização do responsável.

## Contexto

O Achados na Rota nasce de uma base anterior, copiada sem histórico git ([origem da base](../origem-da-base.md)). A base já tinha a estrutura de apps/packages com pnpm e Turborepo e um app Next.js gerado por `npx create-next-app@latest`. Para o Achados na Rota, o responsável pediu a mesma estrutura, sem os projetos e o domínio do cliente de origem.

Os documentos de produto ([02 — Arquitetura](../produto/02-arquitetura.md)) tratam o restante da pilha (backend, banco, fila, worker) como hipótese a verificar. Este ADR cobre o que existe no repositório; a entrada de novos serviços segue o [ADR-0007](0007-monorepo-e-autonomia.md).

## Decisão proposta

Usar **pnpm workspace** para dependências e **Turborepo** para o grafo de tarefas e cache de resultados. Aplicações ficam em `apps`; bibliotecas compartilhadas ficam em `packages`, ambas na raiz do repositório. O Next.js é uma aplicação do monorepo, não o contêiner das demais.

```text
apps/
  achados-web/            # app Next.js do produto
    src/app/               # convenções de rota, layout e composição Next
    src/features/          # capacidades de negócio do Achados na Rota
    src/shared/            # composição comum apenas deste app (casca, sessão, config)
    e2e/                   # jornadas e smoke Playwright deste app
  design-system/           # Storybook de tokens e componentes (ADR-0008)
  docs/                    # documentação de negócio com Fumadocs (ADR-0019)
packages/
  core/                    # Result/Error sem framework
  ui/                      # componentes, calendário, hooks e tokens
  data-boundary/           # Suspense/ErrorBoundary e integração Query
  db/                      # schema Drizzle, migrações e seed (ADR-0020; em implementação)
  typescript-config/       # presets de tipagem
  eslint-config/           # regras comuns e restrições de fronteira
docs/
  produto/                 # documentos e ADRs de produto (fonte do produto)
  adr/                     # ADRs de frontend
scripts/                   # verificações da raiz
docker-compose.yml         # infraestrutura local de desenvolvimento (ADR-0013)
.github/workflows/ci.yml   # CI (ADR-0014)
```

Criar subpastas por comportamento real. `features/<capacidade>` pode separar `components`, `domain`, `application`, `infrastructure` e `queries` quando houver responsabilidades correspondentes. Não gerar todas essas pastas vazias para cada tela. O contrato público da capacidade fica em `index.ts`; outras capacidades não importam seus arquivos internos.

`shared` contém apenas composição comum do app e integrações locais com framework. Não é um segundo pacote UI nem um depósito de regras de negócio. Promover uma capacidade para `packages` exige semântica comum e consumidores compatíveis, conforme ADR-0007.

### Pacotes iniciais

| Pacote                          | Contrato                                                     | Limite                                                                                                         |
| ------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `@achados/core`                 | Result, AppError, combinadores e codec                       | Sem React, Next, Query, DOM ou domínio de uma aplicação.                                                       |
| `@achados/ui`                   | Componentes cliente, incluindo Select e SeletorDePeriodo     | Sem transporte, cache HTTP ou import de aplicação.                                                             |
| `@achados/ui/hooks`             | Hooks cliente explicitamente exportados                      | Não usar como API servidor.                                                                                    |
| `@achados/ui/dates`             | Funções puras de calendário                                  | Pode ser consumido no servidor sem importar o barrel cliente.                                                  |
| `@achados/ui/zod`               | Schemas dos valores dos campos                               | Sem regras específicas de negócio.                                                                             |
| `@achados/ui/estilos`           | Funções puras de classes (`estiloDoBotao`)                   | Pode ser chamado em Server Component.                                                                          |
| `@achados/ui/styles/tokens.css` | Tokens semânticos para Tailwind 4                            | Única fonte de cores, sombras e fontes (ADR-0008).                                                             |
| `@achados/data-boundary`        | DataBoundary e props                                         | Peer React/Query compatível; não instala provider global por convenção.                                        |
| `@achados/db`                   | Schema Drizzle, migrações SQL, seed sintético e `withTenant` | Server-only; nunca importado por código cliente. Em implementação ([ADR-0020](0020-autenticacao-e-sessao.md)). |
| `@achados/typescript-config`    | Presets base, React e Next                                   | Sem opções específicas de um app.                                                                              |
| `@achados/eslint-config`        | Regras comuns e fronteiras objetivas                         | Lint não comprova coesão nem garante segurança dos payloads.                                                   |

Não manter dois cores ou cópias de UI ativa. Não criar pacotes de auth, HTTP, domínio, Query ou storage sem seus contratos reais; `@achados/db` entra com o contrato do ADR-0020.

### Compilação e dependências

Começar com bibliotecas internas que exportam fontes TypeScript. Next transpila os pacotes declarados em `transpilePackages`; não há build independente fictício nas bibliotecas. Turbo não pode armazenar um build de pacote que não existe: o artefato compilado pertence ao app consumidor. Se um consumidor Node (backend, worker) precisar de JS previamente compilado, escolher e provar essa estratégia antes de conectá-lo. [Referências: pacotes internos no Turborepo](https://turborepo.dev/docs/core-concepts/internal-packages) e [transpilePackages no Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages).

Dependências internas usam `workspace:*`; imports usam exports públicos. Não criar aliases TypeScript para atravessar de um app ao src de outro pacote, nem exportar `./*` para contornar contratos. Cada pacote declara suas dependências. Peers explicitam compatibilidade de runtime; não aplicar overrides globais de React.

O app da base foi gerado com `npx create-next-app@latest` (TypeScript, App Router, src, Tailwind, ESLint e pnpm). A instalação usa o lockfile do workspace; a atualização é uma tarefa deliberada, não `latest` flutuante em cada build. pnpm está fixado na versão do workspace (11.25) e Node 24 é a base de ferramentas.

### Tailwind

O app configura PostCSS/Tailwind e inclui explicitamente as fontes de UI/DataBoundary via `@source`. Tokens compartilhados têm valores semânticos; cada app pode ajustar o que for próprio do seu público, como a escala de leitura da documentação ([ADR-0019](0019-documentacao.md)). [Referência: fontes compartilhadas no Tailwind](https://tailwindcss.com/docs/detecting-classes-in-source-files).

### Infraestrutura local

`docker-compose.yml` na raiz sobe o PostgreSQL e o armazenamento de objetos compatível com S3 que o backend vai usar, com containers e volumes exclusivos do Achados na Rota. Portas, credenciais de desenvolvimento e limites estão no [ADR-0013](0013-ambientes-e-configuracao.md). Não são tasks do Turborepo: sobem por `pnpm infra:up`, independentes do grafo de pacotes.

## Alternativas consideradas

- `packages` dentro de um app Next: torna outro app dependente da organização e do ciclo daquele app.
- Só scripts pnpm: suficiente para poucos comandos, mas exige coordenar manualmente o grafo e cache ao crescer.
- Nx: opção válida com mais recursos de projetos/plugins; Turborepo atende à coordenação com menos configuração.
- Compilar/publicar todos os pacotes agora: custo sem consumidor que exija essa distribuição.
- Criar dezenas de pacotes vazios: fragmenta a base antes de conhecer os contratos.

## Consequências

Os apps têm uma base compartilhada, preservando responsabilidade das features e autonomia de deploy. Configuração, lockfile e exports passam a ser parte do contrato do repositório. A entrada de backend e worker exige decidir compilação dos pacotes para Node.

## Verificação de aderência

| Regra                                                     | Evidência                                       | Estado                               |
| --------------------------------------------------------- | ----------------------------------------------- | ------------------------------------ |
| Dependências são declaradas e sem ciclos                  | `pnpm check:architecture`                       | Pendente neste repositório           |
| Contratos são tipados e lintados                          | `pnpm check`: lint e typecheck dos consumidores | Pendente neste repositório           |
| Core, calendário e recuperação preservam comportamento    | Testes permanentes de core/UI/DataBoundary      | Pendente neste repositório           |
| Next compila e usa os tokens/fontes de CSS compartilhados | Build e smoke Chromium contra produção          | Pendente neste repositório           |
| App de documentação segue o grafo e compila               | `pnpm --filter docs lint typecheck test build`  | Ver [ADR-0019](0019-documentacao.md) |
| CI executa as verificações                                | Execução real do workflow do GitHub Actions     | Escrito; nunca executado             |

As verificações acima existiam e passavam na base de origem; aqui elas só valem depois de executadas sobre o código adaptado. Este ADR registra a estrutura; os demais contratos continuam com seus próprios estados.
