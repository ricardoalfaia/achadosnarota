import { lerPromocao } from "@/features/promocoes/servidor";
import { respostaDe } from "@/shared/consultas/resposta.servidor";

/** GET /api/promocoes/:id: o registro para o formulário. Id desconhecido é 404. */
export async function GET(
  _pedido: Request,
  { params }: RouteContext<"/api/promocoes/[id]">
) {
  const { id } = await params;
  return respostaDe(await lerPromocao(id), "private, no-store");
}
