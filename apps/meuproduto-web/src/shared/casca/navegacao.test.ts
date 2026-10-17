import { describe, expect, it } from "vitest";

import { ehItemAtual, hrefDoItem, itemDaRota, NAVEGACAO } from "./navegacao";

const SLUG = "escritorio-demo";

describe("NAVEGACAO", () => {
  it("tem os nove itens do mockup, na ordem, sem repetir caminho", () => {
    expect(NAVEGACAO.map((item) => item.id)).toEqual([
      "inicio",
      "documentos",
      "modelos",
      "assinaturas",
      "clientes",
      "equipe",
      "relatorios",
      "integracoes",
      "configuracoes",
    ]);
    const caminhos = NAVEGACAO.map((item) => item.caminho);
    expect(new Set(caminhos).size).toBe(caminhos.length);
    expect(caminhos[0]).toBe("/");
  });
});

describe("hrefDoItem", () => {
  it("monta o endereço pelo tenant ativo", () => {
    const documentos = NAVEGACAO.find((item) => item.id === "documentos");
    expect(documentos && hrefDoItem(SLUG, documentos)).toBe(
      "/t/escritorio-demo/documentos"
    );
  });
});

describe("itemDaRota", () => {
  it("acha o item da rota e das rotas dentro dele", () => {
    expect(itemDaRota(SLUG, "/t/escritorio-demo")?.id).toBe("inicio");
    expect(itemDaRota(SLUG, "/t/escritorio-demo/documentos")?.id).toBe(
      "documentos"
    );
    expect(itemDaRota(SLUG, "/t/escritorio-demo/clientes/123")?.id).toBe(
      "clientes"
    );
  });

  it("o início não fica marcado nas outras telas do tenant", () => {
    const inicio = NAVEGACAO[0]!;
    expect(ehItemAtual(SLUG, inicio, "/t/escritorio-demo/documentos")).toBe(
      false
    );
    expect(ehItemAtual(SLUG, inicio, "/t/escritorio-demo")).toBe(true);
  });

  it("rota fora do menu não acha nada", () => {
    expect(itemDaRota(SLUG, "/t/escritorio-demo/documentoss")).toBeUndefined();
    expect(itemDaRota(SLUG, "/t/escritorio-demo/outra")).toBeUndefined();
    // Outro tenant não é a rota deste.
    expect(itemDaRota(SLUG, "/t/escritorio-teste/documentos")).toBeUndefined();
  });
});
