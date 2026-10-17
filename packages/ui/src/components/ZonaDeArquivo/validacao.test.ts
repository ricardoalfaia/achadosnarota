import { describe, expect, it } from "vitest";

import { validarArquivos } from "./validacao";

const pdf = (name = "contrato.pdf", size = 1000) => ({
  name,
  type: "application/pdf",
  size,
});
const png = { name: "foto.PNG", type: "image/png", size: 500 };

describe("validarArquivos", () => {
  it("sem regras, aceita um arquivo", () => {
    expect(validarArquivos([pdf()], {})).toEqual({ aceitos: [0], recusas: [] });
  });

  it("aceita por MIME, por família e por extensão, sem diferenciar maiúsculas", () => {
    expect(
      validarArquivos([pdf()], { aceitar: ["application/pdf"] }).aceitos
    ).toEqual([0]);
    expect(validarArquivos([png], { aceitar: ["image/*"] }).aceitos).toEqual([
      0,
    ]);
    expect(validarArquivos([png], { aceitar: [".png"] }).aceitos).toEqual([0]);
  });

  it("recusa o tipo fora da lista", () => {
    expect(validarArquivos([png], { aceitar: [".pdf"] })).toEqual({
      aceitos: [],
      recusas: [{ arquivo: "foto.PNG", motivo: "tipo" }],
    });
  });

  it("recusa o que passa do tamanho; o limite exato ainda entra", () => {
    const regras = { tamanhoMaximoEmBytes: 1000 };
    expect(validarArquivos([pdf("a.pdf", 1000)], regras).aceitos).toEqual([0]);
    expect(validarArquivos([pdf("b.pdf", 1001)], regras).recusas).toEqual([
      { arquivo: "b.pdf", motivo: "tamanho" },
    ]);
  });

  it("tipo é conferido antes de tamanho", () => {
    const grande = { ...png, size: 10_000 };
    expect(
      validarArquivos([grande], { aceitar: [".pdf"], tamanhoMaximoEmBytes: 1 })
        .recusas
    ).toEqual([{ arquivo: "foto.PNG", motivo: "tipo" }]);
  });

  it("sem multiplo, só o primeiro válido entra; os outros válidos vão por quantidade", () => {
    const resultado = validarArquivos([png, pdf("a.pdf"), pdf("b.pdf")], {
      aceitar: [".pdf"],
    });
    expect(resultado.aceitos).toEqual([1]);
    expect(resultado.recusas).toEqual([
      { arquivo: "foto.PNG", motivo: "tipo" },
      { arquivo: "b.pdf", motivo: "quantidade" },
    ]);
  });

  it("com multiplo, aceita todos os válidos pelos índices", () => {
    expect(
      validarArquivos([pdf("a.pdf"), png, pdf("b.pdf")], {
        aceitar: [".pdf"],
        multiplo: true,
      }).aceitos
    ).toEqual([0, 2]);
  });
});
