import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@meuproduto/core",
    "@meuproduto/ui",
    "@meuproduto/data-boundary",
  ],
  turbopack: {
    root: fileURLToPath(new URL("../..", import.meta.url)),
  },
};

// Liga o next-intl à configuração de idioma por pedido, em src/i18n/request.ts.
const comTraducoes = createNextIntlPlugin();

export default comTraducoes(nextConfig);
