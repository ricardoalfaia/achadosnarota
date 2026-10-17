import { sql, type SQL } from "drizzle-orm";
import { pgPolicy, pgRole } from "drizzle-orm/pg-core";

/**
 * Papel da aplicação. Criado FORA das migrations (docker/postgres/init no
 * ambiente local, scripts/setup-app-role.mjs nos demais): `.existing()` faz o
 * drizzle-kit apenas referenciá-lo nas policies, sem CREATE ROLE.
 *
 * meuproduto_app não é dono das tabelas, então as policies valem para ele. O dono
 * (DATABASE_URL_ADMIN) roda migrations, seed e bootstrap e não é filtrado.
 */
export const appRole = pgRole("meuproduto_app").existing();

/**
 * Tenant fixado na transação por withTenant(), como uuid.
 *
 * `current_setting(..., true)` devolve NULL se a variável nunca foi definida
 * na sessão e string vazia depois que uma transação que a definiu com
 * `is_local` termina (a variável customizada passa a existir, vazia). O nullif
 * cobre os dois casos: sem contexto a comparação dá NULL e nenhuma linha passa,
 * sem erro de cast em conexões reaproveitadas do pool.
 */
export const TENANT_ATUAL: SQL = sql`nullif(current_setting('app.tenant_id', true), '')::uuid`;

/** Usuário fixado na transação por withUser() (ids do Better Auth são texto). */
export const USUARIO_ATUAL: SQL = sql`nullif(current_setting('app.user_id', true), '')`;

/**
 * Policy padrão das tabelas de tenant: a linha só existe para quem fixou o
 * mesmo tenant. `using` filtra leitura, update e delete; `withCheck` barra
 * insert/update que gravariam linha de outro tenant.
 */
export function tenantIsolation(table: string) {
  const mesmoTenant = sql`tenant_id = ${TENANT_ATUAL}`;
  return pgPolicy(`${table}_tenant_isolation`, {
    as: "permissive",
    for: "all",
    to: appRole,
    using: mesmoTenant,
    withCheck: mesmoTenant,
  });
}
