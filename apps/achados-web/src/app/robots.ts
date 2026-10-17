import type { MetadataRoute } from "next";

import { ambienteServidor } from "@/shared/config/ambiente.servidor";
import { configuracaoDoApp } from "@/shared/config/configuracao";

/**
 * Só produção é indexável. Homologação e local pedem para não indexar nada,
 * para dado de teste não aparecer em busca.
 */
export default function robots(): MetadataRoute.Robots {
  const { appUrl } = ambienteServidor();
  if (configuracaoDoApp.ambiente !== "production")
    return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/login",
        "/cadastro",
        "/favoritos",
        "/perfil",
        "/offline",
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
