# API — contratos preliminares

Usar route handlers Next.js no MVP; autenticação de sessão para usuário e operador, RBAC no servidor. Versionar contratos públicos quando houver clientes externos.

## Público

- `GET /api/cities?query=` → cidades e slugs.
- `GET /api/places?city=&category=&page=` → cards publicados.
- `GET /api/places/:slug` → ficha publicada, curadoria, benefícios disponíveis (sem dados internos).
- `GET /api/plans` → preços e condições atuais.

## Assinante

- `POST /api/checkout/session` → sessão do provedor; não aceita preço do cliente.
- `GET /api/me/subscription` → estado reconciliado.
- `POST /api/offers/:id/issue` → token temporário se elegível.
- `GET /api/me/redemptions` → histórico minimizado.

## Parceiro

- `GET/POST/PATCH /api/partner/offers` → ofertas do parceiro autenticado.
- `POST /api/partner/redemptions/validate` → resgate transacional, idempotente.

## Editorial/admin

- `POST /api/editorial/visits`, `POST /api/editorial/reviews/:id/submit`, `POST /api/editorial/reviews/:id/publish`.
- `GET /api/admin/audit-events` com permissão específica.

## Integrações

- `POST /api/webhooks/payments` → verificar assinatura antes de parsear/confiar, deduplicar providerEventId, reconciliar cobrança e assinatura.

## Respostas

Erros JSON `{code, message, correlationId}` com HTTP correto; paginação cursor quando volume justificar. Nunca retornar hash de token, segredos ou evidências privadas no endpoint público. Definir schemas Zod e testes de contrato antes de implementar.
