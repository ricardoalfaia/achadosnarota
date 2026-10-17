"use client";

import type { ReactNode } from "react";
import { cn } from "@achados/ui/estilos";

import type { CartaoDeLugar, FiltroDoCatalogo } from "../domain/tipos";
import { useLugares } from "../hooks/use-lugares";
import { ListaDeLugares } from "./lista-de-lugares";

/**
 * A lista de destaques do filtro atual. Suspende na primeira carga (o
 * DataBoundary em volta mostra o esqueleto e o erro); nas trocas de filtro, a
 * lista atual fica, esmaecida, até a nova chegar.
 */
export function DestaquesDaRota({
  filtro,
  favoritoDe,
}: {
  filtro: FiltroDoCatalogo;
  /** O botão de favoritar de cada cartão, composto por quem usa a lista. */
  favoritoDe: (lugar: CartaoDeLugar) => ReactNode;
}) {
  const { lugares, atualizando } = useLugares(filtro);
  return (
    <div
      aria-busy={atualizando}
      className={cn(
        "transition-opacity duration-200",
        atualizando && "opacity-60"
      )}
    >
      <ListaDeLugares lugares={lugares} favoritoDe={favoritoDe} />
    </div>
  );
}
