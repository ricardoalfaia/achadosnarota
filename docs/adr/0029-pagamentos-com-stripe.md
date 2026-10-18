# ADR-0029 — Pagamentos com Stripe: passaporte anual com cartão e Pix

**Estado:** Proposto  
**Data:** 2026-10-18  
**Princípios relacionados:** P02, P03, P05, P06  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; implementado em `apps/achados-web` e `packages/db`, em modo de teste da Stripe.

## Contexto

O [ADR-006 de produto](../produto/adr/ADR-006.md) pede checkout hospedado em provedor externo, webhooks assinados, deduplicação e reconciliação, e deixava o provedor em aberto. O responsável escolheu a Stripe, com cartão e Pix. O passaporte é anual.

A Stripe aceita Pix em contas brasileiras como pagamento único. A cobrança recorrente por Pix (Pix Automático) aparece na documentação de desenvolvedor desde abril de 2026, mas um artigo de suporte da própria Stripe ainda diz que contas brasileiras só têm Pix avulso; por isso ela não é usada agora.

## Decisão proposta

- **Pagamento único por ano** no Checkout hospedado da Stripe, com `card` e `pix`, no preço do plano ativo do banco (`price_data`, nunca do navegador). Conta e plano vão nos metadados da sessão; o e-mail vai só para o recibo da Stripe. O Pix gerado vale uma hora.
- **Renovação por aviso**: nos últimos 30 dias o passaporte mostra "Renovar"; vencido, a oferta diz "Renovar". Pagar com o passaporte ainda valendo emenda o novo ano no fim do atual. Pix Automático e renovação automática por cartão ficam para depois, sem mudar este desenho.
- **Ativação só pelo webhook** (`/api/stripe/webhook`): assinatura conferida sobre o corpo cru (`constructEventAsync`); `checkout.session.completed` pago ativa e não pago (Pix gerado) fica pendente; `async_payment_succeeded` ativa; `async_payment_failed` e `expired` cancelam a pendente; `charge.refunded` total marca estornado. A volta do Checkout (`?pagamento=retorno`) só mostra o aviso; não ativa nada.
- **Papel próprio no banco**, `achados_pagamentos` (`DATABASE_URL_PAGAMENTOS`), usado só pela rota do webhook: lê plano e conta, cria e atualiza `subscription` e `payment_event`, e nada mais. O papel do app continua só lendo a assinatura (RLS). A migração `0007_pagamentos_stripe` cria o papel sem login se faltar; `db:setup-papel-de-pagamentos` liga o login, a senha e os grants.
- **Deduplicação e conciliação** (`processarEventoDePagamento`, `@achados/db`): cada evento entra uma vez em `payment_event` (só id e tipo, sem o corpo); a ativação confere conta, plano, valor e moeda contra o banco; divergência não ativa e fica registrada no log, sem dado do pagador.
- **Configuração tudo-ou-nada**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e `DATABASE_URL_PAGAMENTOS` juntas; sem elas, "Assinar" aparece como indisponível e o resto do app funciona.

- **E-mails transacionais** (Resend, mesmo transporte da redefinição de senha): "Boas-vindas" logo depois do cadastro e "Seu passaporte está ativo" quando o webhook ativa a compra, ambos depois da resposta (`after`), com o primeiro nome e a validade, sem detalhe do pagamento (o recibo é da Stripe). Falha no envio vai ao log só com o código.

## Alternativas consideradas

- **Stripe Billing (assinatura recorrente)**: renova sozinho no cartão, mas o Pix recorrente ainda não é certo para contas brasileiras; misturar dois modelos agora complicaria a primeira versão.
- **Outros provedores nacionais**: preteridos pelo responsável.
- **Ativar na volta do Checkout**: proibido pelo ADR-006 de produto; a volta do navegador não prova pagamento.

## Verificação de aderência

| Regra                                                     | Evidência                                                   | Estado    |
| --------------------------------------------------------- | ----------------------------------------------------------- | --------- |
| Evento sem assinatura válida é recusado e não grava       | `app/api/stripe/webhook/route.test.ts` (assinado com o SDK) | Executado |
| Evento repetido não duplica; Pix pendente, pago, expirado | `packages/db/src/pagamentos.test.ts`                        | Executado |
| Valor divergente não ativa; estorno total desativa        | `packages/db/src/pagamentos.test.ts`                        | Executado |
| O papel do app não cria assinatura                        | `packages/db/src/pagamentos.test.ts` (RLS)                  | Executado |
| O papel de pagamentos não lê outras tabelas               | Conferência no Neon (`favorite` recusado, 42501)            | Executado |
| Mapeamento dos eventos da Stripe                          | `features/passaporte/domain/pagamento.test.ts`              | Executado |
| Compra de ponta a ponta no Checkout de teste              | Depende das chaves de teste no ambiente                     | Planejado |

## Pendências

- Chaves de teste no ambiente e o endpoint de webhook cadastrado na Stripe; compra de ponta a ponta no modo de teste; depois, as chaves de produção.
- E-mail de aviso antes do vencimento (hoje o aviso é na tela).
- Pix Automático ou renovação automática por cartão, se a conta tiver.
- Reconciliação periódica com a Stripe (eventos perdidos), além do webhook.
