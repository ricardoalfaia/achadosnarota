import { describe, expect, it } from "vitest";

import { trilhaDoCaminho } from "./trilha";

const SLUG = "escritorio-demo";

describe("trilhaDoCaminho", () => {
  it("reconhece o início, os itens do menu e o que está fora dele", () => {
    expect(trilhaDoCaminho(SLUG, "/t/escritorio-demo")).toEqual({
      tipo: "inicio",
    });
    expect(trilhaDoCaminho(SLUG, "/t/escritorio-demo/modelos")).toEqual({
      tipo: "item",
      id: "modelos",
    });
    expect(trilhaDoCaminho(SLUG, "/t/escritorio-demo/assinaturas/abc")).toEqual(
      {
        tipo: "item",
        id: "assinaturas",
      }
    );
    expect(trilhaDoCaminho(SLUG, "/t/escritorio-demo/outra")).toEqual({
      tipo: "desconhecida",
    });
  });
});
