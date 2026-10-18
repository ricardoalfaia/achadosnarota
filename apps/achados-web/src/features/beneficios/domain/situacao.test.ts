import { describe, expect, it } from "vitest";

import { situacaoDoResgate } from "./situacao";

describe("situacaoDoResgate", () => {
  it("sem conta, entrar primeiro (mesmo que passe passaporte ativo)", () => {
    expect(situacaoDoResgate({ logado: false, passaporteAtivo: false })).toBe(
      "entrar"
    );
    expect(situacaoDoResgate({ logado: false, passaporteAtivo: true })).toBe(
      "entrar"
    );
  });

  it("com conta e sem passaporte, assinar", () => {
    expect(situacaoDoResgate({ logado: true, passaporteAtivo: false })).toBe(
      "assinar"
    );
  });

  it("com passaporte, a emissão ainda não existe", () => {
    expect(situacaoDoResgate({ logado: true, passaporteAtivo: true })).toBe(
      "usar"
    );
  });
});
