# ADR-0020 — Autenticação, sessão e isolamento multi-tenant com Better Auth

**Estado:** Proposto  
**Data:** 2026-10-17  
**Princípios relacionados:** P05, P07, P08, P12  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente. A implementação no `meuproduto-web` existe desde 17/10/2026; as verificações executadas estão na tabela de aderência, com data.

## Contexto

A base de origem autenticava contra a API de identidade de outro sistema, com sessão em cookie JWE próprio, pré-sessão para segundo fator e uma API falsa para os testes. O Meuproduto não tem essa API. O responsável decidiu que o Meuproduto é multi-tenant com **Better Auth**, no padrão dos seus projetos SaaS (o CRM é a referência), rodando no próprio app Next.

Requisitos de produto que este ADR precisa atender:

- Organização e tenant, com acesso filtrado pelo contexto efetivo; associação à organização **não implica** acesso a todos os tenants ([02 — Arquitetura](../produto/02-arquitetura.md); [ADR-002 de produto](../produto/adr/ADR-002.md)).
- Toda consulta e mutação valida tenant e permissões no servidor; deny by default ([03 — Domínio](../produto/03-modelo-de-dominio.md), invariante 1; [ADR-003 de produto](../produto/adr/ADR-003.md)).
- Identidade e tenant derivados da sessão e do vínculo; nunca de um `tenantId` arbitrário do cliente ([07 — API](../produto/07-api-eventos-operacoes.md)).
- MFA obrigatório para administradores, sessão revogável e proteção contra força bruta ([04 — Segurança](../produto/04-seguranca-confidencialidade.md)).
- Testes automáticos de isolamento A/B como aceite do M1 ([08 — Plano de entrega](../produto/08-milestones-e-aceite.md)).
- Auditoria de eventos de segurança sem conteúdo confidencial ([ADR-011 de produto](../produto/adr/ADR-011.md)).

## Decisão proposta

### Identidade: Better Auth no app

