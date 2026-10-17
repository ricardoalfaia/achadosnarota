import { sql } from "drizzle-orm";
import { check, text, timestamp } from "drizzle-orm/pg-core";

import { novoId, PADRAO_ULID_SQL } from "../id";

/** Chave primária ULID gerada no app (ADR-0024). */
export const idUlid = () => text("id").primaryKey().$defaultFn(novoId);

/** Referência a outra tabela pelo ULID dela. */
export const refUlid = (coluna: string) => text(coluna);

/** O banco recusa id que não seja ULID canônico, venha de onde vier. */
export const checkUlid = (tabela: string, coluna: { name: string }) =>
  check(
    `${tabela}_${coluna.name}_ulid`,
    sql`${sql.identifier(coluna.name)} ~ ${sql.raw(`'${PADRAO_ULID_SQL}'`)}`
  );

export const criadoEm = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const atualizadoEm = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
