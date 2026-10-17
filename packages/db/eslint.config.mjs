import { base } from "@meuproduto/eslint-config/base";

export default [
  ...base,
  // Scripts de operação rodam direto no Node (setup do papel da app).
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: { process: "readonly", console: "readonly", URL: "readonly" },
    },
  },
];
