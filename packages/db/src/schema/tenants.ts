import { sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { appRole, TENANT_ATUAL, USUARIO_ATUAL } from "./_rls";
import { users } from "./auth";
import { organizations } from "./organizacoes";

export const TENANT_STATUS = ["active", "suspended"] as const;
export type TenantStatus = (typeof TENANT_STATUS)[number];
export const tenantStatusEnum = pgEnum("tenant_status", TENANT_STATUS);

/**
 * Tenant = espaço operacional (um escritório). Toda tabela de negócio carrega
 * tenant_id e é isolada por RLS (ver _rls.ts).
 *
 * Sem RLS na própria tabela: o app precisa resolver o slug da URL para o id
 * ANTES de existir contexto de tenant, e as colunas (nome, slug, status) não
 * são confidenciais. Quem decide o acesso é tenant_user, que tem RLS.
 */
export const tenants = pgTable(
  "tenant",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // restrict: apagar a organização não pode levar junto, em cascata e em
    // silêncio, dados com retenção legal (docs/produto/03, invariante 6).
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    /** Único no sistema todo: vira o endereço do escritório. */
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    status: tenantStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("tenant_organization_id_idx").on(t.organizationId)]
);

export const TENANT_ROLES = ["owner", "admin", "member", "viewer"] as const;
export type TenantRole = (typeof TENANT_ROLES)[number];
export const tenantRoleEnum = pgEnum("tenant_role", TENANT_ROLES);

/**
 * Membership: quem acessa qual tenant e com que papel (autorização explícita,
 * docs/produto/03).
 *
 * Melhoria sobre o CRM, onde esta tabela não tinha RLS. Duas policies
 * permissivas (o Postgres faz OR entre elas):
 *   - tenant_user_tenant_isolation (ALL): dentro de withTenant(A), lê e grava
 *     só linhas de A (listar, convidar e remover membros do tenant atual);
 *   - tenant_user_own_memberships (SELECT): dentro de withUser(U), LÊ as
 *     linhas do próprio U em qualquer tenant ("meus tenants", requireTenant).
 * Escrita só passa pela primeira: com withUser ninguém se adiciona a outro
 * tenant nem muda o próprio papel.
 */
export const tenantUsers = pgTable(
  "tenant_user",
  {
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: tenantRoleEnum("role").notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.tenantId, t.userId] }),
    index("tenant_user_user_id_idx").on(t.userId),
    pgPolicy("tenant_user_tenant_isolation", {
      as: "permissive",
      for: "all",
      to: appRole,
      using: sql`tenant_id = ${TENANT_ATUAL}`,
      withCheck: sql`tenant_id = ${TENANT_ATUAL}`,
    }),
    pgPolicy("tenant_user_own_memberships", {
      as: "permissive",
      for: "select",
      to: appRole,
      using: sql`user_id = ${USUARIO_ATUAL}`,
    }),
  ]
).enableRLS();

export type Tenant = typeof tenants.$inferSelect;
export type TenantUser = typeof tenantUsers.$inferSelect;
