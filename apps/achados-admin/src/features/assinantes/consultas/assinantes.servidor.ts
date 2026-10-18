import "server-only";

import { unwrapOrThrow } from "@achados/core";

import { clienteDoPedido } from "@/shared/consultas/cliente.servidor";
import { listarAssinantes } from "../consultas.servidor";
import { opcoesDaListaDeAssinantes, type FiltrosDaLista } from "./assinantes";

/**
 * A primeira página no QueryClient do pedido: a tabela chega pronta no HTML.
 * Uma falha não derruba a página; o DataBoundary mostra o erro no navegador.
 */
export async function prefetchDosAssinantes(filtros: FiltrosDaLista) {
  await clienteDoPedido().prefetchInfiniteQuery({
    ...opcoesDaListaDeAssinantes(filtros),
    queryFn: async () =>
      unwrapOrThrow(await listarAssinantes({ ...filtros, cursor: null })),
  });
}
