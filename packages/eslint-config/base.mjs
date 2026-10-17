import js from "@eslint/js";
import tseslint from "typescript-eslint";

import { boundaries } from "./boundaries.mjs";

export const base = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  boundaries,
];
