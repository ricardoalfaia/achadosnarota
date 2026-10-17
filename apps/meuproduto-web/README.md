# Meuproduto Web

**Meuproduto — Seus documentos ganham vida.** O app web do Meuproduto: Next.js 16.3.8, React 19.2, TypeScript, App Router, Tailwind 4 e next-intl, no pnpm workspace e Turborepo da raiz. A visão do produto está em [docs/produto](../../docs/produto/README.md).

- `src/app`: convenções Next e composição de rotas. `(acesso)` são as telas públicas (login, recuperação e redefinição de senha); `t/[slug]` são as telas de um tenant, dentro da casca; `api/auth/[...all]` expõe o Better Auth.
- `src/features`: capacidades de negócio (`acesso`, `painel`, `notificacoes`, `notas-de-versao`), cada uma com `index.ts` público, `domain/` puro e testado e componentes.
- `src/shared`: composição comum do app (autenticação, sessão e tenant, banco, e-mail, casca, preferências, configuração).
- `e2e`: jornadas do navegador (Playwright), o preparo do banco do teste e os apoios (TOTP, caixa de e-mail).

## Rodar localmente

A identidade é o Better Auth no próprio app, sobre o Postgres local ([ADR-0020](../../docs/adr/0020-autenticacao-e-sessao.md)).

1. Copie `.env.example` para `.env.local` e preencha `BETTER_AUTH_SECRET` (mínimo de 32 caracteres; gere com `openssl rand -base64 48`). `DATABASE_URL` já aponta para o Postgres do Docker como `meuproduto_app`.
2. Na raiz: `pnpm infra:up`, `pnpm db:migrate` e `pnpm db:seed`.
3. `pnpm dev:web` na raiz, e abra <http://localhost:4400>.

Contas do seed (todas sintéticas, senha `meuproduto123`):

| E-mail                      | Vínculo                     | O que acontece                                             |
| --------------------------- | --------------------------- | ---------------------------------------------------------- |
| `admin@meuproduto.local`    | owner do `escritorio-demo`  | No primeiro acesso, configura o autenticador (obrigatório) |
| `operador@meuproduto.local` | member do `escritorio-demo` | Entra direto                                               |
| `outro@meuproduto.local`    | owner do `escritorio-teste` | Como o admin, no outro tenant                              |

Sem `RESEND_API_KEY`, no ambiente local o e-mail de redefinição de senha sai no console do servidor, com o link. O E2E desliga o 2FA dos owners do seed a cada rodada e usa outro `BETTER_AUTH_SECRET`: depois dele, o admin configura o autenticador de novo.

## Verificações

`pnpm check` na raiz verifica formatação, arquitetura, ambientes, lint, tipos, testes e build. Depois do build, com o Postgres no ar, `pnpm --filter meuproduto-web test:e2e` prepara o banco (migrações, seed e as contas próprias do E2E), sobe o build de produção na porta 4401 e roda o Playwright. Se faltar o navegador: `pnpm --filter meuproduto-web exec playwright install chromium`.

## Contratos

Componentes cliente vêm de `@meuproduto/ui`; funções puras de estilo, de `@meuproduto/ui/estilos`. Result vem de `@meuproduto/core`; DataBoundary, de `@meuproduto/data-boundary`; o banco, de `@meuproduto/db` (só em módulos de servidor). Ícones da casca e do painel vêm de `lucide-react`. Dados do painel e notificações são provisórios e sintéticos, menos o total de clientes, que vem do banco.

Ver [princípios](../../docs/arquitetura.md), [ADR-0011](../../docs/adr/0011-estrutura-monorepo.md) e [instruções do repositório](../../AGENTS.md). As instruções locais do Next estão em [AGENTS.md](AGENTS.md).
