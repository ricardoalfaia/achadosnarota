import { describe, expect, it } from "vitest";

import { saudacaoDaHora } from "./saudacao";

describe("saudação do painel", () => {
  it("segue a hora de Brasília, não a do servidor", () => {
    // 11h UTC = 8h em Brasília.
    expect(saudacaoDaHora(new Date("2026-10-18T11:00:00Z"))).toBe("Bom dia");
    expect(saudacaoDaHora(new Date("2026-10-18T17:00:00Z"))).toBe("Boa tarde");
    expect(saudacaoDaHora(new Date("2026-10-18T23:30:00Z"))).toBe("Boa noite");
    expect(saudacaoDaHora(new Date("2026-10-18T06:00:00Z"))).toBe("Boa noite");
  });
});
