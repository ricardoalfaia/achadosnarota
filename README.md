# golink-next-scaffold — template de monorepo SaaS

Base para produtos SaaS multi-tenant da GoLink, extraída do Papelivo: Next.js 16 + React 19 + Tailwind 4, pnpm + Turborepo, Better Auth com organização/tenant e RLS no Postgres, design system com Storybook, documentação de negócio com Fumadocs, princípios de arquitetura (P01–P12) e ADRs. O nome `meuproduto` é um marcador: troque-o ao criar o projeto.

## Usar este template

1. No GitHub, **Use this template → Create a new repository**, e clone o repositório novo.
2. Renomeie o projeto (escopo dos pacotes, app, cookies, variáveis, papéis do banco e containers):

   ```sh
   node scripts/novo-projeto.mjs --escopo acme --nome "Acme" --simular   # confira antes
   node scripts/novo-projeto.mjs --escopo acme --nome "Acme"
   rm pnpm-lock.yaml.antigo
   pnpm install && pnpm format && pnpm check
   ```

3. Escolha uma faixa de portas própria (aqui é 4400–4499) para não colidir com outros sistemas da máquina: `package.json` dos apps, `playwright.config.ts`, `docker-compose.yml`, `.env.example` e a tabela de portas abaixo.
4. Identidade visual: paleta na camada 1 de `packages/ui/src/styles/tokens.css`, logo e emblema em `apps/*/public`, favicon em `apps/*/src/app/favicon.ico` ([ADR-0022](docs/adr/0022-identidade-visual-meuproduto.md)). Os testes de contraste de `tokens.test.ts` dizem se a paleta nova atinge AA.
5. Produto: preencha os esqueletos de `docs/produto` (visão, arquitetura, domínio, segurança, LGPD, portões de entrega) e ajuste a navegação em `apps/*-web/src/shared/casca/navegacao.ts`. O painel inicial e os itens de menu vêm do Papelivo como exemplo, com dados sintéticos.
6. Leia [AGENTS.md](AGENTS.md), [os princípios](docs/arquitetura.md) e o [ADR-0023](docs/adr/0023-scaffold-como-template.md) antes de mudar a estrutura.

## Estrutura

```text
apps/
  meuproduto-web/            # app Next.js do produto
  design-system/           # Storybook de tokens e componentes
  docs/                    # documentação de negócio (Fumadocs)
packages/
  core/                    # Result/Error canônico
  ui/                      # componentes, calendário, hooks e tokens
  data-boundary/           # Suspense, erro e recuperação
  db/                      # schema, RLS, migrações e seed (ADR-0020)
  typescript-config/       # presets de tipagem
  eslint-config/           # regras e fronteiras
docs/
  produto/                 # documentos e ADRs de produto
  adr/                     # ADRs de frontend
docker-compose.yml         # Postgres e storage S3 para desenvolvimento
```

Next.js 16.3, React 19.2, TypeScript, Tailwind 4, pnpm 11.25, Node 24 e Turborepo. O lockfile fixa a instalação.

```sh
pnpm install --frozen-lockfile
pnpm infra:up     # Postgres (4450) e storage S3 (4451) no Docker
pnpm db:migrate   # aplica as migrações do @meuproduto/db
pnpm db:seed      # dados sintéticos: 2 tenants, 3 usuários, 3 clientes por tenant
pnpm dev:web      # meuproduto-web em http://localhost:4400
pnpm storybook    # vitrine do design system em http://localhost:4460
pnpm dev:docs     # documentação de negócio em http://localhost:4430
pnpm check
pnpm test:e2e
pnpm infra:down   # para os serviços; os volumes continuam
pnpm infra:reset  # apaga os volumes e recria do zero
```

`pnpm check` verifica formatação, arquitetura, ambiente, lint, tipos, testes e build. `pnpm test:e2e` faz o build e roda o Playwright em uma porta de teste separada; precisa do Postgres no ar (`pnpm infra:up`), porque o próprio E2E roda as migrações e o seed e prepara as contas do teste. Se o navegador ainda não estiver instalado, use `pnpm --filter meuproduto-web exec playwright install chromium`.

Identidade e sessão: Better Auth no próprio app, sobre o Postgres, com tenants isolados por RLS ([ADR-0020](docs/adr/0020-autenticacao-e-sessao.md)). Para desenvolver, copie `apps/meuproduto-web/.env.example` para `apps/meuproduto-web/.env.local` e preencha `BETTER_AUTH_SECRET` ([ADR-0013](docs/adr/0013-ambientes-e-configuracao.md)). O app conecta como `meuproduto_app` (sujeito a RLS); migrações e seed usam o dono das tabelas, com os padrões de desenvolvimento de `scripts/load-env.mjs`.

Usuários do seed, todos com a senha `meuproduto123`: `admin@meuproduto.local` (owner do `escritorio-demo`; configura o autenticador no primeiro acesso, porque o MFA é obrigatório para owner e admin), `operador@meuproduto.local` (member do `escritorio-demo`) e `outro@meuproduto.local` (owner do `escritorio-teste`). Sem `RESEND_API_KEY`, no ambiente local o e-mail de redefinição de senha sai no console do servidor.

Dados reais de clientes nunca entram no ambiente de desenvolvimento nem nos testes: só fixtures sintéticas.

## Portas

O monorepo usa a faixa 4400 a 4499 para não colidir com outros sistemas da máquina, que usam 3300 a 3399. Cada aplicação tem uma dezena; a unidade 1 é o servidor do E2E, para os testes rodarem com o `dev` aberto.

| Porta       | Uso                                               |
| ----------- | ------------------------------------------------- |
| 4400        | meuproduto-web (`dev` e `start`)                  |
| 4401        | E2E do meuproduto-web                             |
| 4430 e 4431 | Documentação de negócio e seu E2E                 |
| 4450        | PostgreSQL de desenvolvimento (Docker)            |
| 4451        | Storage S3 de desenvolvimento, SeaweedFS (Docker) |
| 4460        | Storybook do design system                        |

## Documentos

- [Produto](docs/produto/README.md): escopo, segurança, LGPD, plano de entrega, portões G0–G5 e ADRs de produto.
- [Princípios de arquitetura do frontend](docs/arquitetura.md).
- [Registro de ADRs de frontend](docs/adr/README.md).
- [Origem da base](docs/origem-da-base.md): de onde veio este monorepo e o que mudou.
- [Instruções dos colaboradores e agentes](AGENTS.md).

## Estado

A fundação foi copiada do monorepo Phibra.Web.Next, sem histórico git, e adaptada ao Meuproduto: escopo `@meuproduto`, identidade visual, casca, portas, CI no GitHub Actions e infraestrutura local. Identidade e multi-tenant com Better Auth, a casca do mockup e a identidade visual estão em implementação. As verificações herdadas da base ainda precisam ser executadas neste repositório; o que já foi executado aqui está registrado no ADR correspondente. Os ADRs continuam propostos para revisão, sem aprovação registrada.
