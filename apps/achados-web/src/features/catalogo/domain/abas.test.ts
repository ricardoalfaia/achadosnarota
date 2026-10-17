import { describe, expect, it } from "vitest";

import { abaDaFicha } from "./abas";

describe("abaDaFicha", () => {
  it("lê a aba válida da URL", () => {
    expect(abaDaFicha("fotos")).toBe("fotos");
    expect(abaDaFicha(["sobre", "fotos"])).toBe("sobre");
  });

  it("valor ausente ou desconhecido abre Cupons", () => {
    expect(abaDaFicha(undefined)).toBe("cupons");
    expect(abaDaFicha("<script>")).toBe("cupons");
  });
});
