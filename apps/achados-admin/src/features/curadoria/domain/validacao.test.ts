import { describe, expect, it } from "vitest";

import type { DadosDaAvaliacao } from "./tipos";
import {
  lerDadosDaAvaliacao,
  novaAvaliacao,
  novasNotas,
  pendenciasDaAvaliacao,
} from "./validacao";

const hoje = "2026-10-18";
const valida: DadosDaAvaliacao = {
  ...novaAvaliacao(),
  casaId: "01JCASA0000000000000000000",
  visitadaEm: "2026-10-10",
  notas: { ...novasNotas(), hygiene: "4,8", flavor: "4.5" },
  parecer: "Parecer sintético.",
};

describe("validação da avaliação", () => {
  it("uma avaliação nova mostra o que falta, por seção", () => {
    expect(
      pendenciasDaAvaliacao(novaAvaliacao(), hoje).map(
        (p) => `${p.secao}.${p.campo}`
      )
    ).toEqual([
      "visita.casaId",
      "visita.visitadaEm",
      "notas.notas",
      "parecer.parecer",
    ]);
  });

  it("aceita a avaliação preenchida", () => {
    expect(pendenciasDaAvaliacao(valida, hoje)).toEqual([]);
  });

  it("aponta a nota inválida no critério", () => {
    const pendencias = pendenciasDaAvaliacao(
      { ...valida, notas: { ...valida.notas, value: "6" } },
      hoje
    );
    expect(pendencias.map((p) => p.campo)).toEqual(["nota.value"]);
  });

  it("recusa visita no futuro e situação automática", () => {
    expect(
      pendenciasDaAvaliacao(
        { ...valida, visitadaEm: "2026-10-19", status: "superseded" },
        hoje
      ).map((p) => p.campo)
    ).toEqual(["visitadaEm", "status"]);
  });

  it("no servidor, recusa formato inválido", () => {
    expect(lerDadosDaAvaliacao({ ...valida, selo: "comprado" }, hoje).ok).toBe(
      false
    );
    expect(lerDadosDaAvaliacao(valida, hoje).ok).toBe(true);
  });
});
