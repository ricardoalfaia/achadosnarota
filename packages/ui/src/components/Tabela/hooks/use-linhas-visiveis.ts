import { useEffect, useEffectEvent, useRef, type RefObject } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { ALTURA_DA_LINHA, ALTURA_DO_CABECALHO } from "../apresentacao";

/** Linhas antes do fim em que a próxima página é pedida. */
const LIMIAR_DO_FIM = 20;

/**
 * Das `total` linhas, quais cabem na área de rolagem agora. Só essas vão para a
 * tela. Quando a rolagem chega perto do fim, pede a próxima página.
 */
export function useLinhasVisiveis({
  total,
  alturaDaLinha = ALTURA_DA_LINHA,
  aoChegarAoFim,
  carregandoMais,
}: {
  total: number;
  alturaDaLinha?: number;
  aoChegarAoFim?: () => void;
  carregandoMais: boolean;
}): {
  /** Ligar ao elemento que rola. */
  rolagem: RefObject<HTMLDivElement | null>;
  /** Posição na lista e distância do topo de cada linha visível. */
  visiveis: readonly { indice: number; inicio: number }[];
  /** Altura de todas as linhas juntas, para a barra de rolagem ter o tamanho certo. */
  alturaTotal: number;
} {
  const rolagem = useRef<HTMLDivElement>(null);
  const virtual = useVirtualizer({
    count: total,
    getScrollElement: () => rolagem.current,
    estimateSize: () => alturaDaLinha,
    overscan: 10,
    scrollPaddingStart: ALTURA_DO_CABECALHO,
  });
  const itens = virtual.getVirtualItems();

  const ultimaVisivel = itens.at(-1)?.index ?? -1;
  const pertoDoFim = total > 0 && ultimaVisivel >= total - LIMIAR_DO_FIM;

  // O efeito reage a chegar perto do fim e ao término de uma carga. Quem usa
  // pode passar uma função nova a cada desenho sem disparar o pedido de novo.
  const pedirMais = useEffectEvent(() => aoChegarAoFim?.());
  useEffect(() => {
    if (pertoDoFim && !carregandoMais) pedirMais();
  }, [pertoDoFim, carregandoMais, total]);

  return {
    rolagem,
    visiveis: itens.map((item) => ({ indice: item.index, inicio: item.start })),
    alturaTotal: virtual.getTotalSize(),
  };
}
