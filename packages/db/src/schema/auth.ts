import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Tabelas no formato que o drizzleAdapter do Better Auth 1.7 procura para
// emailAndPassword + plugin twoFactor + rateLimit com storage "database".
// Conferido em node_modules/@better-auth/core/dist/db/get-tables.mjs e
// better-auth/dist/plugins/two-factor/schema.mjs (1.7.5). O adapter localiza a
// tabela pelo NOME DO MODELO (user, session, account, verification, twoFactor,
// rateLimit) e a coluna pela chave JS (camelCase): por isso o app passa
// `authSchema` (abaixo) ao drizzleAdapter.
//
// Sem RLS: o Better Auth lê e grava estas tabelas fora de contexto de tenant
// (login, sessão, rate limit). Dados de negócio continuam barrados pelas
// policies das tabelas de tenant.
// O plugin organization NÃO é registrado: organização e tenant são do Meuproduto.

const criadoEm = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const atualizadoEm = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: criadoEm(),
  updatedAt: atualizadoEm(),
  /** Plugin twoFactor. */
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  /** Senha provisória (bootstrap, convite): pede troca no primeiro acesso. */
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  /** Versão dos termos aceita: mudou o texto, pede o aceite de novo. */
  termsVersion: text("terms_version"),
  /** Quando a pessoa aceitou os termos e a política de privacidade. */
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
});

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: criadoEm(),
    updatedAt: atualizadoEm(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)]
);

export const accounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    /** Para o provider "credential", igual ao user.id. */
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    /** Hash scrypt do better-auth/crypto (`salt:hash`), só no "credential". */
    password: text("password"),
    createdAt: criadoEm(),
    updatedAt: atualizadoEm(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)]
);

export const verifications = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: criadoEm(),
    updatedAt: atualizadoEm(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)]
);

/** Plugin twoFactor: segredo TOTP e códigos de recuperação (cifrados pela lib). */
export const twoFactors = pgTable(
  "two_factor",
  {
    id: text("id").primaryKey(),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    verified: boolean("verified").notNull().default(true),
    failedVerificationCount: integer("failed_verification_count")
      .notNull()
      .default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
  },
  (t) => [
    index("two_factor_secret_idx").on(t.secret),
    index("two_factor_user_id_idx").on(t.userId),
  ]
);

/**
 * Contador do rate limit do Better Auth (`rateLimit.storage: "database"`).
 * No banco porque o app roda em várias instâncias: contador em memória zera a
 * cada instância fria e não limita nada (docs/produto/04, brute force).
 * `last_request` é epoch em milissegundos.
 */
export const rateLimits = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

/**
 * Mapa modelo → tabela para
 * `drizzleAdapter(db, { provider: "pg", schema: authSchema })`.
 */
export const authSchema = {
  user: users,
  session: sessions,
  account: accounts,
  verification: verifications,
  twoFactor: twoFactors,
  rateLimit: rateLimits,
};

export type User = typeof users.$inferSelect;
