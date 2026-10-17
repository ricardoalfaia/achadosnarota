import { base } from "@achados/eslint-config/base";

export default [
  ...base,
  {
    files: ["src/result.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
];
