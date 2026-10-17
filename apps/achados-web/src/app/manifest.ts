import type { MetadataRoute } from "next";

/** O manifesto do PWA: nome, cores da marca e ícones para instalar o app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Achados na Rota",
    short_name: "Achados",
    description:
      "Descubra lugares que valem a pena, com curadoria independente e benefícios para assinantes.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#f15a24",
    categories: ["travel", "food", "lifestyle"],
    icons: [
      {
        src: "/icones/icone-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icones/icone-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icones/icone-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Favoritos", url: "/favoritos" },
      { name: "Meu Passaporte", url: "/passaporte" },
    ],
  };
}
