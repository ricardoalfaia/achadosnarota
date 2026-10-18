import type { Metadata } from "next";

import { PaginaEmConstrucao } from "@/shared/casca/pagina-em-construcao";

export const metadata: Metadata = { title: "Resgates" };

export default function Pagina() {
  return (
    <PaginaEmConstrucao
      id="resgates"
      secao="Comercial"
      descricao="Acompanhamento dos resgates por casa e por promoção, sem expor o código completo."
    />
  );
}
