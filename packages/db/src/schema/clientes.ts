import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { tenantIsolation } from "./_rls";
import { tenants } from "./tenants";

/**
 * Cliente do escritório. Por ora só o mínimo para provar o isolamento por
 * tenant (M1). Contatos e campos opcionais entram com o domínio completo no
 * M2, um por vez e só com necessidade demonstrada (docs/produto/03,
 * minimização).
 */
export const clients = pgTable(
  "client",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("client_tenant_id_idx").on(t.tenantId),
    // Alvo de FK composta (tenant_id, client_id) para o documento do M2:
    // garante no banco que client.tenant_id = document.tenant_id (invariante 2).
    unique("client_tenant_id_id_unique").on(t.tenantId, t.id),
    tenantIsolation("client"),
  ]
).enableRLS();

export type Client = typeof clients.$inferSelect;
