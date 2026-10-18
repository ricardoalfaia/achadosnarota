import { listarCasas } from "@/features/casas/servidor";
import { respostaDe } from "@/shared/consultas/resposta.servidor";

/** GET /api/casas: a listagem do painel. Interna: nunca em cache compartilhado. */
export async function GET() {
  return respostaDe(await listarCasas(), "private, no-store");
}
