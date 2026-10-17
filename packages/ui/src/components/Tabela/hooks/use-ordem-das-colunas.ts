import { useMemo, useState } from "react";

import type { ColunaDaTabela } from "../tipos";
import { moverColuna } from "../valores";

/** O arrastar e soltar de um título de coluna. */
export type ArrastoDeColuna<T> = {
  /** `id` da coluna que está sendo arrastada. */
  arrastada: string | null;
  /** `id` da coluna sobre a qual ela está agora. */
  alvo: string | null;
  iniciar: (coluna: string) => void;
  passarSobre: (coluna: string) => void;
  soltarSobre: (coluna: ColunaDaTabela<T>) => void;
  encerrar: () => void;
};

/**
 * A ordem em que as colunas aparecem: as fixas primeiro, depois as demais, cada
 * grupo na ordem que a pessoa escolheu arrastando os títulos.
 */
export function useOrdemDasColunas<T>(colunas: readonly ColunaDaTabela<T>[]): {
  ordenadas: readonly ColunaDaTabela<T>[];
  arrasto: ArrastoDeColuna<T>;
} {
  const [ordem, setOrdem] = useState(() => colunas.map((coluna) => coluna.id));
  const [arrastada, setArrastada] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<string | null>(null);

  const ordenadas = useMemo(() => {
    const porId = new Map(colunas.map((coluna) => [coluna.id, coluna]));
    // Colunas novas, que ainda não têm posição escolhida, entram no fim.
    const ids = [
      ...ordem.filter((id) => porId.has(id)),
      ...colunas.map((coluna) => coluna.id).filter((id) => !ordem.includes(id)),
    ];
    const presentes = ids.flatMap((id) => porId.get(id) ?? []);
    return [
      ...presentes.filter((coluna) => coluna.fixa),
      ...presentes.filter((coluna) => !coluna.fixa),
    ];
  }, [colunas, ordem]);

  function encerrar() {
    setArrastada(null);
    setAlvo(null);
  }

  return {
    ordenadas,
    arrasto: {
      arrastada,
      alvo,
      iniciar: setArrastada,
      passarSobre: (coluna) => {
        if (alvo !== coluna) setAlvo(coluna);
      },
      soltarSobre: (sobre) => {
        const movida = ordenadas.find((coluna) => coluna.id === arrastada);
        // Só troca de lugar dentro do mesmo grupo: fixas com fixas, livres com livres.
        if (movida && Boolean(movida.fixa) === Boolean(sobre.fixa)) {
          setOrdem(
            moverColuna(
              ordenadas.map((coluna) => coluna.id),
              movida.id,
              sobre.id
            )
          );
        }
        encerrar();
      },
      encerrar,
    },
  };
}
