import { describe, expect, it } from "vitest";

import {
  ganhaOSelo,
  lerNota,
  media,
  notasAvaliadas,
  type NotasDosCriterios,
} from "./criterios";

const vazio: NotasDosCriterios = {
  hygiene: "",
  presentation: "",
  flavor: "",
  sophistication: "",
  service: "",
  ambience: "",
  value: "",
};

describe("critérios da curadoria", () => {
  it("lê a nota com vírgula ou ponto, de 0 a 5 com uma casa", () => {
    expect(lerNota("4,5")).toBe(4.5);
    expect(lerNota("5")).toBe(5);
    expect(lerNota("")).toBeNull();
    expect(lerNota("5,5")).toBeNull();
    expect(lerNota("4,55")).toBeNull();
    expect(lerNota("abc")).toBeNull();
  });

  it("deixa de fora o que não se aplica", () => {
    expect(notasAvaliadas({ ...vazio, hygiene: "4,8", value: "4" })).toEqual([
      4.8, 4,
    ]);
  });

  it("arredonda a média em uma casa", () => {
    expect(media([4.8, 4.5, 4.6])).toBe(4.6);
    expect(media([])).toBeUndefined();
  });

  it("dá o selo com média 4,5, nenhum critério abaixo de 4 e quatro critérios", () => {
    expect(ganhaOSelo([4.8, 4.6, 4.5, 4.7])).toBe(true);
    expect(ganhaOSelo([4.8, 4.6, 4.7])).toBe(false);
    expect(ganhaOSelo([5, 5, 5, 3.9])).toBe(false);
    expect(ganhaOSelo([4.4, 4.4, 4.4, 4.5])).toBe(false);
  });

  it("compara a média já arredondada, como a ficha mostra", () => {
    // 4,45 aparece como 4,5 na ficha: o selo segue o número publicado.
    expect(ganhaOSelo([4.4, 4.4, 4.5, 4.5])).toBe(true);
  });
});
