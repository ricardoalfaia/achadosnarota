import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { atualizadoEm, checkUlid, criadoEm, idUlid, refUlid } from "./_colunas";
import { leituraPublica } from "./_rls";
import { places } from "./catalogo";

// Curadoria (docs/produto/02, contexto Editorial). Isolada das ofertas
// (ADR-004 de produto): nenhuma tabela comercial referencia esta, e o parceiro
// não tem caminho de escrita aqui. Por ora só o parecer publicado que a ficha
// mostra; visitas, evidências, critérios versionados e revisor entram na F2.

export const REVIEW_STATUS = [
  "draft",
  "in_review",
  "approved",
  "published",
  "superseded",
  "withdrawn",
] as const;
export type ReviewStatus = (typeof REVIEW_STATUS)[number];
export const reviewStatusEnum = pgEnum("review_status", REVIEW_STATUS);

/**
 * Selo editorial sobre a foto. Decidido pela curadoria, nunca comprado:
 * `featured` (Destaque), `beloved` (Mais querido), `verified` (Verificado),
 * `new` (Novo na rota).
 */
export const SEALS = ["featured", "beloved", "verified", "new"] as const;
export type Seal = (typeof SEALS)[number];
export const sealEnum = pgEnum("editorial_seal", SEALS);

export const editorialReviews = pgTable(
  "editorial_review",
  {
    id: idUlid(),
    placeId: refUlid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "restrict" }),
    /** Nota de 0 a 5, com uma casa: o resultado ponderado dos critérios. */
    score: numeric("score", { precision: 2, scale: 1 }).notNull(),
    /** O parecer publicado, em linguagem de leitor. */
    summary: text("summary").notNull(),
    /** Ressalvas: o que o leitor deve saber antes de ir. */
    caveats: text("caveats"),
    visitedOn: date("visited_on").notNull(),
    seal: sealEnum("seal"),
    status: reviewStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: criadoEm(),
    updatedAt: atualizadoEm(),
  },
  (t) => [
    checkUlid("editorial_review", t.id),
    check("editorial_review_score", sql`${t.score} between 0 and 5`),
    check(
      "editorial_review_published_at",
      sql`${t.status} <> 'published' or ${t.publishedAt} is not null`
    ),
    index("editorial_review_place_id_idx").on(t.placeId),
    // Uma avaliação vigente por lugar: a nova publicação substitui a anterior.
    uniqueIndex("editorial_review_one_published")
      .on(t.placeId)
      .where(sql`status = 'published'`),
    leituraPublica(
      "editorial_review",
      sql`status = 'published'
        and exists (select 1 from place p where p.id = place_id and p.status = 'published')`
    ),
  ]
).enableRLS();

export type EditorialReview = typeof editorialReviews.$inferSelect;
