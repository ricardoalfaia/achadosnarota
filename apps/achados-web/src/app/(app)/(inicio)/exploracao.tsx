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
  type VitrineDoCatalogo,
} from "@/features/catalogo";
import { BotaoDeFavorito } from "@/features/favoritos";
import type { Plano } from "@/features/passaporte";
import { HeroDesktop } from "./hero-desktop";

/**
 * A exploração. No celular (protótipo `pwa.html`): busca, categorias, o
 * cartão "Descubra" e os destaques. A partir de 1024px (protótipo
 * `index.html`): o topo com a foto da estrada e os destaques em grade. O
 * filtro mora na URL e muda no lugar; a lista vem do cache do Query.
 */
export function Exploracao({
  categorias,
  cidades,
  vitrine,
  plano,
}: {
  categorias: readonly Categoria[];
  cidades: readonly Cidade[];
  vitrine: VitrineDoCatalogo;
  plano: Plano | null;
}) {
  const { filtro, propsDoLink } = useFiltroDoCatalogo();
  const filtrando = !semFiltro(filtro);

  return (
    <>
      <div className="hidden lg:block">
        <HeroDesktop
          categorias={categorias}
          cidades={cidades}
          vitrine={vitrine}
          plano={plano}
        />
      </div>

      <div className="flex flex-col gap-4 p-4 lg:hidden">
        <h1 className="sr-only">Explorar lugares</h1>
        <BarraDeBusca cidades={cidades} />
        <FiltroDeCategorias categorias={categorias} />
        {!filtrando && <CartaoDescubra />}
      </div>

      <section
        id="destaques"
        aria-labelledby="titulo-destaques"
        className="px-4 lg:mx-auto lg:max-w-7xl lg:scroll-mt-24 lg:px-8 lg:py-16"
      >
        <div className="mb-3 flex items-center justify-between lg:mb-10 lg:items-end">
          <div>
            <span className="mb-2 hidden h-1 w-12 rounded-full bg-brand lg:block" />
            <h2
              id="titulo-destaques"
              className="text-sm font-extrabold text-foreground lg:text-3xl lg:tracking-tight"
            >
              {filtrando ? "Lugares encontrados" : "Destaques da Rota"}
            </h2>
            <p className="mt-1 hidden text-sm text-foreground-muted lg:block">
              Os lugares mais bem avaliados pela curadoria, para quem viaja e
              busca o melhor.
            </p>
          </div>
          {filtrando && (
            <a
              {...propsDoLink({
                categoria: undefined,
                cidade: undefined,
                busca: undefined,
              })}
              className="flex items-center gap-1 text-[11px] font-bold text-primary lg:text-sm"
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
    </>
  );
}
