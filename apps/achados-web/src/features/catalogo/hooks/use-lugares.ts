"use client";

import { useDeferredValue } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { opcoesDosLugares } from "../consultas/lugares";
import { mesmoFiltro } from "../domain/filtro";
import type { FiltroDoCatalogo } from "../domain/tipos";

/**
 * Os lugares do filtro, pelo Query com Suspense. O filtro é adiado
 * (`useDeferredValue`): ao trocar de categoria, a lista atual continua na
 * tela enquanto a nova chega, em vez de piscar o esqueleto; `atualizando`
 * diz que a troca está a caminho. Na primeira carga, quem mostra o esqueleto
 * e o erro é o DataBoundary em volta.
 */
export function useLugares(filtro: FiltroDoCatalogo) {
  const filtroAdiado = useDeferredValue(filtro);
  const { data: lugares } = useSuspenseQuery(opcoesDosLugares(filtroAdiado));
  return { lugares, atualizando: !mesmoFiltro(filtro, filtroAdiado) };
}
