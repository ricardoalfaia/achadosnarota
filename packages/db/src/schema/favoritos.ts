import { index, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

import { criadoEm, refUlid } from "./_colunas";
import { daPropriaPessoa } from "./_rls";
import { users } from "./auth";
import { places } from "./catalogo";

/**
 * Lugares salvos pela pessoa. Dado pessoal: só ela lê e grava, dentro de
 * withUser (RLS). O histórico individual não é vendido nem compartilhado
 * (docs/produto/04).
 */
export const favorites = pgTable(
  "favorite",
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
    index("favorite_place_id_idx").on(t.placeId),
    daPropriaPessoa("favorite"),
  ]
).enableRLS();

export type Favorite = typeof favorites.$inferSelect;
