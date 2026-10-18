import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";

import { checkUlid, criadoEm, idUlid, refUlid } from "./_colunas";
import {
  appRole,
  escritaDaEquipe,
  leituraDaEquipe,
  leituraDaPropriaPessoa,
  USUARIO_ATUAL,
} from "./_rls";
import { users } from "./auth";
import { places } from "./catalogo";

// Operadores do balcão (docs/produto/03): a conta de quem valida o código de
// resgate numa casa. O vínculo é escrito pela equipe (admin, com papel
// próprio), nunca pelo próprio operador; ele só lê os vínculos dele.

export const partnerOperators = pgTable(
  "partner_operator",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    placeId: refUlid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    createdAt: criadoEm(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.placeId] }),
    index("partner_operator_place_idx").on(t.placeId),
    leituraDaPropriaPessoa("partner_operator"),
    // A administração vincula e desvincula operadores.
    leituraDaEquipe("partner_operator", ["admin"]),
    ...escritaDaEquipe("partner_operator", ["admin"], ["insert", "delete"]),
  ]
).enableRLS();

/**
 * Cada tentativa de validar um código no balcão, certa ou errada. Serve ao
 * limite contra quem tenta adivinhar códigos (5 erros em 15 minutos) e à
 * auditoria. Não guarda o código digitado.
 */
export const redemptionAttempts = pgTable(
  "redemption_attempt",
  {
    id: idUlid(),
    /** O operador que tentou. */
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    placeId: refUlid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    succeeded: boolean("succeeded").notNull(),
    createdAt: criadoEm(),
  },
  (t) => [
    checkUlid("redemption_attempt", t.id),
    index("redemption_attempt_user_idx").on(t.userId, t.createdAt),
    // O operador registra e lê as próprias tentativas, mas não apaga nem
    // altera: o limite não se zera por fora.
    leituraDaPropriaPessoa("redemption_attempt"),
    pgPolicy("redemption_attempt_registro_da_propria_pessoa", {
      as: "permissive",
      for: "insert",
      to: appRole,
      withCheck: sql`user_id = ${USUARIO_ATUAL}`,
    }),
  ]
).enableRLS();
