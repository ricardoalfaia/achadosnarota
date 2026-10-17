# ADR-0024 — Identificadores de linha em ULID

**Estado:** Proposto  
**Data:** 2026-10-17  
**Princípios relacionados:** P05, P12  
**Responsável pela proposta:** Ricardo Alfaia Barbosa (pedido: "ids curtos e ordenáveis")  
**Aceitação:** pendente; implementado em `packages/db` e no Better Auth do `achados-web`.

## Contexto

A base usava `uuid` aleatório (`defaultRandom`) nas tabelas de negócio e o gerador padrão do Better Auth nas de identidade. O responsável pediu identificadores mais curtos que o UUID e que permitam ordenar pela criação. UUID v4 tem 36 caracteres e não tem ordem; índice de chave primária aleatória espalha inserções pela árvore.

## Decisão proposta

- **ULID em todas as tabelas com id próprio**, como `text`: 26 caracteres em Crockford base32; os 10 primeiros codificam o milissegundo da criação, então `order by id` é a ordem de criação.
- **Gerado no app**, pela fábrica monotônica do pacote `ulid` (`novoId()` em `packages/db/src/id.ts`), que mantém a ordem entre ids do mesmo milissegundo no mesmo processo. Coluna: `idUlid()` em `schema/_colunas.ts`.
- **O banco confere o formato**: constraint `check (id ~ '^[0-9A-HJKMNP-TV-Z]{26}$')` em cada tabela de domínio.
- **Better Auth** gera usuário, sessão, conta e verificação com o mesmo `novoId` (`advanced.database.generateId`).
- **O id não é segredo nem prova de nada.** Revela o instante da criação. Código de resgate, token e qualquer coisa que precise ser imprevisível continuam aleatórios e em hash ([ADR-005 de produto](../produto/adr/ADR-005.md)). O "ID do membro" do passaporte usa só os seis caracteres finais (a parte aleatória).

## Alternativas consideradas

- **UUID v7 nativo do Postgres 18 (`uuidv7()`):** ordenável e com 16 bytes no tipo `uuid`, mas continua com 36 caracteres na URL e no JSON, que era o incômodo; o Neon precisaria da mesma versão do Postgres.
- **Serial/identity:** curto e ordenado, mas expõe volume e sequência e complica migração e geração fora do banco.
- **NanoID:** curto, sem ordem.

## Consequências

Ids menores na URL e nos logs, ordem natural e inserção no fim do índice. O `text(26)` ocupa mais que `uuid` (16 bytes); aceitável no volume do MVP. Ids gerados fora do app (scripts) precisam do mesmo formato: o banco recusa os que não seguem.

## Verificação de aderência

| Regra                                  | Evidência                                                      | Estado    |
| -------------------------------------- | -------------------------------------------------------------- | --------- |
| `novoId` gera ULID canônico e ordenado | `packages/db/src/id.test.ts` (500 ids em ordem, sem repetição) | Executado |
| O banco recusa id fora do formato      | `isolamento.test.ts`, "o banco recusa id que não é ULID"       | Executado |
| Better Auth gera ULID                  | Teste de integração que cria a conta e confere o formato do id | Planejado |

## Pendências e exceções

- As tabelas do Better Auth não têm a constraint de formato: o gerador é configurado, mas o banco não confere. Avaliar a constraint depois de confirmar que nenhum caminho do Better Auth gera id por conta própria.

## Referências

- [Especificação ULID](https://github.com/ulid/spec)
- [ADR-0020](0020-autenticacao-e-sessao.md) — Better Auth
