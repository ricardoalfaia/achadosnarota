import { defineConfig } from "vitest/config";

import { carregarEnv } from "../../scripts/load-env.mjs";

// `pnpm test` (inclusive via turbo) também enxerga o banco local: process.env
// > .env.local da raiz > padrões de dev do docker-compose.
carregarEnv({ silencioso: true });

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
