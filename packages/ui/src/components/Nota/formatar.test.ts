import { describe, expect, it } from "vitest";

import { formatarNota } from "./formatar";

describe("formatarNota", () => {
  it.each([
    [4.8, "4,8"],
    [5, "5,0"],
    [4.75, "4,8"],
    [0, "0,0"],
  ])("%s → %s", (valor, esperado) => {
    expect(formatarNota(valor)).toBe(esperado);
  });

  it("limita a nota entre 0 e 5", () => {
    expect(formatarNota(7)).toBe("5,0");
    expect(formatarNota(-1)).toBe("0,0");
  });
});
