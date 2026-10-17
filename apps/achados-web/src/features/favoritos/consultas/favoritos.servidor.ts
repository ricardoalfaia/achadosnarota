import "server-only";

import { unwrapOrThrow } from "@achados/core";

import { clienteDoPedido } from "@/shared/consultas/cliente.servidor";
import { escopoDaPessoa } from "@/shared/consultas/escopo.servidor";
import { pessoaDoPedido } from "@/shared/sessao/sessao.servidor";
import { slugsFavoritos } from "../consultas.servidor";
import { chaveDosFavoritos } from "./favoritos";

/**
 * Busca os favoritos de quem está logado no servidor e guarda no QueryClient
 * do pedido, para os corações já saírem marcados no HTML. Sem sessão, não faz
 * nada: o hook fica desligado e todos os corações aparecem vazios.
 */
export async function prefetchDosFavoritos() {
  const usuario = await pessoaDoPedido();
  if (!usuario) return;
  await clienteDoPedido().prefetchQuery({
    queryKey: chaveDosFavoritos(escopoDaPessoa(usuario)),
    queryFn: async () => [...unwrapOrThrow(await slugsFavoritos(usuario.id))],
  });
}
