import "server-only";

import { criarDb, type Db } from "@meuproduto/db";

import { ambienteServidor } from "@/shared/config/ambiente.servidor";

/**
 * O banco do app, conectado como meuproduto_app (sujeito a RLS, ADR-0020). O
 * pool fica no registro do `@meuproduto/db` (globalThis), então chamar de novo
 * devolve o mesmo, inclusive entre rotas empacotadas separadamente e no HMR.
 *
 * Dados de tenant só por `withTenant(banco(), tenantId, tx => ...)`; sem ele
 * as policies não deixam ver nada. Tabelas sem RLS (as do Better Auth,
 * `tenant`, `rate_limit`) são lidas direto, com cuidado de quem chama.
 */
export function banco(): Db {
  return criarDb(ambienteServidor().databaseUrl);
}
