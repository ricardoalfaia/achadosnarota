import { lerFichaDoAssinante } from "@/features/assinantes/servidor";
import { respostaDe } from "@/shared/consultas/resposta.servidor";

/** GET /api/assinantes/:id: a ficha, com o e-mail completo (abertura auditada). */
export async function GET(
  _pedido: Request,
  { params }: RouteContext<"/api/assinantes/[id]">
) {
  const { id } = await params;
  return respostaDe(await lerFichaDoAssinante(id), "private, no-store");
}
