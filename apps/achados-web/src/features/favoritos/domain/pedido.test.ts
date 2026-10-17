import { describe, expect, it } from "vitest";

import { lerPedidoDeFavorito } from "./pedido";

describe("lerPedidoDeFavorito", () => {
  it("aceita slug válido e a intenção", () => {
    expect(lerPedidoDeFavorito("rancho-portugues", true)).toEqual({
      ok: true,
      value: { slug: "rancho-portugues", favoritar: true },
    });
  });

  it.each([undefined, "", "Rancho", "a b", "../x", 42])(
    "recusa slug %j",
    (slug) => {
      const r = lerPedidoDeFavorito(slug, true);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("LUGAR_INVALIDO");
    }
  );

  it("recusa intenção que não é booleana", () => {
    const r = lerPedidoDeFavorito("rancho-portugues", "sim");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("PEDIDO_INVALIDO");
  });
});
