import { sql } from "drizzle-orm";
import {
  char,
  check,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { atualizadoEm, checkUlid, criadoEm, idUlid, refUlid } from "./_colunas";
import { escritaDaEquipe, leituraDaEquipe, leituraPublica } from "./_rls";

// Descoberta (docs/produto/02, contexto Discovery): cidades, categorias,
// estabelecimentos e fotos. Leitura pública só do que está publicado; a
// escrita será do painel administrativo, com papel próprio.

/** Cidade do catálogo. Entidade nacional desde o início (ADR-009 de produto). */
export const cities = pgTable(
  "city",
  {
    id: idUlid(),
    /** UF em maiúsculas: "SP". */
    state: char("state", { length: 2 }).notNull(),
    name: text("name").notNull(),
    /** Único no país: "pindamonhangaba-sp". */
    slug: text("slug").notNull().unique(),
    createdAt: criadoEm(),
  },
  (t) => [
    checkUlid("city", t.id),
    check("city_state_uf", sql`${t.state} ~ '^[A-Z]{2}$'`),
    leituraPublica("city"),
    ...escritaDaEquipe("city", ["admin"]),
  ]
).enableRLS();

/**
 * Categoria de estabelecimento. `icon` é uma chave de apresentação que o app
 * traduz para um ícone; o banco não guarda SVG nem classe.
 */
export const categories = pgTable(
  "category",
  {
    id: idUlid(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    icon: text("icon").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: criadoEm(),
  },
  (t) => [
    checkUlid("category", t.id),
    leituraPublica("category"),
    ...escritaDaEquipe("category", ["admin"]),
  ]
).enableRLS();

export const PLACE_STATUS = ["draft", "published", "archived"] as const;
export type PlaceStatus = (typeof PLACE_STATUS)[number];
export const placeStatusEnum = pgEnum("place_status", PLACE_STATUS);

/**
 * Estabelecimento. Só dados de descoberta: avaliação editorial e oferta
 * comercial ficam em tabelas próprias (ADR-004 de produto), e o parceiro
 * dono do perfil entra com o painel do parceiro.
 */
export const places = pgTable(
  "place",
  {
    id: idUlid(),
    cityId: refUlid("city_id")
      .notNull()
      .references(() => cities.id, { onDelete: "restrict" }),
    categoryId: refUlid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    /** Especialidade mostrada sobre a foto: "Culinária Brasileira". */
    specialty: text("specialty").notNull(),
    /** Uma ou duas frases para cartão e topo da ficha. */
    summary: text("summary").notNull(),
    /** Texto da aba "Sobre". */
    description: text("description"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    address: text("address"),
    /** Telefone só com dígitos, com DDD: "1236448899". */
    phone: text("phone"),
    website: text("website"),
    /** Observação do horário: "Fecha em feriados", "Cozinha até 22h". */
    hoursNote: text("hours_note"),
    latitude: numeric("latitude", { precision: 9, scale: 6 }),
    longitude: numeric("longitude", { precision: 9, scale: 6 }),
    status: placeStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: criadoEm(),
    updatedAt: atualizadoEm(),
  },
  (t) => [
    checkUlid("place", t.id),
    check("place_phone_digits", sql`${t.phone} ~ '^[0-9]{10,13}$'`),
    check(
      "place_published_at",
      sql`${t.status} <> 'published' or ${t.publishedAt} is not null`
    ),
    index("place_city_id_idx").on(t.cityId),
    index("place_category_id_idx").on(t.categoryId),
    leituraPublica("place", sql`status = 'published'`),
    leituraDaEquipe("place"),
    ...escritaDaEquipe("place", ["admin", "curator"]),
  ]
).enableRLS();

/**
 * Foto do estabelecimento, com origem e licença (docs/produto/03). A leitura
 * segue a do lugar: foto de rascunho não aparece.
 */
export const placeMedia = pgTable(
  "place_media",
  {
    id: idUlid(),
    placeId: refUlid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull(),
    /** De onde veio e com que licença: "Foto do estabelecimento, autorizada". */
    source: text("source").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: criadoEm(),
  },
  (t) => [
    checkUlid("place_media", t.id),
    index("place_media_place_id_idx").on(t.placeId),
    unique("place_media_place_position").on(t.placeId, t.position),
    leituraPublica(
      "place_media",
      sql`exists (select 1 from place p where p.id = place_id and p.status = 'published')`
    ),
    leituraDaEquipe("place_media"),
    ...escritaDaEquipe(
      "place_media",
      ["admin", "curator"],
      ["insert", "update", "delete"]
    ),
  ]
).enableRLS();

export type City = typeof cities.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Place = typeof places.$inferSelect;
export type PlaceMedia = typeof placeMedia.$inferSelect;
