import { describe, expect, it } from "vitest";

import { mensagemDaFalha } from "./erros";
import { FOTO_INVALIDA } from "./foto";

describe("mensagemDaFalha", () => {
  it("explica a foto recusada", () => {
    expect(mensagemDaFalha(FOTO_INVALIDA)).toMatch(/JPG, PNG ou WebP/);
  });

  it("qualquer outra falha vira um aviso neutro, sem detalhe técnico", () => {
    expect(mensagemDaFalha("R2_RECUSOU")).toMatch(/Tente de novo/);
    expect(mensagemDaFalha(undefined)).toMatch(/Tente de novo/);
  });
});
