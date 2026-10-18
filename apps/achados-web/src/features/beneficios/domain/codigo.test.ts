import { describe, expect, it } from "vitest";

import {
  codigoEmDuasPartes,
  dataDaRenovacao,
  dataEHora,
  relogio,
  segundosRestantes,
} from "./codigo";

describe("código na tela", () => {
  it("conta os segundos que faltam, sem passar de zero", () => {
    const expira = "2026-10-18T12:10:00.000Z";
    expect(segundosRestantes(expira, Date.parse("2026-10-18T12:00:00Z"))).toBe(
      600
    );
    expect(segundosRestantes(expira, Date.parse("2026-10-18T12:11:00Z"))).toBe(
      0
    );
    // Relógio do aparelho atrasado: nunca mostra mais que a validade.
    expect(segundosRestantes(expira, Date.parse("2026-10-18T11:59:58Z"))).toBe(
      600
    );
  });

  it("mostra o relógio em mm:ss e o código em duas metades", () => {
    expect(relogio(541)).toBe("09:01");
    expect(relogio(0)).toBe("00:00");
    expect(codigoEmDuasPartes("ABC234")).toBe("ABC 234");
  });

  it("mostra a renovação no dia de Brasília", () => {
    expect(dataDaRenovacao("2027-01-01T03:00:00.000Z")).toBe("01/01/2027");
  });

  it("mostra data e hora do histórico em Brasília", () => {
    expect(dataEHora("2026-10-18T17:32:00.000Z")).toBe("18/10/2026 às 14:32");
  });
});
