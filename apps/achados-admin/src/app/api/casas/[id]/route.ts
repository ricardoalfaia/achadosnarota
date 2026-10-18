import { lerCasa } from "@/features/casas/servidor";
import { respostaDe } from "@/shared/consultas/resposta.servidor";

/** GET /api/casas/:id: o registro para o formulário. Id desconhecido é 404. */
export async function GET(
  _pedido: Request,
  { params }: RouteContext<"/api/casas/[id]">
) {
  const { id } = await params;
  return respostaDe(await lerCasa(id), "private, no-store");
}
