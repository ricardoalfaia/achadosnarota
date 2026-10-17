# Arquitetura técnica

## Stack proposta

Next.js (App Router) + TypeScript, PostgreSQL + Drizzle ORM, autenticação Better Auth, UI responsiva e PWA progressiva. Separar `app` (páginas), `modules` (domínio), `db`, `lib` e `workers`. Usar Zod nas bordas, testes Vitest e Playwright. Infra inicial: frontend Vercel e PostgreSQL gerenciado; jobs por fila/worker gerenciado somente quando necessários. Alternativa Cloudflare Workers exige verificar compatibilidade de bibliotecas e runtime antes de escolher.

## Contextos

- Discovery: cidades, categorias, estabelecimentos, imagens, busca e SEO.
- Editorial: visitas, critérios, evidências, pareceres e publicação.
- Commerce: planos, assinaturas, checkout, pagamentos, reembolsos e webhooks.
- Benefits: ofertas, elegibilidade, emissão, validação e resgate.
- Identity: usuários, sessões, perfis, RBAC e vínculos com parceiros.
- Governance: moderação, auditoria, consentimentos e solicitações LGPD.

## Princípios de implementação

Monólito modular para MVP; não distribuir microsserviços. Banco com migrações versionadas; transações nos resgates; webhooks idempotentes; tarefas assíncronas para expiração, notificações e reconciliação. Credenciais apenas no servidor. CDN para imagens, upload assinado e sanitização de metadados. Cache público com invalidação após publicação; dados privados sem cache compartilhado.

## SEO/PWA

Páginas públicas renderizadas no servidor, slugs canônicos, sitemap, metadados Open Graph, schema.org apropriado apenas com dados verdadeiros. Manifest e ícones; service worker opcional e conservador. Nunca armazenar dados sensíveis ou QR/códigos de resgate em cache offline.

## Observabilidade

Logs estruturados com correlationId, métricas de checkout/webhook/resgate, alarmes para falhas e auditoria de mudanças editoriais. Não registrar dados de cartão, tokens ou documentos sensíveis em logs.

## Ambientes

Local, staging e production, bancos e credenciais isolados. Migrações com revisão, backups testados e rollback de deploy. CI: lint, typecheck, unit, integration, E2E smoke e checagem de dependências.
