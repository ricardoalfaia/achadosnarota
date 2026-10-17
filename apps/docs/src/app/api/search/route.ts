import { createFromSource } from "fumadocs-core/search/server";

import { conteudo } from "@/shared/conteudo";

// Índice de busca montado a partir das páginas, filtrado pelo idioma de quem busca.
export const { GET } = createFromSource(conteudo);
