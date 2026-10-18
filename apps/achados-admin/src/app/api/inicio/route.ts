import { resumoDoPainel } from "@/features/inicio/servidor";
import { respostaDe } from "@/shared/consultas/resposta.servidor";

/** GET /api/inicio: indicadores e fila de trabalho do painel. */
export async function GET() {
  return respostaDe(await resumoDoPainel(), "private, no-store");
}
