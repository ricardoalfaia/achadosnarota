import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
} from "drizzle-orm/pg-core";

import { checkUlid, criadoEm, idUlid } from "./_colunas";
import {
  appRole,
  daEquipe,
  leituraDaPropriaPessoa,
  PAPEIS_DA_EQUIPE,
  USUARIO_ATUAL,
} from "./_rls";
import { users } from "./auth";

// A equipe do painel (docs/produto/03, ADR-003 de produto). Quem é da equipe
// e com que papel é dado do banco, lido a cada pedido; o vínculo é escrito
// fora do app (script de bootstrap ou, depois, o administrador).

export const staffRoleEnum = pgEnum("staff_role", PAPEIS_DA_EQUIPE);

export const staffMembers = pgTable(
  "staff_member",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    role: staffRoleEnum("role").notNull(),
    createdAt: criadoEm(),
  },
  () => [leituraDaPropriaPessoa("staff_member")]
).enableRLS();

/**
 * O que a equipe fez no painel: quem, o quê, em qual registro e quando.
 * Só acrescenta (sem update nem delete pelo app) e nunca guarda dado pessoal,
 * senha, código ou conteúdo de documento: `details` leva só nomes de campos e
 * situações (docs/produto/04).
 */
export const auditEvents = pgTable(
  "audit_event",
  {
    id: idUlid(),
    actorId: text("actor_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    /** "casa.criada", "curadoria.publicada", "promocao.pausada"... */
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    details: jsonb("details")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: criadoEm(),
  },
  (t) => [
    checkUlid("audit_event", t.id),
    index("audit_event_entity_idx").on(t.entity, t.entityId),
    index("audit_event_created_idx").on(t.createdAt),
    pgPolicy("audit_event_registro_da_equipe", {
      as: "permissive",
      for: "insert",
      to: appRole,
      withCheck: sql`actor_id = ${USUARIO_ATUAL} and ${daEquipe(PAPEIS_DA_EQUIPE)}`,
    }),
    pgPolicy("audit_event_leitura_da_administracao", {
      as: "permissive",
      for: "select",
      to: appRole,
      using: daEquipe(["admin"]),
    }),
  ]
).enableRLS();

export type StaffMember = typeof staffMembers.$inferSelect;
export type AuditEvent = typeof auditEvents.$inferSelect;
