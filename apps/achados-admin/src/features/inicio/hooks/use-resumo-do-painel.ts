"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { opcoesDoResumo } from "../consultas/resumo";
import type { FilaDeTrabalho } from "../domain/tipos";

export type AbaDaFila = keyof FilaDeTrabalho;

/** Os indicadores do início, pelo Query com Suspense. */
export function useIndicadores() {
  return useSuspenseQuery({
    ...opcoesDoResumo(),
    select: (resumo) => resumo.indicadores,
  }).data;
}

/**
 * A fila de trabalho e a aba escolhida. A aba é estado local: as abas da
 * fila ficam vivas com `Activity` ao trocar (ADR-0016), então a rolagem de
 * cada uma continua onde estava.
 */
export function useFilaDeTrabalho() {
  const fila = useSuspenseQuery({
    ...opcoesDoResumo(),
    select: (resumo) => resumo.fila,
  }).data;
  const [aba, setAba] = useState<AbaDaFila>("curadoria");
  return { fila, aba, mudarAba: setAba };
}
