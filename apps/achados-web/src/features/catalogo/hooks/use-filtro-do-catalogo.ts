"use client";

import { useMemo, type MouseEvent } from "react";
import { useSearchParams } from "next/navigation";

import {
  aplicarMudanca,
  hrefDoFiltro,
  lerFiltro,
  type MudancaDoFiltro,
} from "../domain/filtro";
import type { FiltroDoCatalogo } from "../domain/tipos";

type Historico = "empurrar" | "substituir";

/** Clique comum: sem tecla de abrir em outra aba nem botão do meio. */
function cliqueSimples(evento: MouseEvent) {
  return (
    evento.button === 0 &&
    !evento.metaKey &&
    !evento.ctrlKey &&
    !evento.shiftKey &&
    !evento.altKey
  );
}

/**
 * O filtro da exploração, com a URL como dona (P07). Mudar o filtro troca a
 * URL pela History API, sem pedir a página ao servidor: a lista vem do cache
 * do Query ou do BFF. Categoria e cidade entram no histórico (o voltar do
 * celular desfaz); a busca substitui, para não empilhar uma entrada por letra.
 */
export function useFiltroDoCatalogo() {
  const parametros = useSearchParams();
  const filtro = useMemo<FiltroDoCatalogo>(
    () => lerFiltro(Object.fromEntries(parametros)),
    [parametros]
  );

  function mudar(mudanca: MudancaDoFiltro, historico: Historico = "empurrar") {
    const href = hrefDoFiltro(filtro, mudanca);
    if (historico === "empurrar") window.history.pushState(null, "", href);
    else window.history.replaceState(null, "", href);
  }

  /**
   * As props de um link de filtro: o `href` real (funciona sem JavaScript e
   * abre em outra aba) e o clique que troca o filtro no lugar.
   */
  function propsDoLink(mudanca: MudancaDoFiltro) {
    const href = hrefDoFiltro(filtro, mudanca);
    const ativo = href === hrefDoFiltro(filtro, {});
    return {
      href,
      "aria-current": ativo ? ("page" as const) : undefined,
      onClick: (evento: MouseEvent<HTMLAnchorElement>) => {
        if (!cliqueSimples(evento)) return;
        evento.preventDefault();
        mudar(mudanca);
      },
    };
  }

  return {
    filtro,
    mudar,
    propsDoLink,
    /** O filtro que resultaria da mudança, sem aplicá-la. */
    comMudanca: (mudanca: MudancaDoFiltro) => aplicarMudanca(filtro, mudanca),
  };
}
