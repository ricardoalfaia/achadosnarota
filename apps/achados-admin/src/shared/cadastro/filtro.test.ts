import { describe, expect, it } from "vitest";

import {
  contagemPorSituacao,
  filtrarRegistros,
  lerSituacao,
  TODAS,
} from "./filtro";

type R = { nome: string; cidade: string; status: "draft" | "published" };

const registros: R[] = [
  { nome: "Café Estação", cidade: "Pindamonhangaba", status: "published" },
  { nome: "Cantina do Largo", cidade: "São Luiz", status: "draft" },
  { nome: "Casa Ipê", cidade: "Pindamonhangaba", status: "draft" },
];
const textoDe = (r: R) => [r.nome, r.cidade];

describe("filtro das listagens", () => {
  it("lê a situação da URL só entre os valores aceitos", () => {
    expect(lerSituacao("draft", ["draft", "published"])).toBe("draft");
    expect(lerSituacao(["published"], ["draft", "published"])).toBe(
      "published"
    );
    expect(lerSituacao("<script>", ["draft"])).toBe(TODAS);
    expect(lerSituacao(undefined, ["draft"])).toBe(TODAS);
  });

  it("conta por situação e o total", () => {
    expect(contagemPorSituacao(registros, ["draft", "published"])).toEqual({
      todas: 3,
      draft: 2,
      published: 1,
    });
  });

  it("filtra por situação e por todas as palavras, sem acento", () => {
    const nomes = (lista: readonly R[]) => lista.map((r) => r.nome);
    expect(
      nomes(
        filtrarRegistros(registros, { situacao: "draft", busca: "", textoDe })
      )
    ).toEqual(["Cantina do Largo", "Casa Ipê"]);
    expect(
      nomes(
        filtrarRegistros(registros, {
          situacao: TODAS,
          busca: "cafe pinda",
          textoDe,
        })
      )
    ).toEqual(["Café Estação"]);
    expect(
      filtrarRegistros(registros, { situacao: TODAS, busca: " ", textoDe })
    ).toBe(registros);
  });
});
