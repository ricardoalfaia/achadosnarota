import { opcoesDoCatalogo } from "@/features/casas/servidor";
import { respostaDe } from "@/shared/consultas/resposta.servidor";

/** GET /api/catalogo/opcoes: cidades e categorias para os campos do cadastro. */
export async function GET() {
  return respostaDe(await opcoesDoCatalogo(), "private, max-age=60");
}
