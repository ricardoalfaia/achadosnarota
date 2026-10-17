import "server-only";

import { cache } from "react";
import { dehydrate, type QueryClient } from "@tanstack/react-query";

import { criarClienteDeConsultas } from "./cliente";

/**
 * Um QueryClient por pedido no servidor (ADR-0006, seção 4): o prefetch de uma
 * pessoa nunca vaza para o pedido de outra. As regiões da página fazem
 * prefetch nele e passam o estado desidratado ao HydrationBoundary.
 */
export const clienteDoPedido = cache((): QueryClient => {
  return criarClienteDeConsultas();
});

/** O estado das consultas já buscadas neste pedido, para o HydrationBoundary. */
export function estadoDesidratado() {
  return dehydrate(clienteDoPedido());
}
