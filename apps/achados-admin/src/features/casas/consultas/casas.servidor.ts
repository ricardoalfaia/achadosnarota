import "server-only";

import { unwrapOrThrow } from "@achados/core";

import { clienteDoPedido } from "@/shared/consultas/cliente.servidor";
import {
  lerCasa,
  opcoesDoCatalogo as lerOpcoesDoCatalogo,
  listarCasas,
} from "../consultas.servidor";
import { opcoesDaCasa, opcoesDaListaDeCasas, opcoesDoCatalogo } from "./casas";

// Prefetch no QueryClient do pedido: a tela chega pronta no HTML e o Query
// do navegador começa com o dado hidratado. Uma falha não derruba a página:
// o prefetch não lança, e quem mostra o erro é o DataBoundary da região,
// quando o `useSuspenseQuery` tentar de novo no navegador.

export async function prefetchDaListaDeCasas() {
  await clienteDoPedido().prefetchQuery({
    ...opcoesDaListaDeCasas(),
    queryFn: async () => unwrapOrThrow(await listarCasas()),
  });
}

export async function prefetchDaCasa(id: string) {
  await Promise.all([
    clienteDoPedido().prefetchQuery({
      ...opcoesDaCasa(id),
      queryFn: async () => unwrapOrThrow(await lerCasa(id)),
    }),
    prefetchDoCatalogo(),
  ]);
}

export async function prefetchDoCatalogo() {
  await clienteDoPedido().prefetchQuery({
    ...opcoesDoCatalogo(),
    queryFn: async () => unwrapOrThrow(await lerOpcoesDoCatalogo()),
  });
}
