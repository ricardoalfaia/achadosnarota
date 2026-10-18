import "server-only";

import { unwrapOrThrow } from "@achados/core";

import { clienteDoPedido } from "@/shared/consultas/cliente.servidor";
import {
  casasParaPromocao,
  lerPromocao,
  listarPromocoes,
} from "../consultas.servidor";
import {
  opcoesDaListaDePromocoes,
  opcoesDaPromocao,
  opcoesDasCasasDaPromocao,
} from "./promocoes";

// Prefetch no QueryClient do pedido; falha não lança (o DataBoundary mostra).

export async function prefetchDaListaDePromocoes() {
  await clienteDoPedido().prefetchQuery({
    ...opcoesDaListaDePromocoes(),
    queryFn: async () => unwrapOrThrow(await listarPromocoes()),
  });
}

export async function prefetchDaPromocao(id: string | null) {
  await Promise.all([
    id
      ? clienteDoPedido().prefetchQuery({
          ...opcoesDaPromocao(id),
          queryFn: async () => unwrapOrThrow(await lerPromocao(id)),
        })
      : null,
    clienteDoPedido().prefetchQuery({
      ...opcoesDasCasasDaPromocao(),
      queryFn: async () => unwrapOrThrow(await casasParaPromocao()),
    }),
  ]);
}
