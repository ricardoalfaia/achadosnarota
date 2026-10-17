import { describe, expect, it } from "vitest";

import { FRASE_DE_EXCLUSAO, fraseConfere } from "./frase";

describe("fraseConfere", () => {
  it("aceita a frase exata", () => {
    expect(fraseConfere("confirmo a exclusão", FRASE_DE_EXCLUSAO)).toBe(true);
  });

  it("tolera maiúsculas, falta de acento e espaços sobrando", () => {
    expect(fraseConfere("  Confirmo a  EXCLUSAO ", FRASE_DE_EXCLUSAO)).toBe(
      true
    );
  });

  it("recusa frase incompleta, com palavra a mais ou trocada", () => {
    expect(fraseConfere("confirmo a exclusã", FRASE_DE_EXCLUSAO)).toBe(false);
    expect(fraseConfere("confirmo a exclusão sim", FRASE_DE_EXCLUSAO)).toBe(
      false
    );
    expect(fraseConfere("confirmo exclusão", FRASE_DE_EXCLUSAO)).toBe(false);
    expect(fraseConfere("", FRASE_DE_EXCLUSAO)).toBe(false);
  });

  it("frase vazia nunca confere", () => {
    expect(fraseConfere("", "")).toBe(false);
    expect(fraseConfere("  ", " ")).toBe(false);
  });
});
