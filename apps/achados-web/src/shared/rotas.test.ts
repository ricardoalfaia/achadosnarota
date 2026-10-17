import { describe, expect, it } from "vitest";

import {
  destinoSeguro,
  ehRotaAtual,
  rotaDeCriarConta,
  rotaDeEntrar,
  rotaDoLugar,
} from "./rotas";

describe("ehRotaAtual", () => {
  it("a raiz só casa com ela mesma", () => {
    expect(ehRotaAtual("/", "/")).toBe(true);
    expect(ehRotaAtual("/", "/favoritos")).toBe(false);
  });

  it("um destino casa com ele e com o que está dentro dele", () => {
    expect(ehRotaAtual("/passaporte", "/passaporte")).toBe(true);
    expect(ehRotaAtual("/passaporte", "/passaporte/cupons")).toBe(true);
    expect(ehRotaAtual("/passaporte", "/passaportes")).toBe(false);
  });

  it("com exata, não casa com o que está dentro", () => {
    expect(ehRotaAtual("/perfil", "/perfil/dados", { exata: true })).toBe(
      false
    );
  });

  it("item sem destino nunca é a rota atual", () => {
    expect(ehRotaAtual(undefined, "/")).toBe(false);
  });
});

describe("rotaDoLugar", () => {
  it("codifica o slug", () => {
    expect(rotaDoLugar("rancho-portugues")).toBe("/lugar/rancho-portugues");
    expect(rotaDoLugar("a b")).toBe("/lugar/a%20b");
  });
});

describe("destinoSeguro", () => {
  it("aceita caminhos do próprio app", () => {
    expect(destinoSeguro("/favoritos")).toBe("/favoritos");
    expect(destinoSeguro("/lugar/rancho-portugues?aba=cupons")).toBe(
      "/lugar/rancho-portugues?aba=cupons"
    );
  });

  it.each([
    undefined,
    null,
    "",
    "favoritos",
    "//malicioso.example",
    "/\\malicioso.example",
    "https://malicioso.example",
    "javascript:alert(1)",
    "/ok\nSet-Cookie: x",
  ])("recusa %j e volta ao início", (valor) => {
    expect(destinoSeguro(valor)).toBe("/");
  });
});

describe("rotaDeEntrar e rotaDeCriarConta", () => {
  it("levam o destino de volta codificado", () => {
    expect(rotaDeEntrar("/favoritos")).toBe("/login?voltar=%2Ffavoritos");
    expect(rotaDeCriarConta("/passaporte")).toBe(
      "/cadastro?voltar=%2Fpassaporte"
    );
  });

  it("sem destino, ou com destino inseguro, ficam sem parâmetro", () => {
    expect(rotaDeEntrar()).toBe("/login");
    expect(rotaDeEntrar("//fora.example")).toBe("/login");
  });
});
