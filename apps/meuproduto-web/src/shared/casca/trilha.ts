import { itemDaRota, type IdEmConstrucao } from "./navegacao";

// A trilha (breadcrumb) do conteúdo: "Início › Documentos". Na página inicial
// não aparece, como no mockup; fora do menu também não.

export type Trilha =
  | { tipo: "inicio" }
  | { tipo: "item"; id: IdEmConstrucao }
  | { tipo: "desconhecida" };

export function trilhaDoCaminho(slug: string, caminho: string): Trilha {
  const item = itemDaRota(slug, caminho);
  if (!item) return { tipo: "desconhecida" };
  return item.id === "inicio"
    ? { tipo: "inicio" }
    : { tipo: "item", id: item.id };
}
