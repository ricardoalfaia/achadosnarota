import { describe, expect, it } from "vitest";

import { estadosDasEtapas } from "./estado";

const FLUXO = ["rascunho", "revisao", "aprovado", "gerado"];

describe("estadosDasEtapas", () => {
  it("antes da atual, concluídas; depois, pendentes", () => {
    expect(estadosDasEtapas(FLUXO, "aprovado")).toEqual([
      "concluida",
      "concluida",
      "atual",
      "pendente",
    ]);
  });

  it("na primeira, nada está concluído; na última, tudo antes dela está", () => {
    expect(estadosDasEtapas(FLUXO, "rascunho")[0]).toBe("atual");
    expect(estadosDasEtapas(FLUXO, "gerado")).toEqual([
      "concluida",
      "concluida",
      "concluida",
      "atual",
    ]);
  });

  it("uma etapa atual desconhecida deixa todas pendentes", () => {
    expect(estadosDasEtapas(FLUXO, "arquivado")).toEqual([
      "pendente",
      "pendente",
      "pendente",
      "pendente",
    ]);
  });
});