- **Servidor de identidade:** Better Auth 1.7.5 no `meuproduto-web`, exposto pelo route handler `app/api/auth/[...all]` com `toNextJsHandler`.
- **Banco:** PostgreSQL ([ADR-0013](0013-ambientes-e-configuracao.md), local na porta 4450) pelo `drizzleAdapter`. O schema de autenticação é escrito em Drizzle no pacote `@meuproduto/db` (Drizzle ORM 0.45.3, drizzle-kit 0.31.11, postgres.js 3.4.9), com migrações SQL versionadas.
- **Seed e bootstrap:** seed idempotente com **dois tenants sintéticos**, para os testes de isolamento; bootstrap de produção separado do seed, sem dados de exemplo.
- **Configuração:** `shared/auth/auth.servidor.ts`, criada na primeira chamada (o `next build` importa as rotas sem segredos): `drizzleAdapter(db, { provider: "pg", schema: authSchema })` com o `db` do `@meuproduto/db` em `DATABASE_URL`; `baseURL` e `trustedOrigins` = `APP_URL`; `telemetry` desligada; plugins `twoFactor({ issuer: "Meuproduto" })` e `nextCookies()` por último; `user.additionalFields` `mustChangePassword`, `termsVersion` e `termsAcceptedAt`, todos `input: false`. As telas usam Server Actions que chamam `auth().api.*` com os headers do pedido; o `nextCookies` grava os cookies.
- **Cadastro:** o hook `databaseHooks.user.create.before` é a porta única de criação de usuário (recusa com `CADASTRO_FECHADO`), além de `disableSignUp`. O cadastro público é controlado por `SIGNUP_ENABLED`, fechado por padrão. Os convites ainda não existem: o gancho `podeCriarConta` é onde o convite pendente vai abrir a porta; hoje, com o cadastro fechado, ninguém cria conta pelo app (só seed e bootstrap).
- **Convite:** por link, com o token guardado só como hash no banco. Pendente.
- **Senha:** mínimo de 10 caracteres. Redefinição por link de uso único (1 hora) com `revokeSessionsOnPasswordReset`, que encerra as sessões abertas. O link aponta para `/login/redefinir?token=...` (página com `Referrer-Policy: no-referrer`); o pedido responde igual exista ou não a conta, e o e-mail sai em `after()`. Senha provisória: `user.mustChangePassword` (gravado só pelo servidor) obriga a troca no primeiro acesso, com `changePassword` e `revokeOtherSessions`; a redefinição também limpa a marca.
- **MFA:** plugin `twoFactor` (TOTP e 10 códigos de recuperação, cifrados pela lib), obrigatório para quem tem papel `owner` ou `admin` em **qualquer** tenant (documento de produto 04). A obrigatoriedade é imposta no servidor por bloqueio: `exigirSessao` e `exigirTenant` (layouts e páginas) e `contextoDaAcao` (Actions) recusam a sessão com pendência, e o login mostra a etapa de configurar o autenticador: a senha de novo, depois o QR (SVG gerado no servidor), a chave em base32 e os códigos de recuperação, mostrados uma vez, e o primeiro código TOTP, que liga o 2FA. Quem for promovido a admin sem MFA cai na mesma regra na requisição seguinte: a pendência é calculada a cada pedido a partir dos vínculos, não guardada na sessão. Para `member` e `viewer` o 2FA é opcional (ainda sem tela para ligá-lo fora do login).
- **Força bruta:** duas camadas, ambas na tabela `rate_limit` do banco (valem entre instâncias). (1) O rate limit do Better Auth (`storage: "database"`, regras para `/sign-in/email`, `/sign-up/email`, `/two-factor/*`, `/request-password-reset`, `/reset-password` e `/change-password`) só vale para quem chama `/api/auth/*` por HTTP: no código da 1.7.5 ele roda no `onRequest` do roteador, e `auth.api.*` chamado de Server Action não passa por ali. (2) Por isso as Actions de acesso têm limite próprio (`shared/auth/limite.ts` e `limite.servidor.ts`): falhas de senha por conta (10 em 15 min, de qualquer IP) e por IP (50 em 15 min); pedidos de redefinição por conta (3) e por IP (10) em 15 min. E-mail e IP ficam guardados só como HMAC. O segundo fator usa os limites do próprio plugin, também no banco: 5 tentativas por desafio e bloqueio da conta por 15 min depois de 10 falhas seguidas. O IP vem de `x-forwarded-for`, confiável só atrás de um proxy que o reescreva; o limite por conta não depende dele.
- **E-mail:** `shared/email`, sem dependência nova. Resend por `fetch` (`RESEND_API_KEY` e `EMAIL_FROM`); sem ele, console só no ambiente local; fora do local, sem transporte, o envio falha com erro claro (nunca cai no console em homologação ou produção). No E2E, uma caixa em arquivo (`EMAIL_CAIXA_DE_TESTE`), aceita só com `APP_URL` local. SMTP é pendência.

### Sessão

