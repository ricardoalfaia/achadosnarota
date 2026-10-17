import { describe, expect, it } from "vitest";

import {
  aplicarMudanca,
  hrefDoFiltro,
  lerFiltro,
  mesmoFiltro,
  normalizarBusca,
  padraoDeBusca,
  semFiltro,
} from "./filtro";

describe("lerFiltro", () => {
  it("lê categoria, cidade e busca da URL", () => {
    expect(
      lerFiltro({
        categoria: "cafes",
        cidade: "campos-do-jordao-sp",
        q: " serra ",
      })
    ).toEqual({
      categoria: "cafes",
      cidade: "campos-do-jordao-sp",
      busca: "serra",
    });
  });

  it("sem parâmetros, filtro vazio", () => {
    expect(lerFiltro({})).toEqual({});
    expect(semFiltro(lerFiltro({}))).toBe(true);
  });

  it("ignora slug fora da regra em vez de repassá-lo", () => {
    expect(
      lerFiltro({ categoria: "'; drop table place; --", cidade: "a b" })
    ).toEqual({});
  });

  it("com o parâmetro repetido, fica com o primeiro", () => {
    expect(lerFiltro({ categoria: ["bares", "cafes"] })).toEqual({
      categoria: "bares",
    });
  });

  it("normaliza maiúsculas do slug", () => {
    expect(lerFiltro({ categoria: "Cafes" })).toEqual({ categoria: "cafes" });
  });
});

describe("normalizarBusca", () => {
  it("tira espaços repetidos e caracteres de controle", () => {
    expect(normalizarBusca("  café   da\nserra ")).toBe("café da serra");
  });

  it("limita a 80 caracteres", () => {
    expect(normalizarBusca("a".repeat(200))).toHaveLength(80);
  });

  it("busca em branco não é busca", () => {
    expect(normalizarBusca("   ")).toBeUndefined();
    expect(normalizarBusca(undefined)).toBeUndefined();
  });
});

describe("hrefDoFiltro", () => {
  it("troca a categoria e mantém o resto", () => {
    expect(
      hrefDoFiltro(
        { categoria: "bares", busca: "chopp" },
        { categoria: "cafes" }
      )
    ).toBe("/?q=chopp&categoria=cafes");
  });

  it("tirar o único filtro volta à raiz", () => {
    expect(hrefDoFiltro({ categoria: "bares" }, { categoria: undefined })).toBe(
      "/"
    );
  });
});

describe("padraoDeBusca", () => {
  it("envolve o termo em curingas e escapa % e _", () => {
    expect(padraoDeBusca("serra")).toBe("%serra%");
    expect(padraoDeBusca("50%_off")).toBe("%50\\%\\_off%");
  });
});

describe("aplicarMudanca e mesmoFiltro", () => {
  it("tira os campos vazios e compara pelo conteúdo", () => {
    const novo = aplicarMudanca(
      { categoria: "bares" },
      { busca: "chopp", categoria: undefined }
    );
    expect(novo).toEqual({ busca: "chopp" });
    expect(mesmoFiltro(novo, { busca: "chopp" })).toBe(true);
    expect(mesmoFiltro(novo, { busca: "café" })).toBe(false);
  });
});
