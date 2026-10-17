// Schemas do formato que os campos emitem. Regra de negócio
// (fim de semana, antecedência mínima) entra no schema do domínio, com
// `refine`/`superRefine` sobre estes.
import { z } from "zod";

import { diferencaEmDias, ehDataIso } from "../lib/datas";

/** `AAAA-MM-DD` que existe no calendário. Vazio (`""` do `FormData`) → "Informe a data". */
export const dataIsoSchema = z
  .string({ error: "Informe a data" })
  .min(1, "Informe a data")
  .refine(ehDataIso, "Data inválida");

/** `{ inicio, fim }` com fim não anterior ao início e, com `maxDias`, no máximo esse tamanho. */
export function periodoSchema({ maxDias }: { maxDias?: number } = {}) {
  return z
    .object(
      { inicio: dataIsoSchema, fim: dataIsoSchema },
      { error: "Escolha o período" }
    )
    .refine((periodo) => periodo.fim >= periodo.inicio, {
      message: "A data final não pode ser antes da inicial",
      path: ["fim"],
    })
    .refine(
      (periodo) =>
        maxDias === undefined ||
        !ehDataIso(periodo.inicio) ||
        !ehDataIso(periodo.fim) ||
        diferencaEmDias(periodo.inicio, periodo.fim) + 1 <= maxDias,
      { message: `Escolha no máximo ${maxDias} dias`, path: ["fim"] }
    );
}
