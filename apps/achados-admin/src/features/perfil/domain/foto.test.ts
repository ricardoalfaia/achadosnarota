import { describe, expect, it } from "vitest";

import {
  chaveDaFoto,
  ehChaveDeFoto,
  FOTO,
  FOTO_INVALIDA,
  lerArquivoDaFoto,
} from "./foto";

const ULID = "01JZ8Y6Q3K5V7W9X1A2B3C4D5E";

describe("lerArquivoDaFoto", () => {
  it("aceita JPEG, PNG e WebP dentro do tamanho", () => {
    for (const tipo of FOTO.tiposAceitos)
      expect(lerArquivoDaFoto(new Blob(["x"], { type: tipo })).ok).toBe(true);
  });

  it.each([
    ["nada", undefined],
    ["texto", "foto.jpg"],
    ["arquivo vazio", new Blob([], { type: "image/jpeg" })],
    ["SVG", new Blob(["<svg/>"], { type: "image/svg+xml" })],
    ["GIF", new Blob(["x"], { type: "image/gif" })],
    [
      "grande demais",
      new Blob([new Uint8Array(FOTO.tamanhoMaximoEmBytes + 1)], {
        type: "image/jpeg",
      }),
    ],
  ])("recusa %s", (_caso, valor) => {
    const lido = lerArquivoDaFoto(valor);
    expect(lido.ok).toBe(false);
    if (!lido.ok) expect(lido.error.code).toBe(FOTO_INVALIDA);
  });
});

describe("chave da foto", () => {
  it("é a pasta de avatares com um ULID", () => {
    expect(chaveDaFoto(ULID)).toBe(`avatares/${ULID}.webp`);
    expect(ehChaveDeFoto(chaveDaFoto(ULID))).toBe(true);
  });

  it.each([
    undefined,
    "avatares/qualquer.webp",
    `outra-pasta/${ULID}.webp`,
    `avatares/${ULID}.webp/../segredo`,
    `avatares/${ULID}.png`,
  ])("não reconhece %s como foto do app", (chave) => {
    expect(ehChaveDeFoto(chave)).toBe(false);
  });
});
