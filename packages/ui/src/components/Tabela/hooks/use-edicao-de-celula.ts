import { useState } from "react";

import type { ColunaDaTabela, EdicaoDeCelula } from "../tipos";
import { interpretarEdicao } from "../valores";

/** Para onde a edição segue depois de confirmar: Tab leva à próxima célula editável. */
export type Seguir = "ficar" | "proxima" | "anterior";

export type EdicaoNaTabela<T> = {
  /** A célula em edição; só uma por vez. */
  celula: { linha: string; coluna: string } | null;
  /** Por que o último valor foi recusado, para mostrar à pessoa. */
  recusa: string | undefined;
  podeEditar: (coluna: ColunaDaTabela<T>, linha: T) => boolean;
  iniciar: (linha: string, coluna: string) => void;
  /** Devolve o motivo quando o valor é recusado; a célula continua em edição. */
  concluir: (
    linha: T,
    id: string,
    coluna: string,
    texto: string,
    seguir: Seguir
  ) => string | undefined;
  cancelar: (linha: string, coluna: string) => void;
};

/**
 * A edição de células. A tabela não altera os dados: converte o texto digitado
 * para o tipo da coluna e pergunta a quem usa (`aoEditar`) se aceita o valor.
 */
export function useEdicaoDeCelula<T>({
  colunas,
  aoEditar,
  aoSair,
}: {
  /** Na ordem da tela, para o Tab saber qual é a próxima. */
  colunas: readonly ColunaDaTabela<T>[];
  aoEditar?: (edicao: EdicaoDeCelula<T>) => string | undefined | void;
  /** A edição terminou nesta célula: é a hora de devolver o foco a ela. */
  aoSair: (linha: string, coluna: string) => void;
}): EdicaoNaTabela<T> {
  const [celula, setCelula] = useState<EdicaoNaTabela<T>["celula"]>(null);
  const [recusa, setRecusa] = useState<string>();

  function podeEditar(coluna: ColunaDaTabela<T>, linha: T): boolean {
    if (!aoEditar) return false;
    return typeof coluna.editavel === "function"
      ? coluna.editavel(linha)
      : Boolean(coluna.editavel);
  }

  /** O motivo da recusa, ou `undefined` quando o valor foi aceito ou não mudou. */
  function avaliar(
    coluna: ColunaDaTabela<T>,
    linha: T,
    id: string,
    texto: string
  ): string | undefined {
    const tipo = coluna.tipo ?? "texto";
    const valor = interpretarEdicao(texto, tipo);
    if (valor === undefined) {
      return tipo === "numero"
        ? "Digite um número válido."
        : "Digite a data no formato dd/mm/aaaa.";
    }
    if (Object.is(valor, coluna.valor(linha))) return undefined;
    return (
      aoEditar?.({ linha, idDaLinha: id, coluna: coluna.id, valor }) ??
      undefined
    );
  }

  return {
    celula,
    recusa,
    podeEditar,

    iniciar: (linha, coluna) => {
      setRecusa(undefined);
      setCelula({ linha, coluna });
    },

    concluir: (linha, id, colunaId, texto, seguir) => {
      const coluna = colunas.find((item) => item.id === colunaId);
      if (!coluna) return undefined;

      const motivo = avaliar(coluna, linha, id, texto);
      if (motivo) {
        setRecusa(`${coluna.titulo}: ${motivo}`);
        return motivo;
      }
      setRecusa(undefined);

      const editaveis = colunas.filter((item) => podeEditar(item, linha));
      const posicao = editaveis.findIndex((item) => item.id === colunaId);
      const vizinha =
        seguir === "ficar"
          ? undefined
          : editaveis[posicao + (seguir === "proxima" ? 1 : -1)];
      if (vizinha) setCelula({ linha: id, coluna: vizinha.id });
      else {
        setCelula(null);
        aoSair(id, colunaId);
      }
      return undefined;
    },

    cancelar: (linha, coluna) => {
      setRecusa(undefined);
      setCelula(null);
      aoSair(linha, coluna);
    },
  };
}
