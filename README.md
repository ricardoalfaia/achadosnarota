# Achados na Rota

**Descubra lugares que valem a pena.** PWA de descoberta de restaurantes, hospedagens e experiências, com curadoria editorial independente e passaporte anual de benefícios ([produto](docs/produto/README.md)). Monorepo derivado do template GoLink (`golink-next-scaffold`): Next.js 16 + React 19.2 + Tailwind 4, pnpm + Turborepo, Better Auth, PostgreSQL com Drizzle e RLS, TanStack Query, design system com Storybook, documentação de negócio com Fumadocs, princípios de arquitetura (P01–P12) e ADRs.

## Estrutura

```text
apps/
  achados-web/             # PWA do assinante (Next.js)
  design-system/           # Storybook de tokens e componentes
  docs/                    # documentação de negócio (Fumadocs)
packages/
  core/                    # Result/Error canônico
  ui/                      # componentes, hooks e tokens da marca
  data-boundary/           # Suspense, erro e recuperação
  db/                      # schema, RLS, migrações e seed (ids em ULID)
  typescript-config/       # presets de tipagem
  eslint-config/           # regras e fronteiras
docs/
  produto/                 # documentos, ADRs de produto e marca
  adr/                     # ADRs de frontend
docker-compose.yml         # Postgres e storage S3 para desenvolvimento
```

Next.js 16.3, React 19.2, TypeScript, Tailwind 4, pnpm 11.25, Node 24 e Turborepo. O lockfile fixa a instalação.

```sh
pnpm install --frozen-lockfile
pnpm infra:up     # Postgres (4550) e storage S3 (4551) no Docker
pnpm db:migrate   # aplica as migrações do @achados/db
pnpm db:seed      # dados sintéticos: 5 cidades, 6 categorias, 6 lugares, 2 pessoas
pnpm dev:web      # achados-web em http://localhost:4500
pnpm storybook    # vitrine do design system em http://localhost:4560
pnpm dev:docs     # documentação de negócio em http://localhost:4530
pnpm check
pnpm test:e2e
pnpm infra:down   # para os serviços; os volumes continuam
pnpm infra:reset  # apaga os volumes e recria do zero
```

`pnpm check` verifica formatação, arquitetura, ambiente, lint, tipos, testes e build. `pnpm test:e2e` faz o build e roda o Playwright num banco próprio e numa porta de teste separada; precisa do Postgres no ar (`pnpm infra:up`). Se o navegador ainda não estiver instalado: `pnpm --filter achados-web exec playwright install chromium`.

Para desenvolver, copie `apps/achados-web/.env.example` para `apps/achados-web/.env.local` e preencha `BETTER_AUTH_SECRET` ([ADR-0013](docs/adr/0013-ambientes-e-configuracao.md)). O app conecta como `achados_app` (sujeito a RLS); migrações e seed usam o dono das tabelas, com os padrões de desenvolvimento de `scripts/load-env.mjs`. Contas do seed, senha `achados123`: `assinante@achados.local` (passaporte ativo de fixture) e `visitante@achados.local`.

**Banco:** Postgres 18 no Docker em desenvolvimento; **Neon** em produção ([ADR-0013](docs/adr/0013-ambientes-e-configuracao.md), registro de 2026-10-17).

Dados reais de pessoas ou parceiros nunca entram no ambiente de desenvolvimento nem nos testes: só fixtures sintéticas. Os lugares, notas e ofertas do seed são inventados.

## Portas

A faixa 4500 a 4599 não colide com outros sistemas da máquina (Papelivo em 4450, outros em 3300 a 3399). Cada aplicação tem uma dezena; a unidade 1 é o servidor do E2E.

| Porta       | Uso                                               |
| ----------- | ------------------------------------------------- |
| 4500        | achados-web (`dev` e `start`)                     |
| 4501        | E2E do achados-web                                |
| 4530 e 4531 | Documentação de negócio e seu E2E                 |
| 4550        | PostgreSQL de desenvolvimento (Docker)            |
| 4551        | Storage S3 de desenvolvimento, SeaweedFS (Docker) |
| 4560        | Storybook do design system                        |

## Documentos

- [Produto](docs/produto/README.md): visão, princípios, fases F0–F5, segurança, LGPD, API e ADRs de produto.
- [Princípios de arquitetura do frontend](docs/arquitetura.md).
- [Registro de ADRs de frontend](docs/adr/README.md), em especial o [ADR-0025](docs/adr/0025-app-pwa-do-assinante.md) (app PWA).
- [Origem da base](docs/origem-da-base.md).
- [Instruções dos colaboradores e agentes](AGENTS.md).

## Estado

Fase F1 em andamento: fundação renomeada e adaptada, identidade visual no design system, banco com catálogo, curadoria publicada, ofertas, favoritos e assinatura (leitura), e o PWA do assinante fiel ao protótipo. Fora desta etapa: painel administrativo e do parceiro, checkout (F3), emissão e validação de resgate (F4). Os ADRs continuam propostos, sem aprovação registrada.
