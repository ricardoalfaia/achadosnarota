import "server-only";

import { criarDb, type Db } from "@achados/db";

import { ambienteDoPainel } from "@/shared/config/ambiente.servidor";

/**
 * O banco do painel, como achados_app (sujeito a RLS). O que a equipe lê e
 * escreve passa por `withUser(banco(), pessoa.id, ...)`: o papel em
 * `staff_member` decide no banco, a cada pedido (ADR-003 de produto).
 */
export function banco(): Db {
  return criarDb(ambienteDoPainel().databaseUrl);
}
