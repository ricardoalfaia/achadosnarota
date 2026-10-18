import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  index,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { atualizadoEm, checkUlid, criadoEm, idUlid, refUlid } from "./_colunas";
import {
  appRole,
  daEquipe,
  leituraDaEquipe,
  leituraDaPropriaPessoa,
  leituraPublica,
  USUARIO_ATUAL,
} from "./_rls";
import { users } from "./auth";

// Passaporte (docs/produto/02, contexto Commerce). O app só LÊ: a assinatura
// nasce e muda de estado pelo webhook autenticado e reconciliado do provedor
// (ADR-006 de produto), que roda com outro papel. Confirmação vinda do
// navegador nunca ativa nada.

export const PLAN_PERIODS = ["year"] as const;
export const planPeriodEnum = pgEnum("plan_period", PLAN_PERIODS);

/** Plano à venda. Preço em centavos; mudança de preço cria nova versão. */
export const plans = pgTable(
  "plan",
  {
    id: idUlid(),
    name: text("name").notNull(),
    priceCents: integer("price_cents").notNull(),
    currency: char("currency", { length: 3 }).notNull().default("BRL"),
    period: planPeriodEnum("period").notNull().default("year"),
    version: integer("version").notNull().default(1),
    active: boolean("active").notNull().default(false),
    createdAt: criadoEm(),
  },
  (t) => [
    checkUlid("plan", t.id),
    check("plan_price_positive", sql`${t.priceCents} > 0`),
    leituraPublica("plan", sql`active`),
    // A administração vê também os planos inativos (assinaturas antigas).
    leituraDaEquipe("plan", ["admin"]),
  ]
).enableRLS();

export const SUBSCRIPTION_STATUS = [
  "pending",
  "active",
  "past_due",
  "canceled",
  "expired",
  "refunded",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[number];
export const subscriptionStatusEnum = pgEnum(
  "subscription_status",
  SUBSCRIPTION_STATUS
);

export const subscriptions = pgTable(
  "subscription",
  {
    id: idUlid(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    planId: refUlid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    status: subscriptionStatusEnum("status").notNull().default("pending"),
    /** Identificador no provedor de pagamento, quando houver. */
    providerSubscriptionId: text("provider_subscription_id"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: criadoEm(),
    updatedAt: atualizadoEm(),
  },
  (t) => [
    checkUlid("subscription", t.id),
    check(
      "subscription_active_period",
      sql`${t.status} <> 'active' or (${t.startsAt} is not null and ${t.endsAt} is not null and ${t.endsAt} > ${t.startsAt})`
    ),
    index("subscription_user_id_idx").on(t.userId),
    uniqueIndex("subscription_provider_id")
      .on(t.providerSubscriptionId)
      .where(sql`provider_subscription_id is not null`),
    leituraDaPropriaPessoa("subscription"),
    // Só a administração consulta os passaportes de todos (tela Assinantes,
    // dados mínimos, docs/produto/04). Ninguém da equipe escreve: a
    // assinatura muda só pelo webhook do provedor (ADR-006 de produto).
    leituraDaEquipe("subscription", ["admin"]),
  ]
).enableRLS();

/** Duração fixa da cortesia; o banco confere (`courtesy_sete_dias`). */
export const DIAS_DA_CORTESIA = 7;

/**
 * Cortesia: o passaporte liberado pela administração por 7 dias, para alguém
 * experimentar. Não é assinatura e não passa pelo provedor de pagamento
 * (ADR-006 de produto continua valendo para o que é pago). Vale para os
 * benefícios como o passaporte pago. Uma por pessoa na vida (índice único);
 * a revogação encerra antes do prazo e fica registrada com quem revogou.
 */
export const courtesies = pgTable(
  "courtesy",
  {
    id: idUlid(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    /** Quem da administração liberou. */
    grantedBy: text("granted_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedBy: text("revoked_by").references(() => users.id, {
      onDelete: "restrict",
    }),
    createdAt: criadoEm(),
  },
  (t) => [
    checkUlid("courtesy", t.id),
    check(
      "courtesy_sete_dias",
      sql`${t.endsAt} = ${t.startsAt} + make_interval(days => ${sql.raw(String(DIAS_DA_CORTESIA))})`
    ),
    check(
      "courtesy_revogacao",
      sql`(${t.revokedAt} is null) = (${t.revokedBy} is null)`
    ),
    // Ninguém da administração libera cortesia para si.
    check("courtesy_nao_para_si", sql`${t.userId} <> ${t.grantedBy}`),
    // Uma cortesia por pessoa, na vida.
    uniqueIndex("courtesy_user_id_unica").on(t.userId),
    leituraDaPropriaPessoa("courtesy"),
    leituraDaEquipe("courtesy", ["admin"]),
    pgPolicy("courtesy_concessao_da_administracao", {
      as: "permissive",
      for: "insert",
      to: appRole,
      withCheck: sql`granted_by = ${USUARIO_ATUAL} and revoked_at is null and revoked_by is null and ${daEquipe(["admin"])}`,
    }),
    pgPolicy("courtesy_revogacao_da_administracao", {
      as: "permissive",
      for: "update",
      to: appRole,
      using: sql`revoked_at is null and ${daEquipe(["admin"])}`,
      withCheck: sql`revoked_by = ${USUARIO_ATUAL} and revoked_at is not null and ${daEquipe(["admin"])}`,
    }),
  ]
).enableRLS();

export type Plan = typeof plans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Courtesy = typeof courtesies.$inferSelect;
