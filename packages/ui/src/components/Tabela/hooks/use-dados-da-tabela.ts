import { useCallback, useMemo } from "react";
import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnResizingFeature,
  columnSizingFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type Row,
  type RowData,
} from "@tanstack/react-table";

import { LARGURA_MINIMA, LARGURA_PADRAO } from "../apresentacao";
import type { ColunaDaTabela, FiltroDeColuna, ValorDeCelula } from "../tipos";
import { compararValores, filtroEstaVazio, passaNoFiltro } from "../valores";

// Único arquivo da tabela que conhece o TanStack Table. Ele entrega a lógica
// (filtrar, ordenar, valores distintos, larguras) em termos da própria tabela;
// trocar de biblioteca, ou de versão dela, fica contido aqui.

const recursos = tableFeatures({
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  columnFacetingFeature,
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  columnSizingFeature,
  columnResizingFeature,
});

type Recursos = typeof recursos;

export type Direcao = "asc" | "desc";

/** Ordenar por uma coluna. */
export type OrdenacaoDaTabela = {
  de: (coluna: string) => Direcao | false;
  definir: (coluna: string, direcao: Direcao) => void;
  /** O ciclo do clique no título: crescente, decrescente, sem ordem. */
  alternar: (coluna: string) => void;
};

/** Filtrar por coluna. */
export type FiltrosDaTabela = {
  de: (coluna: string) => FiltroDeColuna | undefined;
  aplicar: (coluna: string, filtro: FiltroDeColuna | undefined) => void;
  ativos: number;
  limpar: () => void;
  /** Valores da coluna e quantas linhas têm cada um, já com os outros filtros aplicados. */
  valoresDistintos: (coluna: string) => Map<ValorDeCelula, number>;
};

/** Largura das colunas e o redimensionar pela borda. */
export type LargurasDaTabela = {
  de: (coluna: string) => number;
  /** Função para `onMouseDown` e `onTouchStart` da borda da coluna. */
  aoRedimensionar: (coluna: string) => (evento: unknown) => void;
  redimensionando: (coluna: string) => boolean;
  restaurar: (coluna: string) => void;
};

/**
 * O que a tabela sabe sobre os dados. As linhas vêm separadas das três partes
 * que os componentes recebem (`ordenacao`, `filtros`, `larguras`) de propósito:
 * nenhum componente recebe o conjunto inteiro de linhas como prop. Quando o
 * cabeçalho recebia as 150 mil linhas, cada clique custava segundos em modo de
 * desenvolvimento (ADR-0016).
 */
export type DadosDaTabela<T> = {
  /** As linhas depois dos filtros e da ordenação, na ordem de exibição. */
  linhas: readonly { id: string; original: T }[];
  ordenacao: OrdenacaoDaTabela;
  filtros: FiltrosDaTabela;
  larguras: LargurasDaTabela;
};

export function useDadosDaTabela<T>({
  colunas,
  linhas,
  idDaLinha,
}: {
  colunas: readonly ColunaDaTabela<T>[];
  linhas: readonly T[];
  idDaLinha: (linha: T) => string;
}): DadosDaTabela<T> {
  const definicoes = useMemo<ColumnDef<Recursos, RowData>[]>(
    () =>
      colunas.map((coluna) => ({
        id: coluna.id,
        accessorFn: (linha: RowData) => coluna.valor(linha as T),
        size: coluna.largura ?? LARGURA_PADRAO,
        minSize: coluna.larguraMinima ?? LARGURA_MINIMA,
        enableSorting: !coluna.semOrdenacao,
        enableColumnFilter: !coluna.semFiltro,
        sortUndefined: "last",
        sortFn: (a: Row<Recursos, RowData>, b: Row<Recursos, RowData>) =>
          compararValores(
            a.getValue<ValorDeCelula>(coluna.id),
            b.getValue<ValorDeCelula>(coluna.id)
          ),
        filterFn: (
          linha: Row<Recursos, RowData>,
          id: string,
          filtro: FiltroDeColuna
        ) => passaNoFiltro(linha.getValue<ValorDeCelula>(id), filtro),
      })),
    [colunas]
  );

  // Dados, colunas e identidade precisam manter a referência entre desenhos:
  // se mudarem, a biblioteca refaz o modelo de todas as linhas.
  const dados = useMemo(() => linhas as unknown as RowData[], [linhas]);
  const idDe = useCallback(
    (linha: RowData) => idDaLinha(linha as T),
    [idDaLinha]
  );
  const table = useTable({
    features: recursos,
    columns: definicoes,
    data: dados,
    getRowId: idDe,
    columnResizeMode: "onChange",
  });

  // O estado de filtro e ordenação fica na própria biblioteca. Tratar essas
  // mudanças como transição (`useTransition`), para o clique responder antes do
  // cálculo, ainda não foi decidido: ver o ADR-0016.

  const cabecalhos = new Map(
    table.getFlatHeaders().map((cabecalho) => [cabecalho.column.id, cabecalho])
  );

  return {
    linhas: table.getRowModel().rows as unknown as DadosDaTabela<T>["linhas"],

    ordenacao: {
      de: (coluna) => table.getColumn(coluna)?.getIsSorted() ?? false,
      definir: (coluna, direcao) =>
        table.getColumn(coluna)?.toggleSorting(direcao === "desc"),
      alternar: (coluna) => {
        const logica = table.getColumn(coluna);
        const direcao = logica?.getIsSorted();
        if (direcao === "desc") logica?.clearSorting();
        else logica?.toggleSorting(direcao === "asc");
      },
    },

    filtros: {
      de: (coluna) =>
        table.getColumn(coluna)?.getFilterValue() as FiltroDeColuna | undefined,
      aplicar: (coluna, filtro) =>
        table
          .getColumn(coluna)
          ?.setFilterValue(filtroEstaVazio(filtro) ? undefined : filtro),
      ativos: table.state.columnFilters.length,
      limpar: () => table.resetColumnFilters(true),
      valoresDistintos: (coluna) =>
        table.getColumn(coluna)?.getFacetedUniqueValues() ?? new Map(),
    },

    larguras: {
      de: (coluna) => table.getColumn(coluna)?.getSize() ?? LARGURA_PADRAO,
      aoRedimensionar: (coluna) =>
        cabecalhos.get(coluna)?.getResizeHandler() ?? (() => {}),
      redimensionando: (coluna) =>
        table.getColumn(coluna)?.getIsResizing() ?? false,
      restaurar: (coluna) => table.getColumn(coluna)?.resetSize(),
    },
  };
}
