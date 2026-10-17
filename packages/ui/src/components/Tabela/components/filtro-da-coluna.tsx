import type { RefObject } from "react";

import { textoDe } from "../apresentacao";
import type {
  FiltrosDaTabela,
  OrdenacaoDaTabela,
} from "../hooks/use-dados-da-tabela";
import type { ColunaDaTabela } from "../tipos";
import { chaveDoValor, compararValores } from "../valores";
import { Flutuante } from "./flutuante";
import { MenuDeFiltro, type OpcaoDeFiltro } from "./menu-de-filtro";
import type { OperadorDeCondicao } from "./operadores";

/** Os valores distintos da coluna, em ordem, como a lista do filtro os mostra. */
function opcoesDe<T>(
  coluna: ColunaDaTabela<T>,
  filtros: FiltrosDaTabela
): OpcaoDeFiltro[] {
  return [...filtros.valoresDistintos(coluna.id).entries()]
    .sort(([a], [b]) => compararValores(a, b))
    .map(([valor, total]) => ({
      chave: chaveDoValor(valor),
      rotulo: textoDe(coluna, valor),
      total,
    }));
}

/** O menu de ordenar e filtrar de uma coluna, flutuando sob o título dela. */
export function FiltroDaColuna<T>({
  coluna,
  ordenacao,
  filtros,
  ancora,
  aoAbrirCustomizado,
  aoFechar,
}: {
  coluna: ColunaDaTabela<T>;
  ordenacao: OrdenacaoDaTabela;
  filtros: FiltrosDaTabela;
  ancora: RefObject<HTMLElement | null>;
  /** Fecha o menu e abre o diálogo do filtro customizado da coluna. */
  aoAbrirCustomizado: (operador?: OperadorDeCondicao) => void;
  aoFechar: () => void;
}) {
  return (
    <Flutuante ancora={ancora} aoFechar={aoFechar}>
      <MenuDeFiltro
        titulo={coluna.titulo}
        tipo={coluna.tipo ?? "texto"}
        opcoes={opcoesDe(coluna, filtros)}
        filtro={filtros.de(coluna.id)}
        ordem={ordenacao.de(coluna.id)}
        podeOrdenar={!coluna.semOrdenacao}
        aoOrdenar={(direcao) => {
          ordenacao.definir(coluna.id, direcao);
          aoFechar();
        }}
        aoAplicar={(filtro) => {
          filtros.aplicar(coluna.id, filtro);
          aoFechar();
        }}
        aoAbrirCustomizado={aoAbrirCustomizado}
        aoCancelar={aoFechar}
      />
    </Flutuante>
  );
}
