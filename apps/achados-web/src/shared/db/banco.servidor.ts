import "server-only";

import { criarDb, type Db } from "@achados/db";

import { ambienteServidor } from "@/shared/config/ambiente.servidor";

/**
 * O banco do app, conectado como achados_app (sujeito a RLS, ADR-0020). O
 * pool fica no registro do `@achados/db` (globalThis), então chamar de novo
 * devolve o mesmo, inclusive entre rotas empacotadas separadamente e no HMR.
 *
 * Dados da pessoa só por `withUser(banco(), userId, tx => ...)`; sem ele as
 * policies não deixam ver nada. O catálogo é lido por `lerPublico`, e o banco
 * só mostra o que está publicado. Tabelas sem RLS (as do Better Auth) são
 * lidas pelo próprio Better Auth.
 */
export function banco(): Db {
  return criarDb(ambienteServidor().databaseUrl);
}
