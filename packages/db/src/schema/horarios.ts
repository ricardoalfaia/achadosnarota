import { sql } from "drizzle-orm";
import { check, index, pgTable, smallint, time } from "drizzle-orm/pg-core";

import { checkUlid, idUlid, refUlid } from "./_colunas";
import { escritaDaEquipe, leituraDaEquipe, leituraPublica } from "./_rls";
import { places } from "./catalogo";

/**
 * Horário de funcionamento: um turno por linha, até dois por dia (almoço e
 * jantar). `weekday` 0 é domingo. `closes` menor que `opens` atravessa a
 * meia-noite (22:00–02:00). Dia sem linha é dia fechado. Hoje a equipe
 * escreve; quando houver o portal do parceiro, a casa informa o próprio
 * horário por outro papel, sem tocar no editorial.
 */
export const placeHours = pgTable(
  "place_hours",
  {
    id: idUlid(),
    placeId: refUlid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    weekday: smallint("weekday").notNull(),
    opens: time("opens").notNull(),
    closes: time("closes").notNull(),
  },
  (t) => [
    checkUlid("place_hours", t.id),
    check("place_hours_weekday", sql`${t.weekday} between 0 and 6`),
    check("place_hours_interval", sql`${t.opens} <> ${t.closes}`),
    index("place_hours_place_idx").on(t.placeId, t.weekday),
    leituraPublica(
      "place_hours",
      sql`exists (select 1 from place p where p.id = place_id and p.status = 'published')`
    ),
    leituraDaEquipe("place_hours"),
    ...escritaDaEquipe(
      "place_hours",
      ["admin", "curator"],
      ["insert", "update", "delete"]
    ),
  ]
).enableRLS();

export type PlaceHours = typeof placeHours.$inferSelect;
