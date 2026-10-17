"use client";

import { cn } from "@achados/ui/estilos";
import { MapPin } from "lucide-react";

import type { Cidade } from "../domain/tipos";
import { useFiltroDoCatalogo } from "../hooks/use-filtro-do-catalogo";

/**
 * Atalhos para as cidades já avaliadas, logo abaixo da busca do topo: um
 * clique filtra a lista, sem precisar abrir o diálogo de filtros.
 */
export function AtalhosDeCidade({
  cidades,
  limite = 3,
}: {
  cidades: readonly Cidade[];
  limite?: number;
}) {
  const { filtro, propsDoLink } = useFiltroDoCatalogo();
  if (cidades.length === 0) return null;
  return (
    <nav
      aria-label="Cidades avaliadas"
      className="flex flex-wrap items-center gap-2 text-sm"
    >
      <span className="font-semibold text-white/70">Cidades:</span>
      {cidades.slice(0, limite).map((cidade) => {
        const ativa = filtro.cidade === cidade.slug;
        return (
          <a
            key={cidade.slug}
            {...propsDoLink({ cidade: ativa ? undefined : cidade.slug })}
            aria-current={ativa ? "true" : undefined}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 font-semibold transition-colors outline-none focus-visible:outline-2 focus-visible:outline-white [&_svg]:size-3",
              ativa
                ? "border-transparent bg-white text-[var(--ar-asfalto-900)]"
                : "border-white/25 text-white hover:border-white/60 hover:bg-white/10"
            )}
          >
            <MapPin aria-hidden="true" />
            {cidade.nome}
          </a>
        );
      })}
    </nav>
  );
}
