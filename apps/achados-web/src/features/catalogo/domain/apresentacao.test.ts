import { describe, expect, it } from "vitest";

import {
  hrefComoChegar,
  hrefDoTelefone,
  localDoLugar,
  mesDaVisita,
  siteParaExibir,
  telefoneParaExibir,
  textoDaRegraDeUso,
} from "./apresentacao";

describe("apresentação do lugar", () => {
  it("monta o local como no protótipo", () => {
    expect(localDoLugar("Pindamonhangaba", "SP")).toBe("Pindamonhangaba - SP");
  });

  it("formata fixo e celular", () => {
    expect(telefoneParaExibir("1236448899")).toBe("(12) 3644-8899");
    expect(telefoneParaExibir("12991234567")).toBe("(12) 99123-4567");
    expect(telefoneParaExibir("123")).toBe("123");
  });

  it("liga com o código do país", () => {
    expect(hrefDoTelefone("1236448899")).toBe("tel:+551236448899");
  });

  it("leva ao mapa só com nome e endereço públicos", () => {
    expect(hrefComoChegar("Café da Serra", "Av. X, 1")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Caf%C3%A9%20da%20Serra%2C%20Av.%20X%2C%201"
    );
  });

  it("escreve o mês da visita por extenso", () => {
    expect(mesDaVisita("2026-09-14")).toBe("setembro de 2026");
    expect(mesDaVisita("2026-01-01")).toBe("janeiro de 2026");
  });

  it("mostra o site sem o esquema", () => {
    expect(siteParaExibir("https://example.com/rancho/")).toBe(
      "example.com/rancho"
    );
  });
});

describe("textoDaRegraDeUso", () => {
  it("diz quantas vezes e em que período, ou que não há limite", () => {
    expect(textoDaRegraDeUso({ limite: 1, periodo: "year" })).toBe(
      "1 vez por ano"
    );
    expect(textoDaRegraDeUso({ limite: 2, periodo: "week" })).toBe(
      "2 vezes por semana"
    );
    expect(textoDaRegraDeUso({ limite: 1, periodo: "unlimited" })).toBe(
      "Sem limite de usos"
    );
  });
});
