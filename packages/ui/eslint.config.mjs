import { react } from "@achados/eslint-config/react";

export default [
  ...react,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message: "Transporte HTTP pertence ao adaptador da funcionalidade.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@achados/*/src/**",
                "apps/**",
                "@/features/**",
                "@/server/**",
                "@tanstack/react-query",
                "@tanstack/query-*",
                "next",
                "next/**",
              ],
              message:
                "UI genérica não importa aplicação, transporte, Query ou Next.",
            },
          ],
        },
      ],
    },
  },
];
