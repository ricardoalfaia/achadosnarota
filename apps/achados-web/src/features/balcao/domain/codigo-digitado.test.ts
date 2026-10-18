import { describe, expect, it } from "vitest";

import {
  codigoCompleto,
  codigoParaConferir,
  horaDoUso,
  limparCodigo,
} from "./codigo-digitado";

describe("código digitado no balcão", () => {
  it("fica em caixa alta, só com caracteres do código, até 6", () => {
    expect(limparCodigo("abc 2-34")).toBe("ABC234");
    expect(limparCodigo("d66bm3x9")).toBe("D66BM3");
    // 0, 1, O, I e L não existem no código e saem.
    expect(limparCodigo("O0I1L")).toBe("");
  });

  it("sabe quando está completo e mostra em duas metades", () => {
    expect(codigoCompleto("ABC23")).toBe(false);
    expect(codigoCompleto("ABC234")).toBe(true);
    expect(codigoParaConferir("ABC234")).toBe("ABC 234");
    expect(codigoParaConferir("AB")).toBe("AB");
  });

  it("mostra a hora do uso no horário de Brasília", () => {
    expect(horaDoUso("2026-10-18T17:32:00.000Z")).toBe("14:32");
  });
});
