# ADR-0028 — Assinantes no painel e cortesia de 7 dias

**Estado:** Proposto  
**Data:** 2026-10-18  
**Princípios relacionados:** P02, P03, P05, P06  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; implementado em `packages/db` (migration `0006_cortesias_e_assinantes`), `apps/achados-admin` (`features/assinantes`) e `apps/achados-web` (`features/passaporte`).

## Contexto

A tela Assinantes do painel estava "em construção". A equipe precisa consultar o passaporte das pessoas com muitas contas no banco, com dados mínimos ([04 — Segurança e LGPD](../produto/04-seguranca-lgpd.md)). O responsável também pediu cortesias: liberar o passaporte por 7 dias para alguém experimentar. O [ADR-006 de produto](../produto/adr/ADR-006.md) diz que a assinatura só é ativada por webhook autenticado e reconciliado; a equipe não pode criar assinatura paga.

Decisões do responsável (18/10/2026): a cortesia dá os benefícios nas casas como o passaporte pago; só a administração libera e revoga; uma cortesia por pessoa na vida.

## Decisão proposta

### Cortesia

- Tabela própria `courtesy`, e não uma assinatura: não passa pelo provedor e não finge pagamento. O ADR-006 continua valendo para o que é pago.
- O banco garante as regras: duração de exatamente 7 dias (`courtesy_sete_dias`), uma por pessoa (índice único em `user_id`), ninguém libera para si (`courtesy_nao_para_si`), revogação registra quem e quando (`courtesy_revogacao`).
- RLS: a pessoa lê a própria; a administração lê todas, libera (`granted_by` = quem está logado) e revoga (`revoked_by` = quem está logado). Curadoria e comercial não leem nem escrevem.
- O passaporte vale com assinatura ativa e vigente **ou**, sem ela, com cortesia vigente e não revogada: a mesma regra em `emitirResgate` (`@achados/db`) e em `passaporteDe` (app). O resgate aponta para um dos dois (`redemption_um_passaporte`: `subscription_id` ou `courtesy_id`, nunca os dois).
- A Action recusa antes de gravar, com mensagem clara: quem já recebeu cortesia e quem já tem passaporte pago ativo. Liberar e revogar ficam em `audit_event` (a conta e os dias, sem nome nem e-mail).
- No app, o cartão e o perfil mostram "Cortesia" e "Cortesia até dd/mm" em vez de "Passaporte anual".

### Assinantes no painel

- Só a administração (`subscription_leitura_da_equipe` e `plan_leitura_da_equipe` para `admin`; a tela confere o papel antes, para a recusa certa).
- Para muitas contas, tudo no servidor: busca por nome ou e-mail (`ILIKE`, com `%` e `_` escapados), situação calculada no banco (pago, cortesia, pendente, encerrado, sem passaporte), contagem por situação e paginação por cursor (`created_at`, `id`) de 50 em 50, com rolagem infinita na `Tabela`. Ordenação e filtro da Tabela desligados: valeriam só para as linhas carregadas.
- Leitura pelo BFF (`GET /api/assinantes`, `GET /api/assinantes/:id`) com React Query (`useInfiniteQuery`, primeira página no prefetch do servidor), como as outras telas do painel ([ADR-0006](0006-estado-http-e-cache.md)). Os comandos de cortesia são Server Actions ([ADR-0004](0004-result-error.md)).
- Dados mínimos: a lista mostra o e-mail mascarado ("an•••@gmail.com"); o completo só na ficha, e cada abertura de ficha fica na auditoria (`assinante.consultado`, sem o dado). Nada de código de resgate, pagamento ou documento.
- A ficha é só leitura, menos a cortesia: assinatura paga muda só pelo provedor.

## Consequências

- O parceiro dá o benefício a quem está de cortesia como a quem pagou. Os resgates de cortesia são identificáveis (`courtesy_id`) para relatório e acerto com o parceiro.
- A conta da equipe aparece na lista como qualquer pessoa (a RLS de `staff_member` só deixa cada um ler o próprio vínculo).
- A busca por `ILIKE '%…%'` percorre a tabela de usuários. Serve para milhares de contas; com dezenas de milhares, ver as pendências.

## Pendências

- Aplicar a migration `0006` no banco de homologação (Neon) e em produção.
- Índice trigram (`pg_trgm`) para a busca quando a base crescer.
- Marcar o uso de cortesia nos relatórios de resgates e no CSV.
- Pedidos de privacidade (portal LGPD) na mesma tela, quando existirem.
- Exceção à "uma por pessoa" só por decisão registrada (hoje o banco impede).
