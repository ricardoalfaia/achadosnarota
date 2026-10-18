import { describe, expect, it } from "vitest";

import { dataCurta, regraDeUso, vigenciaEmPalavras } from "./apresentacao";

describe("apresentação da promoção", () => {
  it("descreve a regra de uso", () => {
    expect(regraDeUso(1, "year")).toBe("1 vez por ano");
    expect(regraDeUso(2, "week")).toBe("2 vezes por semana");
    expect(regraDeUso(5, "unlimited")).toBe("Uso livre");
  });

  it("formata a data no padrão brasileiro", () => {
    expect(dataCurta("2026-12-31")).toBe("31/12/2026");
  });

  it("descreve a vigência a partir de hoje", () => {
    const hoje = "2026-10-18";
    expect(vigenciaEmPalavras(null, null, hoje)).toBe("Sem prazo");
    expect(vigenciaEmPalavras("2026-11-01", "2026-12-31", hoje)).toBe(
      "Começa em 01/11/2026"
    );
    expect(vigenciaEmPalavras("2026-10-01", "2026-12-31", hoje)).toBe(
      "Até 31/12/2026"
    );
    expect(vigenciaEmPalavras("2026-09-01", "2026-10-10", hoje)).toBe(
      "Terminou em 10/10/2026"
    );
  });
});
