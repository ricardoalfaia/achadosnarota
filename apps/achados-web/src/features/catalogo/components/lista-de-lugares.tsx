import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { EstadoVazio } from "@achados/ui";
import { estiloDoBotao } from "@achados/ui/estilos";
import { SearchX } from "lucide-react";

import { ROTAS } from "@/shared/rotas";
import type { CartaoDeLugar as Lugar } from "../domain/tipos";
import { CartaoDeLugar } from "./cartao-de-lugar";

/**
 * A lista de cartões. O favorito de cada cartão vem de quem compõe
 * (`favoritoDe`), para a lista não saber de sessão nem de Action.
 */
export function ListaDeLugares({
  lugares,
  favoritoDe,
}: {
  lugares: readonly Lugar[];
  favoritoDe?: (lugar: Lugar) => ReactNode;
}) {
  if (lugares.length === 0) {
    return (
      <EstadoVazio
        icone={<SearchX />}
        titulo="Nenhum lugar encontrado"
        descricao="Tente outra cidade, categoria ou tipo de culinária."
        acao={
          <Link
            href={ROTAS.explorar}
            className={estiloDoBotao({ variante: "solido", tamanho: "xs" })}
          >
            Ver todos os lugares
          </Link>
        }
      />
    );
  }
  return (
    <ul className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
      {lugares.map((lugar, indice) => (
        <li
          key={lugar.slug}
          style={{ "--ordem": indice } as CSSProperties}
          className="animate-entrar"
        >
          <CartaoDeLugar
            lugar={lugar}
            prioridade={indice === 0}
            {...(favoritoDe ? { favorito: favoritoDe(lugar) } : {})}
          />
        </li>
      ))}
    </ul>
  );
}

/** Enquanto a lista carrega: três cartões na forma final. */
export function EsqueletoDaLista() {
  return (
    <ul
      aria-busy="true"
      aria-label="Carregando lugares"
      className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-6 xl:grid-cols-4"
    >
      {[0, 1, 2, 3].map((i) => (
        <li
          key={i}
          className="overflow-hidden rounded-3xl bg-surface ring-1 ring-border/60"
        >
          <div className="h-52 animate-pulse bg-surface-hover" />
          <div className="flex flex-col gap-2 p-3">
            <div className="h-3.5 w-1/2 animate-pulse rounded bg-surface-hover" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-surface-hover" />
            <div className="h-9 animate-pulse rounded-xl bg-surface-hover" />
          </div>
        </li>
      ))}
    </ul>
  );
}
