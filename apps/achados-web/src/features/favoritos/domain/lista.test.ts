import { describe, expect, it } from "vitest";

import { listaComPedido } from "./lista";

describe("listaComPedido", () => {
  it("põe o lugar sem duplicar", () => {
    expect(listaComPedido(["a"], { slug: "b", favoritar: true })).toEqual([
      "a",
      "b",
    ]);
    expect(listaComPedido(["a"], { slug: "a", favoritar: true })).toEqual([
      "a",
    ]);
  });

  it("tira o lugar; tirar o que não está não muda nada", () => {
    expect(listaComPedido(["a", "b"], { slug: "a", favoritar: false })).toEqual(
      ["b"]
    );
    expect(listaComPedido(undefined, { slug: "a", favoritar: false })).toEqual(
      []
    );
  });
});
