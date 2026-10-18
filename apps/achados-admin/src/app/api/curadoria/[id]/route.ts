import { lerAvaliacao } from "@/features/curadoria/servidor";
import { respostaDe } from "@/shared/consultas/resposta.servidor";

/** GET /api/curadoria/:id: a avaliação para o formulário. Id desconhecido é 404. */
export async function GET(
  _pedido: Request,
  { params }: RouteContext<"/api/curadoria/[id]">
) {
  const { id } = await params;
  return respostaDe(await lerAvaliacao(id), "private, no-store");
}
