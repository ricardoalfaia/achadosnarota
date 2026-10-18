import { casasParaPromocao } from "@/features/promocoes/servidor";
import { respostaDe } from "@/shared/consultas/resposta.servidor";

/** GET /api/promocoes/casas: as casas que podem receber promoção. */
export async function GET() {
  return respostaDe(await casasParaPromocao(), "private, no-store");
}
