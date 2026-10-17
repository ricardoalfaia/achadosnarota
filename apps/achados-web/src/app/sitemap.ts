import type { MetadataRoute } from "next";

import { slugsPublicados } from "@/features/catalogo/servidor";
import { ambienteServidor } from "@/shared/config/ambiente.servidor";
import { rotaDoLugar, ROTAS } from "@/shared/rotas";

/** Refeito a cada hora: lugar publicado entra sem novo deploy. */
export const revalidate = 3600;

/** As páginas públicas: início, passaporte e a ficha de cada lugar publicado. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { appUrl } = ambienteServidor();
  const slugs = await slugsPublicados();
  return [
    {
      url: `${appUrl}${ROTAS.explorar}`,
      changeFrequency: "daily",
      priority: 1,
    },
    { url: `${appUrl}${ROTAS.passaporte}`, changeFrequency: "weekly" },
    ...(slugs.ok ? slugs.value : []).map((slug) => ({
      url: `${appUrl}${rotaDoLugar(slug)}`,
      changeFrequency: "weekly" as const,
    })),
  ];
}
