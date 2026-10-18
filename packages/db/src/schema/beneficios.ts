import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { atualizadoEm, checkUlid, criadoEm, idUlid, refUlid } from "./_colunas";
import { escritaDaEquipe, leituraDaEquipe, leituraPublica } from "./_rls";
import { places } from "./catalogo";

// Benefícios (docs/produto/02, contexto Benefits). Oferta é comercial e
// voluntária do parceiro; não referencia nada do editorial (ADR-004). O
// resgate emite um código temporário guardado em hash e o operador do
// estabelecimento o consome numa transação (ADR-005 de produto; ver
// resgates.ts e src/resgate.ts).

export const OFFER_STATUS = [
  "draft",
  "pending_review",
  "active",
  "paused",
  "expired",
  "archived",
] as const;
export type OfferStatus = (typeof OFFER_STATUS)[number];
export const offerStatusEnum = pgEnum("offer_status", OFFER_STATUS);

/** `two_for_one`: "compre um, ganhe outro", o benefício principal da casa. */
export const OFFER_KINDS = ["discount", "courtesy", "two_for_one"] as const;
export type OfferKind = (typeof OFFER_KINDS)[number];
export const offerKindEnum = pgEnum("offer_kind", OFFER_KINDS);

/**
 * Em que janela vale o `limit_per_user`: o dia, a semana, o mês ou o ano do
 * calendário (horário de Brasília), ou sem limite. "2 por 1 uma vez por ano"
 * é limite 1 no ano; "chopp cortesia toda semana", limite 1 na semana.
 */
export const OFFER_USAGE_PERIODS = [
  "day",
  "week",
  "month",
  "year",
  "unlimited",
] as const;
export type OfferUsagePeriod = (typeof OFFER_USAGE_PERIODS)[number];
export const offerUsagePeriodEnum = pgEnum(
  "offer_usage_period",
  OFFER_USAGE_PERIODS
);

export const offers = pgTable(
  "offer",
  {
    id: idUlid(),
    placeId: refUlid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "restrict" }),
    /** "10% de desconto no almoço". */
    title: text("title").notNull(),
    /** Regras explícitas, mostradas antes do pagamento e do resgate. */
    terms: text("terms").notNull(),
    kind: offerKindEnum("kind").notNull(),
    /** Chave de apresentação do ícone (percent, gift, dessert, beer...). */
    icon: text("icon").notNull(),
    /** Quantas vezes cada assinante pode usar dentro de `usage_period`. */
    limitPerUser: integer("limit_per_user").notNull().default(1),
    usagePeriod: offerUsagePeriodEnum("usage_period").notNull().default("year"),
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    status: offerStatusEnum("status").notNull().default("draft"),
    position: integer("position").notNull().default(0),
    createdAt: criadoEm(),
    updatedAt: atualizadoEm(),
  },
  (t) => [
    checkUlid("offer", t.id),
    check("offer_limit_per_user", sql`${t.limitPerUser} >= 1`),
    check(
      "offer_valid_range",
      sql`${t.validUntil} is null or ${t.validFrom} is null or ${t.validUntil} > ${t.validFrom}`
    ),
    index("offer_place_id_idx").on(t.placeId),
    // O app vê só oferta ativa, dentro da validade, de lugar publicado.
    leituraPublica(
      "offer",
      sql`status = 'active'
        and (valid_from is null or valid_from <= now())
        and (valid_until is null or valid_until > now())
        and exists (select 1 from place p where p.id = place_id and p.status = 'published')`
    ),
    leituraDaEquipe("offer"),
    ...escritaDaEquipe("offer", ["admin", "commercial"]),
  ]
).enableRLS();

export type Offer = typeof offers.$inferSelect;
