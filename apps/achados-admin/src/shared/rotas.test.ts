import { describe, expect, it } from "vitest";

import { ehRotaAtual, rotaDoRegistro, ROTAS } from "./rotas";

describe("rotas do painel", () => {
  it("abre o registro pelo id opaco e a inclusão por novo=1", () => {
    expect(rotaDoRegistro(ROTAS.casas, { id: "01J9Z" })).toBe(
      "/casas?id=01J9Z"
    );
    expect(rotaDoRegistro(ROTAS.casas, "novo")).toBe("/casas?novo=1");
  });

  it("o início só casa com ele mesmo", () => {
    expect(ehRotaAtual("/", "/")).toBe(true);
    expect(ehRotaAtual("/", "/casas")).toBe(false);
  });

  it("um item casa com as subrotas, mas não com prefixo de outro nome", () => {
    expect(ehRotaAtual("/casas", "/casas")).toBe(true);
    expect(ehRotaAtual("/casas", "/casas/fotos")).toBe(true);
    expect(ehRotaAtual("/casas", "/casasx")).toBe(false);
  });
});
