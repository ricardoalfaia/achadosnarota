import { listarAvaliacoes } from "@/features/curadoria/servidor";
import { respostaDe } from "@/shared/consultas/resposta.servidor";

/** GET /api/curadoria: as avaliações editoriais. Interna: sem cache compartilhado. */
export async function GET() {
  return respostaDe(await listarAvaliacoes(), "private, no-store");
}
