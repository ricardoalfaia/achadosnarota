# Instruções do Achados na Rota

## Antes de alterar

1. Leia o [README de produto](docs/produto/README.md), com os princípios inegociáveis e as fases F0–F5 como portões, e os documentos de produto ligados à mudança. Eles são a fonte do produto; ADRs de produto ficam em `docs/produto/adr` (`ADR-001` a `ADR-010`). O protótipo, na pasta `achadosnarota-prototipo` ao lado deste repositório, é a referência visual das telas, não de regras ([marca](docs/produto/marca/README.md)).
2. Leia [os princípios do frontend](docs/arquitetura.md) e [o índice de ADRs de frontend](docs/adr/README.md) (`0001` em diante), e os ADRs relacionados à mudança.
3. Verifique o código existente antes de criar uma abstração. Reutilize [Result/Error](packages/core/src/result.ts) e [DataBoundary](packages/data-boundary/src/data-boundary.tsx), com os contratos e lacunas dos ADRs 0004 e 0005. A estrutura está no [ADR-0011](docs/adr/0011-estrutura-monorepo.md); aplicações ficam em apps e bibliotecas em packages.
4. Identifique as responsabilidades, a fonte de cada estado e os testes que demonstram o comportamento.
5. A base veio de outro monorepo ([origem da base](docs/origem-da-base.md)). O único conjunto de hooks está em `packages/ui/src/hooks`. Não reintroduza código, nomes ou dados do domínio de origem.

Não apresente um ADR proposto como aceito nem uma verificação planejada como executada. Evidência registrada na base de origem não vale aqui: só o que foi executado neste repositório.

Use exports públicos e `workspace:*`, com dependências declaradas por consumidor. Não faça imports relativos entre projetos nem instale uma aplicação como dependência de outra. `@achados/ui` e `@achados/ui/hooks` são cliente; `@achados/ui/dates`, `@achados/ui/zod` e `@achados/ui/estilos` são entrypoints puros. Uma função exportada por um entrypoint cliente não pode ser chamada em Server Component: para classes de estilo, use `@achados/ui/estilos`. Leia também as instruções locais do app e os guias do Next da versão instalada antes de modificar suas convenções.

## Regras do produto que valem para todo código

- Nenhum dado pessoal (e-mail, nome, telefone), token, senha, código de resgate ou segredo em logs, telemetria, mensagens de erro, prompts de IA ou URLs.
- Autorização e identidade são decididas no servidor, a cada requisição. Nunca confie em `userId`, papel ou parceiro vindos do cliente; dado de um usuário passa pelo escopo dele (`withUser`, RLS) e dado de parceiro pelo escopo do parceiro ([ADR-0020](docs/adr/0020-autenticacao-e-sessao.md), [ADR-003 de produto](docs/produto/adr/ADR-003.md)).
- Avaliação editorial (critérios, notas, selos, pareceres) e oferta comercial são domínios separados: parceiro não escreve no editorial, e selo ou posição não se compra ([ADR-004 de produto](docs/produto/adr/ADR-004.md)).
- Nenhuma avaliação, nota, estabelecimento ou economia fictícios fora do ambiente de desenvolvimento. Testes, seed e desenvolvimento usam fixtures sintéticas; dado real de pessoa ou parceiro não entra no repositório.
- Código de resgate é aleatório, guardado em hash, de uso único e consumido em transação; nunca fica em cache offline nem em histórico completo ([ADR-005 de produto](docs/produto/adr/ADR-005.md)).
- Assinatura só é ativada por webhook autenticado e reconciliado; confirmação vinda do navegador não prova pagamento ([ADR-006 de produto](docs/produto/adr/ADR-006.md)).
- Identificadores de linha são ULID ([ADR-0024](docs/adr/0024-identificadores-ulid.md)).
- Validação no navegador é conveniência; o servidor valida de novo.
- Não invente API externa (provedor de pagamento, mapas) nem estado atual do código: audite antes.

## Diretrizes já expressas pelo responsável

- Aplicações usam Next.js com App Router, React 19 e Tailwind.
- Cada módulo e componente tem uma responsabilidade clara. Composição explícita e APIs tipadas prevalecem sobre componentes que concentram tela, HTTP, regras e estado.
- Preservar Select e SeletorDePeriodo de `packages/ui` como bases de reutilização, incluindo partes internas, hooks e calendário compartilhado. Evoluir essas implementações conforme os contratos e testes da arquitetura.
- Suspense e o DataBoundary existente fazem parte da arquitetura de dados assíncronos.
- Result/Error do core é o contrato para resultados e falhas operacionais. Não crie tipos Result locais, substitutos ou fluxos paralelos baseados em exceções.
- Estado HTTP tem prioridade sobre stores globais; dados remotos não são copiados para stores de interface.
- Testes unitários e E2E com Playwright acompanham a implementação, incluindo isolamento entre usuários e entre parceiros.
- Mudanças arquiteturais são registradas em ADRs.

## Aplicação dos ADRs

Os detalhes adicionais estão **propostos** para revisão. Durante uma tarefa de implementação, confirme quais decisões já foram aceitas no registro; use as diretrizes expressas acima e a instrução atual do usuário como base. Os contratos existentes estão disponíveis: Result discrimina por `ok`; `toActionResult` serializa a fronteira de Action; `unwrapOrThrow` pertence aos adaptadores que exigem exceção. Não invente outro core nem ignore as lacunas de segurança e recuperação registradas nos ADRs.

Não concentre regra de negócio, transporte, cache e apresentação em um componente ou em um hook de tela. Hooks coordenam recursos do React; regras testáveis permanecem funções independentes. Funções pequenas e estado local simples podem ficar com o componente ao qual pertencem.

Não use Server Actions como mecanismo geral de consultas. A proposta detalhada para leituras, comandos e cache está no [ADR-0006](docs/adr/0006-estado-http-e-cache.md). A conversão deliberada de Result para exceção de biblioteca pertence aos adaptadores descritos no [ADR-0004](docs/adr/0004-result-error.md).

## Ao concluir

- Cite os ADRs aplicáveis (de frontend e de produto) e explique mudanças nos contratos.
- Execute as verificações pertinentes: `pnpm check:architecture`, lint, typecheck, testes e build pelo Turborepo; para E2E, `pnpm test:e2e` após o build. Informe resultados e limitações; se um teste não rodou, diga.
- Apresente o que [09 — Supervisão](docs/produto/09-supervisao.md) pede: arquivos alterados, testes com saída, testes de isolamento A/B (usuários, parceiros) quando houver dado de negócio, efeitos sobre privacidade, riscos e pendências.
- Não desative regras ou testes para fazer a alteração passar. Uma exceção arquitetural precisa de motivo, escopo, responsável e condição de retirada no ADR.
- Não declare aderência garantida por este arquivo: grafo/imports públicos e declarações concorrentes de Result têm verificações locais, mas coesão, segurança e isolamento ainda precisam das evidências do [ADR-0010](docs/adr/0010-governanca.md).

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
