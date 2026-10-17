import { Esqueleto } from "@achados/ui";

import { EsqueletoDeLinhas } from "@/features/catalogo";

/** O passaporte carregando: barra, cartão, números e cupons. */
export default function CarregandoPassaporte() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando o passaporte"
      className="flex flex-col gap-4 p-4"
    >
      <div className="flex items-center justify-between">
        <Esqueleto className="size-8 rounded-full" />
        <Esqueleto className="h-5 w-36" />
        <span className="size-8" />
      </div>
      <Esqueleto className="h-56 rounded-3xl" />
      <Esqueleto className="h-16 rounded-2xl" />
      <Esqueleto className="h-10 rounded-full" />
      <EsqueletoDeLinhas />
    </div>
  );
}
