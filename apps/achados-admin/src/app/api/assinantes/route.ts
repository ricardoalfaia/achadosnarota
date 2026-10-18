import {
  lerBusca,
  lerCursor,
  lerSituacaoDoAssinante,
} from "@/features/assinantes/domain/assinantes";
import { listarAssinantes } from "@/features/assinantes/servidor";
import { respostaDe } from "@/shared/consultas/resposta.servidor";

/**
 * GET /api/assinantes?busca=&situacao=&cursor=: uma página da listagem, com o
 * e-mail mascarado. Só a administração; nunca em cache compartilhado.
 */
export async function GET(pedido: Request) {
  const url = new URL(pedido.url);
  return respostaDe(
    await listarAssinantes({
      busca: lerBusca(url.searchParams.get("busca")),
      situacao: lerSituacaoDoAssinante(url.searchParams.get("situacao")),
      cursor: lerCursor(url.searchParams.get("cursor")),
    }),
    "private, no-store"
  );
}
