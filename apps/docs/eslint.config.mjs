import { boundaries } from "@meuproduto/eslint-config/boundaries";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  boundaries,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Gerado pelo fumadocs-mdx a partir de content/docs.
    ".source/**",
  ]),
]);

export default eslintConfig;
