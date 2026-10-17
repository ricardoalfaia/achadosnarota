# Achados na Rota Web

**Descubra lugares que valem a pena.** O PWA do assinante: Next.js 16.3.8, React 19.2, TypeScript, App Router, Tailwind 4, TanStack Query e next-intl, no pnpm workspace e Turborepo da raiz. Produto em [docs/produto](../../docs/produto/README.md); decisões do app no [ADR-0025](../../docs/adr/0025-app-pwa-do-assinante.md).

- `src/app`: convenções Next e composição de rotas. `(app)` são as telas com a barra inferior (Explorar, lugar, Favoritos, Passaporte, Perfil, termos e privacidade); `(acesso)`, entrar, criar conta e recuperar senha; `api/` é o BFF (`lugares`, `me/favoritos`) e o Better Auth; `manifest.ts`, `sitemap.ts`, `robots.ts` e `offline/` são do PWA e do SEO.
- `src/features`: capacidades (`catalogo`, `favoritos`, `beneficios`, `passaporte`, `acesso`). Cada uma tem `index.ts` (componentes, hooks, tipos), `servidor.ts` (leituras só do servidor), `domain/` puro e testado, `hooks/` com a lógica das telas, `consultas/` com as opções do Query e `components/` só com apresentação.
- `src/shared`: casca (cabeçalho, barra inferior, leitor, aviso sem conexão), consultas (cliente do Query, BFF, provedor com escopo da pessoa), sessão e autenticação, banco, e-mail, preferências e configuração.
- `public/`: símbolo, ícones do PWA, `sw.js` e as fotos de exemplo do seed (`exemplos/`, só desenvolvimento).
- `e2e`: jornadas no celular (Playwright, Pixel 7), o preparo do banco do teste e a caixa de e-mail.

## Rodar localmente

1. Copie `.env.example` para `.env.local` e preencha `BETTER_AUTH_SECRET` (mínimo de 32 caracteres; `openssl rand -base64 48`). `DATABASE_URL` já aponta para o Postgres do Docker como `achados_app`.
2. Na raiz: `pnpm infra:up`, `pnpm db:migrate` e `pnpm db:seed`.
3. `pnpm dev:web` na raiz e abra <http://localhost:4500> (no computador, a coluna do app aparece centralizada; use o modo celular do navegador).

Contas do seed (sintéticas, senha `achados123`):

| E-mail                    | Situação                                |
| ------------------------- | --------------------------------------- |
| `assinante@achados.local` | Passaporte ativo (fixture), 2 favoritos |
| `visitante@achados.local` | Sem passaporte, sem favoritos           |

Os lugares, notas e ofertas do seed são inventados a partir do protótipo; nada disso vai para produção. Sem `RESEND_API_KEY`, o e-mail de redefinição de senha sai no console do servidor.

## Verificações

`pnpm check` na raiz verifica formatação, arquitetura, ambientes, lint, tipos, testes e build. Depois do build, com o Postgres no ar, `pnpm --filter achados-web test:e2e` prepara um banco próprio do E2E, sobe o build na porta 4501 e roda o Playwright. Se faltar o navegador: `pnpm --filter achados-web exec playwright install chromium`.

## Contratos

Componentes cliente e hooks genéricos vêm de `@achados/ui` e `@achados/ui/hooks`; estilos puros, de `@achados/ui/estilos`. Result vem de `@achados/core`; DataBoundary, de `@achados/data-boundary`; o banco, de `@achados/db` (só em módulos de servidor). Ver [princípios](../../docs/arquitetura.md), [ADR-0006](../../docs/adr/0006-estado-http-e-cache.md) e [instruções do repositório](../../AGENTS.md). As instruções locais do Next estão em [AGENTS.md](AGENTS.md).
