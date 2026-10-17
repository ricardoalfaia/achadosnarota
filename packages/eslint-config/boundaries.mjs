export const boundaries = {
  files: ["**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@meuproduto/*/src", "@meuproduto/*/src/**", "apps/**"],
            message:
              "Consuma o contrato público do pacote; aplicações não são bibliotecas.",
          },
        ],
      },
    ],
    "no-restricted-syntax": [
      "error",
      {
        selector: "TSTypeAliasDeclaration[id.name='Result']",
        message: "Result é definido apenas no core canônico @meuproduto/core.",
      },
      {
        selector: "TSInterfaceDeclaration[id.name='Result']",
        message: "Não crie outro contrato Result; importe @meuproduto/core.",
      },
    ],
  },
};
