# Achados na Rota — Painel

A área administrativa: casas, curadoria e promoções ([ADR-0026](../../docs/adr/0026-app-administrativo.md)).

```bash
pnpm dev:admin        # http://localhost:4600
```

**Fase atual: visual.** Sem login e sem banco. As telas leem e gravam uma fonte em memória com dados sintéticos (`src/shared/provisorio`), que some ao reiniciar o servidor e é recusada fora do desenvolvimento. Não publique este app em homologação ou produção antes do login da equipe.

## Estrutura

| Pasta                   | O que fica                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/app/(painel)`      | Rotas do painel dentro da casca; cada página faz o prefetch e compõe a feature                                    |
| `src/app/api`           | BFF lido pelo Query no navegador; responde com `respostaDe(Result)`                                               |
| `src/features/<area>`   | `domain/` (regras puras), `hooks/`, `consultas/` (Query), `components/`, `actions.ts`, `index.ts` e `servidor.ts` |
| `src/shared/casca`      | Menu lateral, faixa do topo, menu do usuário e cabeçalho da página                                                |
| `src/shared/cadastro`   | Tela de cadastro comum: registro na URL, formulário com pendências, esqueletos e falhas                           |
| `src/shared/consultas`  | Cliente do Query, adaptadores HTTP e de Action                                                                    |
| `src/shared/provisorio` | PROVISÓRIO: fonte em memória e a guarda de ambiente                                                               |

As features são `casas` e `curadoria` (editorial), `promocoes` (comercial) e `inicio`. Editorial e comercial não se escrevem ([ADR-004 de produto](../../docs/produto/adr/ADR-004.md)).
