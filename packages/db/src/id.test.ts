import { decodeTime } from "ulid";
import { describe, expect, it } from "vitest";

import { ehUlid, novoId, PADRAO_ULID_SQL } from "./id";

describe("novoId", () => {
  it("gera ULID de 26 caracteres", () => {
    const id = novoId();
    expect(id).toHaveLength(26);
    expect(ehUlid(id)).toBe(true);
    expect(new RegExp(PADRAO_ULID_SQL).test(id)).toBe(true);
  });

  it("a ordem alfabética é a ordem de criação, mesmo no mesmo milissegundo", () => {
    const ids = Array.from({ length: 500 }, () => novoId());
    expect([...ids].sort()).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("o prefixo codifica o instante da criação", () => {
    const antes = Date.now();
    const id = novoId();
    expect(decodeTime(id)).toBeGreaterThanOrEqual(antes - 1);
    expect(decodeTime(id)).toBeLessThanOrEqual(Date.now());
  });
});

describe("ehUlid", () => {
  it.each([
    "",
    "abc",
    "01jabcdefghjkmnpqrstvwxyz0", // minúsculas
    "01JABCDEFGHJKMNPQRSTVWXYZI", // I fora do alfabeto Crockford
    "6F9619FF-8B86-D011-B42D-00C04FC964FF",
    42,
    null,
  ])("recusa %j", (valor) => {
    expect(ehUlid(valor)).toBe(false);
  });
});
