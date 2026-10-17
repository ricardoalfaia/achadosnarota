import { describe, expect, it } from "vitest";

import {
  ehRotaAtual,
  ehSlugValido,
  mesmaTelaEmOutroTenant,
  rotaDoTenant,
} from "./rotas";

describe("ehRotaAtual", () => {
  it("a raiz só casa com ela mesma", () => {
    expect(ehRotaAtual("/", "/")).toBe(true);
    expect(ehRotaAtual("/", "/configuracoes")).toBe(false);
  });

  it("um destino casa com ele e com o que está dentro dele", () => {
    expect(ehRotaAtual("/t/a/documentos", "/t/a/documentos")).toBe(true);
    expect(ehRotaAtual("/t/a/documentos", "/t/a/documentos/123")).toBe(true);
    expect(ehRotaAtual("/t/a/documentos", "/t/a/documentoss")).toBe(false);
  });

  it("com exata, o início do tenant não casa com as telas dentro dele", () => {
    expect(ehRotaAtual("/t/a", "/t/a", { exata: true })).toBe(true);
    expect(ehRotaAtual("/t/a", "/t/a/documentos", { exata: true })).toBe(false);
  });

  it("item sem destino nunca é a rota atual", () => {
    expect(ehRotaAtual(undefined, "/")).toBe(false);
  });
});

describe("rotaDoTenant", () => {
  it("monta o endereço da tela dentro de /t/<slug>, com ou sem a barra inicial", () => {
    expect(rotaDoTenant("escritorio-demo", "/documentos")).toBe(
      "/t/escritorio-demo/documentos"
    );
    expect(rotaDoTenant("escritorio-demo", "modelos")).toBe(
      "/t/escritorio-demo/modelos"
    );
    expect(rotaDoTenant("escritorio-demo", "/")).toBe("/t/escritorio-demo");
  });
});

describe("mesmaTelaEmOutroTenant", () => {
  it("troca o tenant e mantém a tela", () => {
    expect(
      mesmaTelaEmOutroTenant("/t/a/documentos/1", "a", "escritorio-teste")
    ).toBe("/t/escritorio-teste/documentos/1");
    expect(mesmaTelaEmOutroTenant("/t/a", "a", "b")).toBe("/t/b");
  });

  it("fora das telas do tenant atual, leva ao início do outro", () => {
    expect(mesmaTelaEmOutroTenant("/t/ab/documentos", "a", "b")).toBe("/t/b");
    expect(mesmaTelaEmOutroTenant("/login", "a", "b")).toBe("/t/b");
  });
});

describe("ehSlugValido", () => {
  it("aceita minúsculas, dígitos e hífen no meio", () => {
    expect(ehSlugValido("escritorio-demo")).toBe(true);
    expect(ehSlugValido("ab")).toBe(true);
    expect(ehSlugValido("escritorio-2")).toBe(true);
  });

  it("recusa maiúsculas, acentos, espaços, hífen nas pontas ou duplo e tamanhos fora da faixa", () => {
    for (const slug of [
      "Escritorio",
      "escritório",
      "escritorio demo",
      "-demo",
      "demo-",
      "a--b",
      "a",
      "a".repeat(64),
      "../admin",
    ]) {
      expect(ehSlugValido(slug), slug).toBe(false);
    }
  });
});
