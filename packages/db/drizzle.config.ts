import { defineConfig } from "drizzle-kit";

import { carregarEnv } from "../../scripts/load-env.mjs";

// Migrations rodam como DONO do schema (DATABASE_URL_ADMIN). A aplicação usa
// DATABASE_URL, que aponta para o papel achados_app, sujeito a RLS.
// Sem fallback para DATABASE_URL: migrar com o papel da app falharia no meio
// (ele não pode criar tabelas) e esconderia a configuração errada.
carregarEnv({ silencioso: true });

const url = process.env.DATABASE_URL_ADMIN;
if (!url) throw new Error("DATABASE_URL_ADMIN não definida.");

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: { url },
  // O papel achados_app é criado fora das migrations (pgRole(...).existing()).
  entities: { roles: { provider: "", exclude: ["achados_app"] } },
  strict: true,
  verbose: true,
});
