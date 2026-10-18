"use client";

import { useDeferredValue, useMemo, useState } from "react";

import {
  contagemPorSituacao,
  filtrarRegistros,
  TODAS,
} from "@/shared/cadastro/filtro";
import {
  comSituacao,
  SITUACOES_DO_BALCAO,
  textoDaCasa,
  type CasaComOperadores,
  type SituacaoDoBalcao,
} from "../domain/balcao";

/**
 * A tela de Parceiros: busca (adiada, para digitar não esperar o filtro),
 * situação, a casa aberta no balcão e a janela de vínculo. As casas vêm do
 * servidor; depois de vincular ou desvincular, a Action revalida a página e
 * elas chegam de novo por aqui.
 */
export function useBalcaoDasCasas(
  casas: readonly CasaComOperadores[],
  situacaoInicial: SituacaoDoBalcao | typeof TODAS
) {
  const lista = useMemo(() => comSituacao(casas), [casas]);
  const [busca, setBusca] = useState("");
  const buscaAdiada = useDeferredValue(busca);
  const [situacao, setSituacao] = useState(situacaoInicial);
  const [idAberto, setIdAberto] = useState<string>();
  const [vinculando, setVinculando] = useState(false);

  const linhas = useMemo(
    () =>
      filtrarRegistros(lista, {
        situacao,
        busca: buscaAdiada,
        textoDe: textoDaCasa,
      }),
    [lista, situacao, buscaAdiada]
  );

  return {
    linhas,
    total: lista.length,
    contagem: contagemPorSituacao(lista, SITUACOES_DO_BALCAO),
    busca,
    mudarBusca: setBusca,
    atualizando: busca !== buscaAdiada,
    situacao,
    mudarSituacao: setSituacao,
    /** A casa aberta, sempre a versão mais recente vinda do servidor. */
    casaAberta: lista.find((casa) => casa.id === idAberto),
    abrirCasa: (casa: CasaComOperadores) => setIdAberto(casa.id),
    fecharCasa: () => setIdAberto(undefined),
    vinculando,
    abrirVinculo: () => setVinculando(true),
    fecharVinculo: () => setVinculando(false),
  };
}
