import "server-only";

import { unwrapOrThrow } from "@achados/core";

import { clienteDoPedido } from "@/shared/consultas/cliente.servidor";
import { listarLugares } from "../consultas.servidor";
import type { FiltroDoCatalogo } from "../domain/tipos";
import { chaveDosLugares } from "./lugares";

/**
 * Busca os lugares do filtro no servidor, pela consulta direta (sem HTTP para
 * o próprio BFF), e guarda no QueryClient do pedido com a mesma chave que o
 * navegador usa. Falha não vira dado: o prefetch fica vazio e a região, no
 * navegador, tenta pelo BFF e mostra o erro pelo DataBoundary.
 */
export async function prefetchDosLugares(filtro: FiltroDoCatalogo) {
  await clienteDoPedido().prefetchQuery({
    queryKey: chaveDosLugares(filtro),
    queryFn: async () => unwrapOrThrow(await listarLugares(filtro)),
  });
}
