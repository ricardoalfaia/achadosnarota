import { useRef } from "react";

import { useValorControlavel } from "../../../hooks/use-valor-controlavel";

const NENHUMA: ReadonlySet<string> = new Set();

export type SelecaoDeLinhas = {
  marcadas: ReadonlySet<string>;
  /** Todas as linhas exibidas estão marcadas. */
  todas: boolean;
  /** Marca ou desmarca uma linha; com Shift, o intervalo desde a última marcada. */
  alternar: (id: string, indice: number, comShift: boolean) => void;
  marcarTodas: (marcar: boolean) => void;
  limpar: () => void;
};

/**
 * Quais linhas estão marcadas. A seleção é de quem usa a tabela, se vier
 * controlada (`selecionadas`); senão, fica guardada aqui.
 */
export function useSelecaoDeLinhas({
  linhas,
  selecionadas,
  aoMudarSelecao,
}: {
  /** As linhas exibidas, na ordem da tela: é sobre elas que o intervalo e o "todas" valem. */
  linhas: readonly { id: string }[];
  selecionadas?: ReadonlySet<string>;
  aoMudarSelecao?: (ids: ReadonlySet<string>) => void;
}): SelecaoDeLinhas {
  const [marcadas, mudar] = useValorControlavel<ReadonlySet<string>>(
    selecionadas,
    NENHUMA,
    aoMudarSelecao
  );
  const ultimaMarcada = useRef<number | null>(null);

  return {
    marcadas,
    todas: linhas.length > 0 && marcadas.size === linhas.length,

    alternar: (id, indice, comShift) => {
      const proximas = new Set(marcadas);
      const marcar = !proximas.has(id);
      const de = comShift ? (ultimaMarcada.current ?? indice) : indice;
      for (let i = Math.min(de, indice); i <= Math.max(de, indice); i++) {
        const daFaixa = linhas[i]?.id;
        if (daFaixa === undefined) continue;
        if (marcar) proximas.add(daFaixa);
        else proximas.delete(daFaixa);
      }
      ultimaMarcada.current = indice;
      mudar(proximas);
    },

    marcarTodas: (marcar) => {
      ultimaMarcada.current = null;
      mudar(marcar ? new Set(linhas.map((linha) => linha.id)) : NENHUMA);
    },

    limpar: () => {
      ultimaMarcada.current = null;
      mudar(NENHUMA);
    },
  };
}
