import { Esqueleto } from "@achados/ui";

import { EsqueletoDeLinhas } from "@/features/catalogo";

/** Favoritos carregando: o título e as linhas na forma final. */
export default function CarregandoFavoritos() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando favoritos"
      className="p-4 pt-20"
    >
      <Esqueleto className="mb-4 h-5 w-40" />
      <EsqueletoDeLinhas />
    </div>
  );
}
