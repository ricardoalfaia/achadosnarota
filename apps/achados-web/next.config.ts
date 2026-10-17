import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  transpilePackages: ["@achados/core", "@achados/ui", "@achados/data-boundary"],
  turbopack: {
    root: fileURLToPath(new URL("../..", import.meta.url)),
  },
  images: {
    // Fotos do catálogo em formatos modernos, nos tamanhos da coluna do app.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 480, 640, 828, 1080],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // O service worker nunca fica em cache do navegador: a versão nova
        // vale na próxima visita.
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

// Liga o next-intl à configuração de idioma por pedido, em src/i18n/request.ts.
const comTraducoes = createNextIntlPlugin();

export default comTraducoes(nextConfig);
