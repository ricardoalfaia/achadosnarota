import { listarPromocoes } from "@/features/promocoes/servidor";
import { respostaDe } from "@/shared/consultas/resposta.servidor";

/** GET /api/promocoes: a listagem do painel. Interna: sem cache compartilhado. */
export async function GET() {
  return respostaDe(await listarPromocoes(), "private, no-store");
}
