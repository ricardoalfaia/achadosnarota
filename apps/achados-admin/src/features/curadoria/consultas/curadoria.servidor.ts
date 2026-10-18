import "server-only";

import { unwrapOrThrow } from "@achados/core";

import { clienteDoPedido } from "@/shared/consultas/cliente.servidor";
import {
  casasParaAvaliacao,
  lerAvaliacao,
  listarAvaliacoes,
} from "../consultas.servidor";
import {
  opcoesDaAvaliacao,
  opcoesDaListaDeAvaliacoes,
  opcoesDasCasasDaCuradoria,
} from "./curadoria";

// Prefetch no QueryClient do pedido; falha não lança (o DataBoundary mostra).

export async function prefetchDaListaDeAvaliacoes() {
  await clienteDoPedido().prefetchQuery({
    ...opcoesDaListaDeAvaliacoes(),
    queryFn: async () => unwrapOrThrow(await listarAvaliacoes()),
  });
}

export async function prefetchDaAvaliacao(id: string | null) {
  await Promise.all([
    id
      ? clienteDoPedido().prefetchQuery({
          ...opcoesDaAvaliacao(id),
          queryFn: async () => unwrapOrThrow(await lerAvaliacao(id)),
        })
      : null,
    clienteDoPedido().prefetchQuery({
      ...opcoesDasCasasDaCuradoria(),
      queryFn: async () => unwrapOrThrow(await casasParaAvaliacao()),
    }),
  ]);
}
