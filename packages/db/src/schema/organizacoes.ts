import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Organização = contratante: quem assina o plano e tem a carteira de créditos
 * (docs/produto/02 e 03). Abaixo dela ficam os tenants (espaços operacionais).
 *
 * SEM RLS por enquanto, de propósito: a tabela só tem nome e slug (nada
 * confidencial) e ainda não há caso de uso da app que a leia; seed e bootstrap
 * rodam como dono. Quando entrarem plano, carteira e ledger (M4), as tabelas
 * da carteira ganham policy por organization_id e esta passa a ser lida só a
 * partir do tenant efetivo. Pertencer a uma organização NÃO dá acesso aos
 * tenants dela: o acesso é sempre por tenant_user (docs/produto/02).
 */
export const organizations = pgTable("organization", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Organization = typeof organizations.$inferSelect;
