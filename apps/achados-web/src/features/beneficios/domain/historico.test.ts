import { describe, expect, it } from "vitest";

import { estatisticasDoHistorico } from "./historico";
import type { ItemDoHistorico } from "./tipos";

const item = (
  situacao: ItemDoHistorico["situacao"],
  lugarSlug: string,
  cidade: string
): ItemDoHistorico => ({
  id: `${lugarSlug}-${Math.random()}`,
  titulo: "Benefício",
  lugarSlug,
  cidade,
  situacao,
  quando: "2026-10-18T12:00:00.000Z",
});

describe("estatisticasDoHistorico", () => {
  it("conta só os usados, e casas e cidades sem repetir", () => {
    expect(
      estatisticasDoHistorico([
        item("usado", "rancho", "Pinda"),
        item("usado", "rancho", "Pinda"),
        item("usado", "choperia", "Pinda"),
        item("usado", "cafe", "Campos"),
        item("expirado", "mirante", "São Bento"),
      ])
    ).toEqual({ cupons: 4, estabelecimentos: 3, cidades: 2 });
  });

  it("sem histórico, tudo zero", () => {
    expect(estatisticasDoHistorico([])).toEqual({
      cupons: 0,
      estabelecimentos: 0,
      cidades: 0,
    });
  });
});
