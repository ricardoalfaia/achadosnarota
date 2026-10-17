"use client";

import { DataBoundary } from "@achados/data-boundary";
import { ArrowRight } from "lucide-react";

import {
  BarraDeBusca,
  CartaoDescubra,
  DestaquesDaRota,
  EsqueletoDaLista,
  FiltroDeCategorias,
  semFiltro,
  useFiltroDoCatalogo,
  type Categoria,
  type Cidade,
} from "@/features/catalogo";
import { BotaoDeFavorito } from "@/features/favoritos";

/**
 * A exploração (protótipo, tela 1): busca, categorias, o cartão "Descubra" e
 * os destaques. O filtro mora na URL e muda no lugar, sem pedir a página ao
 * servidor; a lista vem do cache do Query, hidratado pelo servidor.
 */
export function Exploracao({
  categorias,
  cidades,
}: {
  categorias: readonly Categoria[];
  cidades: readonly Cidade[];
}) {
  const { filtro, propsDoLink } = useFiltroDoCatalogo();
  const filtrando = !semFiltro(filtro);

  return (
    <div className="flex flex-col gap-4 p-4">
      <BarraDeBusca cidades={cidades} />
      <FiltroDeCategorias categorias={categorias} />
      {!filtrando && <CartaoDescubra />}

      <section aria-labelledby="titulo-destaques">
        <div className="mb-3 flex items-center justify-between">
          <h1
            id="titulo-destaques"
            className="text-sm font-extrabold text-foreground"
          >
            {filtrando ? "Lugares encontrados" : "Destaques da Rota"}
          </h1>
          {filtrando && (
            <a
              {...propsDoLink({
                categoria: undefined,
                cidade: undefined,
                busca: undefined,
              })}
              className="flex items-center gap-1 text-[11px] font-bold text-primary"
            >
              Ver todos
              <ArrowRight aria-hidden="true" className="size-3" />
            </a>
          )}
        </div>
        <DataBoundary fallback={<EsqueletoDaLista />}>
          <DestaquesDaRota
            filtro={filtro}
            favoritoDe={(lugar) => (
              <BotaoDeFavorito slug={lugar.slug} nome={lugar.nome} />
            )}
          />
        </DataBoundary>
      </section>
    </div>
  );
}
