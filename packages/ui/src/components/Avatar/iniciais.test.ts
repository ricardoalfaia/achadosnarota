import { describe, expect, it } from "vitest";

import { iniciaisDoNome } from "./iniciais";

describe("iniciaisDoNome", () => {
  it("usa a primeira e a última palavra", () => {
    expect(iniciaisDoNome("João da Silva")).toBe("JS");
    expect(iniciaisDoNome("Ana Beatriz Costa Lima")).toBe("AL");
  });

  it("uma palavra só dá uma letra", () => {
    expect(iniciaisDoNome("Marina")).toBe("M");
  });

  it("ignora espaços sobrando e põe em maiúsculas, com acento", () => {
    expect(iniciaisDoNome("  érica   órfão ")).toBe("ÉÓ");
  });

  it("nome vazio ou só com espaços dá texto vazio", () => {
    expect(iniciaisDoNome("")).toBe("");
    expect(iniciaisDoNome("   ")).toBe("");
  });
});
