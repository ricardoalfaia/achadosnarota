import { sql, type SQL } from "drizzle-orm";
import { pgPolicy, pgRole } from "drizzle-orm/pg-core";

/**
 * Papel da aplicação. Criado FORA das migrations (docker/postgres/init no
 * ambiente local, scripts/setup-app-role.mjs nos demais): `.existing()` faz o
 * drizzle-kit apenas referenciá-lo nas policies, sem CREATE ROLE.
 *
 * achados_app não é dono das tabelas, então as policies valem para ele. O dono
 * (DATABASE_URL_ADMIN) roda migrations e seed e não é filtrado.
 */
export const appRole = pgRole("achados_app").existing();

/**
 * Usuário fixado na transação por withUser() (ids do Better Auth são ULID).
 *
 * `current_setting(..., true)` devolve NULL se a variável nunca foi definida
 * na sessão e string vazia depois que uma transação que a definiu com
 * `is_local` termina. O nullif cobre os dois casos: sem contexto a comparação
 * dá NULL e nenhuma linha passa, em conexões reaproveitadas do pool.
 */
export const USUARIO_ATUAL: SQL = sql`nullif(current_setting('app.user_id', true), '')`;

/**
 * Leitura pública do catálogo: o app lê só o que a condição deixa (por
 * exemplo, `status = 'published'`) e, como não há policy de escrita, não
 * grava nada. Rascunho, oferta pausada e avaliação não aprovada ficam
 * invisíveis no banco, não só na query (ADR-008 de produto). A escrita do
 * catálogo será do painel administrativo, com papel próprio.
 */
export function leituraPublica(tabela: string, condicao: SQL = sql`true`) {
  return pgPolicy(`${tabela}_leitura_publica`, {
    as: "permissive",
    for: "select",
    to: appRole,
    using: condicao,
  });
}

/**
 * Dado da própria pessoa: dentro de withUser(U), o app lê e grava só as
 * linhas com user_id = U. `using` filtra leitura, update e delete;
 * `withCheck` barra insert/update que gravariam linha de outra pessoa.
 */
export function daPropriaPessoa(tabela: string) {
  const mesmaPessoa = sql`user_id = ${USUARIO_ATUAL}`;
  return pgPolicy(`${tabela}_da_propria_pessoa`, {
    as: "permissive",
    for: "all",
    to: appRole,
    using: mesmaPessoa,
    withCheck: mesmaPessoa,
  });
}

/** Só leitura do próprio dado: a escrita vem de outro caminho (webhook, painel). */
export function leituraDaPropriaPessoa(tabela: string) {
  return pgPolicy(`${tabela}_leitura_da_propria_pessoa`, {
    as: "permissive",
    for: "select",
    to: appRole,
    using: sql`user_id = ${USUARIO_ATUAL}`,
  });
}
