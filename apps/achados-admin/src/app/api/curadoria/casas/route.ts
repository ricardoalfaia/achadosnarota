import { casasParaAvaliacao } from "@/features/curadoria/servidor";
import { respostaDe } from "@/shared/consultas/resposta.servidor";

/** GET /api/curadoria/casas: as casas que podem ser avaliadas. */
export async function GET() {
  return respostaDe(await casasParaAvaliacao(), "private, no-store");
}
