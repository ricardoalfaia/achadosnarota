import { describe, expect, it } from "vitest";

import { lerRetorno, pertoDeVencer } from "./assinatura";

describe("assinatura", () => {
  it("mostra Renovar só nos últimos 30 dias de um passaporte valendo", () => {
    const agora = new Date("2026-10-18T12:00:00Z");
    expect(pertoDeVencer(new Date("2026-11-10T12:00:00Z"), agora)).toBe(true);
    expect(pertoDeVencer(new Date("2027-03-01T12:00:00Z"), agora)).toBe(false);
    expect(pertoDeVencer(new Date("2026-10-01T12:00:00Z"), agora)).toBe(false);
  });

  it("lê o retorno do checkout e ignora o resto", () => {
    expect(lerRetorno("retorno")).toBe("retorno");
    expect(lerRetorno("cancelado")).toBe("cancelado");
    expect(lerRetorno("pago")).toBeUndefined();
  });
});
