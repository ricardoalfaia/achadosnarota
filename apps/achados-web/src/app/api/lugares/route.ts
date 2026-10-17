import { lerFiltro } from "@/features/catalogo";
import { listarLugares } from "@/features/catalogo/servidor";
import { respostaDe } from "@/shared/consultas/resposta.servidor";

/**
 * GET /api/lugares?categoria=&cidade=&q= (docs/produto/07): os cartões
 * publicados do filtro. Público: o banco só devolve o que está publicado, e a
 * resposta pode ficar um minuto em cache compartilhado.
 */
export async function GET(pedido: Request) {
  const { searchParams } = new URL(pedido.url);
  const filtro = lerFiltro(Object.fromEntries(searchParams));
  return respostaDe(
    await listarLugares(filtro),
    "public, max-age=0, s-maxage=60, stale-while-revalidate=300"
  );
}
