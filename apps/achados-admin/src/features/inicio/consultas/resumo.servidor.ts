import "server-only";

import { unwrapOrThrow } from "@achados/core";

import { clienteDoPedido } from "@/shared/consultas/cliente.servidor";
import { resumoDoPainel } from "../consultas.servidor";
import { opcoesDoResumo } from "./resumo";

export async function prefetchDoResumo() {
  await clienteDoPedido().prefetchQuery({
    ...opcoesDoResumo(),
    queryFn: async () => unwrapOrThrow(await resumoDoPainel()),
  });
}
