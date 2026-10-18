import type { Metadata } from "next";

import { PaginaEmConstrucao } from "@/shared/casca/pagina-em-construcao";

export const metadata: Metadata = { title: "Assinantes" };

export default function Pagina() {
  return (
    <PaginaEmConstrucao
      id="assinantes"
      secao="Gestão"
      descricao="Passaportes, situação da assinatura e pedidos de privacidade, com dados mínimos."
    />
  );
}
