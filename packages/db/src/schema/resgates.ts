import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { atualizadoEm, checkUlid, criadoEm, idUlid, refUlid } from "./_colunas";
import { appRole, leituraDaEquipe, USUARIO_ATUAL } from "./_rls";
import { subscriptions } from "./assinaturas";
import { users } from "./auth";
import { offers } from "./beneficios";
import { places } from "./catalogo";

// Resgates (docs/produto/03, ADR-005 de produto). O assinante emite um código
// curto e temporário; só o hash dele fica aqui. O operador do estabelecimento
// digita ou lê o código e o consome numa transação com atualização
// condicional, com o papel do app e sob RLS (só operador da casa da linha):
// dois operadores não usam o mesmo código, e o limite da oferta é conferido de
// novo nesse momento (src/resgate.ts).

/** issued → redeemed | expired | voided. */
export const REDEMPTION_STATUS = [
  "issued",
  "redeemed",
  "expired",
  "voided",
] as const;
export type RedemptionStatus = (typeof REDEMPTION_STATUS)[number];
export const redemptionStatusEnum = pgEnum(
  "redemption_status",
  REDEMPTION_STATUS
);

export const redemptions = pgTable(
  "redemption",
  {
    id: idUlid(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    offerId: refUlid("offer_id")
      .notNull()
      .references(() => offers.id, { onDelete: "restrict" }),
    /** A casa da oferta, copiada para o operador achar só o que é da casa dele. */
    placeId: refUlid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "restrict" }),
    subscriptionId: refUlid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "restrict" }),
    /** SHA-256 do código. O código em si nunca é gravado. */
    tokenHash: text("token_hash").notNull(),
    status: redemptionStatusEnum("status").notNull().default("issued"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
    /** Quem consumiu (operador do parceiro). Sem FK até o painel existir. */
    operatorId: text("operator_id"),
    createdAt: criadoEm(),
    updatedAt: atualizadoEm(),
  },
  (t) => [
    checkUlid("redemption", t.id),
    check(
      "redemption_redeemed_at",
      sql`${t.status} <> 'redeemed' or ${t.redeemedAt} is not null`
    ),
    // Um código emitido identifica um resgate só, enquanto vale.
    uniqueIndex("redemption_token_issued")
      .on(t.tokenHash)
      .where(sql`status = 'issued'`),
    index("redemption_user_offer_idx").on(t.userId, t.offerId, t.createdAt),
    index("redemption_place_idx").on(t.placeId),
    // A pessoa vê o próprio histórico...
    pgPolicy("redemption_leitura_da_propria_pessoa", {
      as: "permissive",
      for: "select",
      to: appRole,
      using: sql`user_id = ${USUARIO_ATUAL}`,
    }),
    // ...emite código só em nome próprio e só no estado inicial...
    pgPolicy("redemption_emissao_da_propria_pessoa", {
      as: "permissive",
      for: "insert",
      to: appRole,
      withCheck: sql`user_id = ${USUARIO_ATUAL} and status = 'issued' and redeemed_at is null and operator_id is null`,
    }),
    // ...e só pode cancelar o próprio código ainda não usado.
    pgPolicy("redemption_cancelamento_da_propria_pessoa", {
      as: "permissive",
      for: "update",
      to: appRole,
      using: sql`user_id = ${USUARIO_ATUAL} and status = 'issued'`,
      withCheck: sql`user_id = ${USUARIO_ATUAL} and status = 'voided' and redeemed_at is null and operator_id is null`,
    }),
    // A administração e o comercial acompanham os resgates (sem o código:
    // só o hash existe).
    leituraDaEquipe("redemption", ["admin", "commercial"]),
    // O operador do balcão vê os códigos emitidos para as casas que opera...
    pgPolicy("redemption_leitura_do_operador", {
      as: "permissive",
      for: "select",
      to: appRole,
      using: sql`exists (select 1 from partner_operator po where po.user_id = ${USUARIO_ATUAL} and po.place_id = ${t.placeId})`,
    }),
    // ...e só os tira de "emitido": usado em nome dele, ou expirado.
    pgPolicy("redemption_consumo_do_operador", {
      as: "permissive",
      for: "update",
      to: appRole,
      using: sql`status = 'issued' and exists (select 1 from partner_operator po where po.user_id = ${USUARIO_ATUAL} and po.place_id = ${t.placeId})`,
      // As políticas permissivas de UPDATE se somam (OU): sem repetir o
      // vínculo aqui, a pessoa entraria pela política de cancelar o próprio
      // código e sairia por esta, marcando-o como usado. Ninguém valida o
      // próprio código, mesmo operando a casa.
      withCheck: sql`exists (select 1 from partner_operator po where po.user_id = ${USUARIO_ATUAL} and po.place_id = ${t.placeId})
        and ((status = 'redeemed' and operator_id = ${USUARIO_ATUAL} and operator_id <> user_id and redeemed_at is not null)
          or (status = 'expired' and operator_id is null))`,
    }),
  ]
).enableRLS();

export type Redemption = typeof redemptions.$inferSelect;
