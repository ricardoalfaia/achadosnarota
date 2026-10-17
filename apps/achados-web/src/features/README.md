# Capacidades do Achados na Rota Web

Cada funcionalidade de negócio pertence a uma pasta com nome de capacidade. A rota em `src/app` resolve convenções Next e compõe essa funcionalidade pelo contrato público.

| Pasta                   | O que fica                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `domain/`               | Tipos e regras puras, testadas sem React nem banco                                                     |
| `hooks/`                | Toda a lógica das telas: estado, URL, Query, comandos; o componente só chama o hook                    |
| `consultas/`            | Opções do TanStack Query (chave, staleTime, queryFn do BFF) e o prefetch no servidor (`*.servidor.ts`) |
| `components/`           | Apresentação: recebem dados e callbacks, sem regra nem transporte                                      |
| `actions.ts`            | Comandos (Server Actions) que devolvem `ActionResult`                                                  |
| `consultas.servidor.ts` | Leituras diretas no banco, só servidor, que devolvem `Result`                                          |

Outras funcionalidades e as rotas consomem `index.ts` (componentes, hooks, tipos) e `servidor.ts` (leituras e prefetch, só servidor). Hooks genéricos, sem domínio, vão para `packages/ui/src/hooks`; componentes genéricos, para `@achados/ui`; Result vem de `@achados/core`. Ver [ADR-0001](../../../../docs/adr/0001-modularidade.md), [ADR-0006](../../../../docs/adr/0006-estado-http-e-cache.md) e [ADR-0025](../../../../docs/adr/0025-app-pwa-do-assinante.md).
