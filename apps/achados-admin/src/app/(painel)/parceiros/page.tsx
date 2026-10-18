import type { Metadata } from "next";

import { PaginaEmConstrucao } from "@/shared/casca/pagina-em-construcao";

export const metadata: Metadata = { title: "Parceiros" };

export default function Pagina() {
  return (
    <PaginaEmConstrucao
      id="parceiros"
      secao="Comercial"
      descricao="Organizações parceiras, contratos e os operadores que validam o código de resgate no balcão."
    />
  );
}
