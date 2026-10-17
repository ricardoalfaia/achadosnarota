import { describe, expect, it } from "vitest";

import { comIdioma, ehIdioma, trocarIdioma } from "./idiomas";

describe("comIdioma", () => {
  it("põe o idioma no começo do endereço", () => {
    expect(comIdioma("pt-BR", "/docs")).toBe("/pt-BR/docs");
    expect(comIdioma("en", "/docs/modulos")).toBe("/en/docs/modulos");
  });

  it("na raiz, não deixa barra sobrando", () => {
    expect(comIdioma("pt-BR", "/")).toBe("/pt-BR");
    expect(comIdioma("en", "/")).toBe("/en");
  });
});

describe("trocarIdioma", () => {
  it("troca o idioma e mantém o resto do endereço", () => {
    expect(trocarIdioma("/pt-BR", "pt-BR", "en")).toBe("/en");
    expect(trocarIdioma("/pt-BR/docs/modulos", "pt-BR", "en")).toBe(
      "/en/docs/modulos"
    );
    expect(trocarIdioma("/en/docs/modulos", "en", "pt-BR")).toBe(
      "/pt-BR/docs/modulos"
    );
  });

  it("não confunde o idioma com o começo de outro caminho", () => {
    expect(trocarIdioma("/entrada", "en", "pt-BR")).toBe("/pt-BR/entrada");
  });
});

describe("ehIdioma", () => {
  it("aceita só os idiomas configurados", () => {
    expect(ehIdioma("pt-BR")).toBe(true);
    expect(ehIdioma("en")).toBe(true);
    expect(ehIdioma("es")).toBe(false);
    expect(ehIdioma("docs")).toBe(false);
  });
});