- **Cookie do Better Auth** com `cookiePrefix: "meuproduto"` (`meuproduto.session_token`, HttpOnly, SameSite=Lax), Secure quando `APP_URL` é `https`. **`cookieCache` desligado**: cada leitura da sessão vai ao banco, então sair, troca e redefinição de senha valem na requisição seguinte. O custo é uma consulta por pedido, memorizada no pedido com `React.cache`.
- **Duração:** `expiresIn` de 12 horas, renovada por mais 12 quando usada depois de 1 hora (`updateAge`). A renovação só acontece em Actions e Route Handlers (em Server Component o `nextCookies` não grava cookie); na prática, quem só navega tem 12 horas a partir da entrada.
- **Barreira no servidor:** `exigirSessao` continua sendo a barreira em layouts, páginas, Actions e Route Handlers; lê a sessão com `auth.api.getSession({ headers })`. Layout sozinho não protege endpoint ([Next: segurança de dados](https://nextjs.org/docs/app/guides/data-security)).
- **Proxy só faz triagem:** `proxy.ts` usa `getSessionCookie(request, { cookiePrefix: "meuproduto" })` para mandar quem não tem cookie ao login. `/api/auth` fica fora do matcher e `/login` sempre passa: a página decide, então cookie vencido ou revogado não cria laço. Ter cookie não prova sessão válida, e o proxy não injeta header de tenant.
- **O que chega ao navegador:** só o DTO seguro para a interface (nome, e-mail, organização e tenant ativos, papel) e a lista de tenants do seletor (nome e slug). Tokens, ids e o registro de sessão não cruzam a fronteira.
- **Saíram da base:** o cookie JWE próprio (`jose`), a pré-sessão, o limite de tentativas em memória, `SESSION_SECRET`, `MEUPRODUTO_API_URL`, a API falsa de login (`dev:api`) e o aviso de conexão com a API. Com o banco fora do ar, o login mostra "serviço indisponível".

### Organização, tenant e papéis

Tabelas próprias, sem o plugin `organization` do Better Auth:

| Tabela         | Campos principais                                                    | Papel                                                |
| -------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| `organization` | id, nome, situação                                                   | Contratante; dona do plano e da carteira de créditos |
| `tenant`       | id, `organization_id`, `slug` único                                  | Espaço operacional onde ficam clientes e documentos  |
| `tenant_user`  | `tenant_id`, `user_id`, papel (`owner`, `admin`, `member`, `viewer`) | Vínculo explícito de uma pessoa a um tenant          |

O plugin `organization` não é registrado: no projeto de referência ele ficava ligado sem uso e expunha endpoints, dívida que não é copiada. Isso resolve a parte da decisão aberta do [ADR-002 de produto](../produto/adr/ADR-002.md) sobre a hierarquia, mantendo organização e tenant como entidades distintas, como no documento 02, sem usar "teams" do plugin. O ADR-002 de produto continua **Proposta**; este ADR não o aceita.

### Tenant ativo e acesso a dados

- **Tenant ativo na URL:** `/t/[slug]/...`. `exigirTenant(slug)` (`shared/sessao/tenant.servidor.ts`, o `requireTenant` do desenho) lê a sessão liberada, busca o tenant ativo pelo slug (tabela sem RLS), lê o vínculo em `tenant_user` **dentro de `withTenant`** a cada request e responde `notFound()` quando o tenant não existe, está suspenso ou não há vínculo: os três casos são iguais por fora. `contextoDaAcao(slug)` faz a mesma checagem para Server Actions e Route Handlers de negócio, devolvendo `Result` em vez de redirecionar. "Meus tenants" vêm de `withUser` (policy `tenant_user_own_memberships`). A raiz `/` leva ao primeiro tenant em ordem de nome, ou mostra "sem acesso"; o seletor da faixa troca para a mesma tela em `/t/<outro>`, sem estado global. O tenant nunca vem de header, corpo ou estado do cliente.
- **Isolamento no banco por RLS:** toda tabela de negócio tem `tenant_id` e a policy `tenant_id = current_setting('app.tenant_id', true)`. O app conecta como o papel `meuproduto_app`, que não é dono das tabelas, então o RLS vale para ele; migrações e seed rodam como dono (`DATABASE_URL_ADMIN`).
- **Uma porta de acesso:** consultas de negócio passam por `withTenant(db, tenantId, fn)`, que abre uma transação e faz `set_config('app.tenant_id', ..., true)` local. Sem `withTenant`, nada aparece: a falha é fechada.
- **Cache:** a chave de qualquer cache inclui o tenant ativo; troca de tenant descarta o contexto anterior ([ADR-0006](0006-estado-http-e-cache.md)).
- **URL e dados sensíveis:** o slug do tenant é identificador operacional, não segredo. Regra (`ehSlugValido` em `shared/rotas.ts`): minúsculas sem acento, dígitos e hífen, de 2 a 63 caracteres, sem hífen nas pontas nem duplo; slug fora da regra é tratado como inexistente. Ele não deve conter nome de cliente nem dado pessoal: é o nome do escritório, escolhido por quem cria o tenant (a criação ainda não tem tela).
- **Primeira fatia de dados:** o total de clientes do painel vem do banco por `withTenant` (`features/painel/leitura.servidor.ts`); falha do banco mostra o erro na região do painel.

### Auditoria

Entrada, falha de entrada, ativação e uso de MFA, convite, troca de papel e redefinição de senha geram evento de auditoria com ator, tenant, ação, alvo e momento, sem senha, token, código ou conteúdo ([ADR-011 de produto](../produto/adr/ADR-011.md)). **Pendente:** nenhuma tabela nem gravação de auditoria foi implementada. Hoje os únicos registros são os avisos do próprio Better Auth no log ("User not found", "Invalid password"), sem e-mail nem senha.

## Inconsistências e decisões a tomar

Apontadas para decisão do responsável; este ADR não as resolve sozinho.

1. **Onde fica o backend.** O [documento de produto 02](../produto/02-arquitetura.md) tem como hipótese um backend Fastify separado com Better Auth. Aqui a identidade e, por ora, o acesso a dados ficam no app Next. Revisitar quando houver worker de PDF, fila e outbox ([07 — API](../produto/07-api-eventos-operacoes.md)): o worker precisa do mesmo contexto autorizado e do mesmo `withTenant`, fora do Next.
2. **Papéis.** O [documento 01](../produto/01-produto-e-escopo.md) fala em administrador do escritório, operador/secretária e signatário externo sem conta. O vínculo tem `owner`, `admin`, `member` e `viewer`. Falta o mapeamento (por exemplo, administrador → `owner`/`admin`, operador → `member`) e a confirmação de que o signatário externo não é usuário, com acesso por outro mecanismo.
3. **Papel por tenant ou por organização.** O papel está em `tenant_user`. Quem administra a organização (plano, carteira, criação de tenants) ainda não tem vínculo próprio.
4. **Carteira de créditos.** O [documento 06](../produto/06-assinaturas-e-creditos.md) propõe carteira por organização, com alocação entre tenants; encaixa em `organization`, mas a alocação não está modelada.
5. **Organização × tenant na prática.** Um escritório pequeno terá uma organização com um tenant. Se a interface deve esconder essa distinção nesse caso é decisão de produto.

## Alternativas consideradas

- **Porta de identidade própria com adaptador HTTP para um backend futuro:** foi o primeiro desenho do Meuproduto, a partir da base. Descartado pelo responsável: o backend não existe e o padrão dos seus projetos já resolve identidade e tenant com Better Auth.
- **Plugin `organization` do Better Auth:** entrega convites e papéis prontos, mas modela uma única camada e expõe endpoints que não seriam usados; organização e tenant do documento 02 ficariam forçados em organização e times.
- **Isolamento só por filtro na aplicação, sem RLS:** mais simples, mas um `where` esquecido vaza dados entre tenants. O RLS faz a falha ser fechada.
- **Tenant no cookie ou no corpo da requisição:** permitiria trocar de tenant sem mudar a URL, mas abre a porta para IDOR e esconde o contexto. Na URL, o servidor confere o vínculo a cada request.
- **Auth.js ou provedor externo de identidade:** opções válidas; o padrão já usado pelo responsável reduz custo de manutenção.

## Consequências

Identidade, sessão e isolamento passam a ser do próprio produto, com o banco como barreira final. O custo: o app Next ganha acesso a banco, migrações e um pacote server-only; a revogação depende do `cookieCache`; e a saída para um backend separado, se vier, exige mover identidade e acesso a dados com cuidado.

## Verificação de aderência

Execuções de 17/10/2026, contra o Postgres local do Docker (`pnpm --filter meuproduto-web test:e2e`: 39 testes, todos passaram, com o build do ambiente local e com o build de produção sem `.env.local`, como na CI). A CI do GitHub ainda não rodou este conjunto.

| Regra                                                         | Evidência                                                                                                                         | Estado                                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Usuário do tenant A não lê nem altera dados do tenant B       | E2E `isolamento.spec.ts` (404 no tenant B; 3 clientes em cada tenant, contados pelo RLS); integração do `@meuproduto/db` no banco | Leitura: E2E passou. Escrita pela aplicação: ainda sem caso de uso        |
| Sem `withTenant`, consulta de negócio não retorna linhas      | Integração conectada como `meuproduto_app` (`packages/db/src/isolamento.test.ts`)                                                 | `pnpm --filter @meuproduto/db test:integracao` em 17/10/2026: 26 passaram |
| Slug de tenant sem vínculo responde 404                       | E2E `isolamento.spec.ts` (tenant de outro escritório e tenant inexistente)                                                        | Passou                                                                    |
| Rota autenticada sem sessão leva ao login                     | E2E `login.spec.ts` (sem cookie e com cookie inventado, sem laço)                                                                 | Passou                                                                    |
| Action e Route Handler recusam sem sessão                     | `contextoDaAcao`; E2E da etapa adulterada sem sessão                                                                              | Parcial: ainda não há Action de negócio para testar                       |
| Admin não usa o sistema sem MFA                               | E2E `mfa.spec.ts` e `sessao.setup.ts` (owner sem 2FA não abre `/t/...`; configura o autenticador e entra com TOTP)                | Passou                                                                    |
| Redefinição de senha encerra as outras sessões                | E2E `redefinicao.spec.ts` (sessão aberta em outro navegador cai; link de uso único; resposta igual para conta inexistente)        | Passou                                                                    |
| Sair revoga a sessão no servidor                              | E2E `sessao.spec.ts` (o cookie antigo devolvido ao navegador não reabre o sistema)                                                | Passou                                                                    |
| Força bruta é limitada entre instâncias                       | E2E `login.spec.ts` (11ª senha errada da mesma conta recusada; contador na tabela `rate_limit`)                                   | Passou com uma instância; várias instâncias não foram testadas            |
| Nenhum token, senha ou código em log ou resposta ao navegador | E2E `sessao.spec.ts` (token fora do HTML); busca por segredo e papel do banco em `.next/static`; leitura dos logs do E2E          | Parcial: sem eventos de auditoria para conferir                           |

## Pendências e exceções

- Convites: token só como hash, abertura da porta no `databaseHooks.user.create.before`.
- Auditoria de eventos de acesso ([ADR-011 de produto](../produto/adr/ADR-011.md)): tabela, gravação e testes.
- Transporte SMTP para o e-mail.
- Entrar com Google (`socialProviders`), com ligação de contas só para e-mail confirmado.
- Seleção de organização e tela de criação de tenant, com a regra do slug.
- Tela para `member` e `viewer` ligarem o 2FA fora do login e para gerar novos códigos de recuperação.
- Proxy confiável para o IP dos limites por IP (`advanced.ipAddress` do Better Auth e `x-forwarded-for` nas Actions).
- Limpeza das linhas vencidas de `rate_limit` gravadas pelas Actions: o Better Auth só limpa quando o roteador dele é usado.
- Decisões da seção "Inconsistências e decisões a tomar".
- CSP e cabeçalhos de segurança em `next.config.ts` (tarefa própria).

Nenhuma exceção registrada.

## Referências

- [ADR-0004](0004-result-error.md), [ADR-0006](0006-estado-http-e-cache.md), [ADR-0013](0013-ambientes-e-configuracao.md), [ADR-0018](0018-casca-do-sistema.md)
- ADRs de produto: [ADR-002](../produto/adr/ADR-002.md), [ADR-003](../produto/adr/ADR-003.md), [ADR-011](../produto/adr/ADR-011.md)
- [Better Auth](https://www.better-auth.com/docs) · [PostgreSQL: Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Next.js: autenticação](https://nextjs.org/docs/app/guides/authentication) · [Next.js: segurança de dados](https://nextjs.org/docs/app/guides/data-security) · [Next.js: proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
