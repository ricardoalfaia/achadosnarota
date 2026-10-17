import { describe, expect, it } from "vitest";

import { indiceDestino, itemDestino } from "./navegacao";

describe("indiceDestino", () => {
  it("no eixo vertical, as setas para baixo e para cima dão a volta", () => {
    expect(indiceDestino(3, 0, "ArrowDown", "vertical")).toBe(1);
    expect(indiceDestino(3, 2, "ArrowDown", "vertical")).toBe(0);
    expect(indiceDestino(3, 0, "ArrowUp", "vertical")).toBe(2);
  });

  it("cada eixo ignora as setas do outro", () => {
    expect(indiceDestino(3, 0, "ArrowRight", "vertical")).toBeNull();
    expect(indiceDestino(3, 0, "ArrowDown", "horizontal")).toBeNull();
    expect(indiceDestino(3, 0, "ArrowRight", "horizontal")).toBe(1);
  });

  it("sem item atual, avançar vai ao primeiro e voltar vai ao último", () => {
    expect(indiceDestino(3, -1, "ArrowDown", "vertical")).toBe(0);
    expect(indiceDestino(3, -1, "ArrowUp", "vertical")).toBe(2);
  });

  it("Home e End vão às pontas; lista vazia e outras teclas não navegam", () => {
    expect(indiceDestino(3, 1, "Home", "vertical")).toBe(0);
    expect(indiceDestino(3, 1, "End", "vertical")).toBe(2);
    expect(indiceDestino(0, -1, "ArrowDown", "vertical")).toBeNull();
    expect(indiceDestino(3, 1, "Enter", "vertical")).toBeNull();
  });
});

describe("itemDestino", () => {
  const ITENS = ["a", "b", "c"] as const;

  it("devolve o item do destino, dando a volta nas pontas", () => {
    expect(itemDestino(ITENS, "a", "ArrowDown", "vertical")).toBe("b");
    expect(itemDestino(ITENS, "c", "ArrowDown", "vertical")).toBe("a");
    expect(itemDestino(ITENS, "b", "End", "vertical")).toBe("c");
  });

  it("com o item atual fora da lista, parte da ponta", () => {
    expect(itemDestino<string>(ITENS, "x", "ArrowDown", "vertical")).toBe("a");
    expect(itemDestino<string>(ITENS, "x", "ArrowUp", "vertical")).toBe("c");
  });

  it("devolve null quando a tecla não navega ou a lista está vazia", () => {
    expect(itemDestino(ITENS, "a", "Enter", "vertical")).toBeNull();
    expect(itemDestino(ITENS, "a", "ArrowRight", "vertical")).toBeNull();
    expect(itemDestino([], "a", "ArrowDown", "vertical")).toBeNull();
  });
});
