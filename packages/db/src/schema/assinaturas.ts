import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { atualizadoEm, checkUlid, criadoEm, idUlid, refUlid } from "./_colunas";
import { leituraDaPropriaPessoa, leituraPublica } from "./_rls";
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
  ]
).enableRLS();

export type Plan = typeof plans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
