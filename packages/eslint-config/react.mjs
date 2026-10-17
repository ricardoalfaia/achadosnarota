import reactHooks from "eslint-plugin-react-hooks";

import { base } from "./base.mjs";

export const react = [
  ...base,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
];
