import type { Metadata } from "next";

import { PaginaEmConstrucao } from "@/shared/casca/pagina-em-construcao";

export const metadata: Metadata = { title: "Configurações" };

export default function Pagina() {
  return (
    <PaginaEmConstrucao
      id="configuracoes"
      secao="Gestão"
      descricao="Cidades, categorias, critérios da curadoria e a equipe do painel."
    />
  );
}
