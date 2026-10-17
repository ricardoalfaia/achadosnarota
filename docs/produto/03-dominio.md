# Domínio e modelo de dados

## Entidades principais

- `users`: id, nome, email, status.
- `partner_organizations`: id, nome, CNPJ opcional, status.
- `partner_memberships`: userId, partnerId, role.
- `cities`: id, UF, nome, slug.
- `places`: id, partnerId opcional, cityId, category, nome, slug, endereço, geo, status.
- `place_media`: placeId, URL, alt, origem/licença.
- `editorial_criteria`: categoria, nome, peso, versão.
- `editorial_visits`: placeId, curatorId, data, status, evidências privadas.
- `editorial_reviews`: visitId, scores por critério, parecer, aprovadoPor, publicadoEm, versão.
- `offers`: placeId, título, termos, elegibilidade, período, limite por usuário, limite global, status.
- `plans`: nome, preço, moeda, período, versão.
- `subscriptions`: userId, planId, providerSubscriptionId, status, início, fim.
- `payments`: referência externa, valor, status, idempotencyKey.
- `redemptions`: userId, offerId, subscriptionId, tokenHash, status, expiresAt, redeemedAt, operatorId.
- `audit_events`: actor, action, target, timestamp, metadata minimizada.
- `privacy_requests`: userId, tipo, status, prazo e resultado.

## Invariantes

- Estabelecimento não pode editar critérios, pareceres ou notas editoriais.
- Publicação editorial requer revisor distinto do autor quando possível; exceções auditadas.
- Um resgate por usuário/oferta quando `limitPerUser=1`; concorrência protegida por transação e constraint.
- Só assinatura confirmada e válida autoriza emissão de benefício.
- Código de resgate é imprevisível, curto prazo, armazenado em hash, uso único e vinculado a oferta e assinante.
- Webhook não ativa assinatura por payload não autenticado; assinatura e valor devem ser reconciliados com provedor.
- Oferta encerrada não pode gerar novo resgate; códigos já emitidos seguem política explícita.
- Cancelamento e estorno seguem termos e legislação aplicável.

## Estados

Offer: draft → pending_review → active → paused/expired/archived.
Subscription: pending → active → past_due/canceled/expired/refunded.
Redemption: issued → redeemed/expired/voided.
Editorial: draft → in_review → approved → published → superseded/withdrawn.

## Segurança transacional

Resgate: autenticar operador autorizado → verificar token hash e expiração → verificar vínculo com estabelecimento → lock/atualização condicional `status=issued` → persistir `redeemed` + audit no mesmo commit → resposta idempotente. Evitar exibir código completo no histórico.
