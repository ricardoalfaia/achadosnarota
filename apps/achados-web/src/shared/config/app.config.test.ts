import { describe, expect, it } from "vitest";

import { AMBIENTES } from "./ambiente";
import { configuracaoPara } from "./app.config";

describe("configuracaoPara", () => {
  it("combina a base com o arquivo do ambiente pedido", () => {
    expect(configuracaoPara("homolog")).toEqual({
      nome: "Achados na Rota",
      ambiente: "homolog",
      rotuloDoAmbiente: "Homologação",
    });
  });

  it("só produção fica sem rótulo de ambiente", () => {
    const semRotulo = AMBIENTES.filter(
      (ambiente) => configuracaoPara(ambiente).rotuloDoAmbiente === null
    );
    expect(semRotulo).toEqual(["production"]);
  });
});
