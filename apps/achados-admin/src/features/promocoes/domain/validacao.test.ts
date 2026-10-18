import { describe, expect, it } from "vitest";

import type { DadosDaPromocao } from "./tipos";
import {
  lerDadosDaPromocao,
  novaPromocao,
  pendenciasDaPromocao,
} from "./validacao";

const valida: DadosDaPromocao = {
  ...novaPromocao("01JCASA0000000000000000000"),
  titulo: "Sobremesa da casa",
  termos: "Válido no almoço, mediante código no app.",
};
const publicada = { casaPublicada: true };

describe("validação da promoção", () => {
  it("uma promoção nova mostra o que falta", () => {
    expect(
      pendenciasDaPromocao(novaPromocao(), publicada).map((p) => p.campo)
    ).toEqual(["casaId", "titulo", "termos"]);
  });

  it("aceita a promoção preenchida", () => {
    expect(pendenciasDaPromocao(valida, publicada)).toEqual([]);
  });

  it("limite de uso entre 1 e 99, exceto sem limite", () => {
    expect(
      pendenciasDaPromocao({ ...valida, limitePorAssinante: 0 }, publicada).map(
        (p) => p.campo
      )
    ).toEqual(["limitePorAssinante"]);
    expect(
      pendenciasDaPromocao(
        { ...valida, limitePorAssinante: 0, periodoDeUso: "unlimited" },
        publicada
      )
    ).toEqual([]);
  });

  it("recusa vigência invertida", () => {
    const pendencias = pendenciasDaPromocao(
      { ...valida, vigencia: { inicio: "2026-12-01", fim: "2026-11-01" } },
      publicada
    );
    expect(pendencias.map((p) => p.campo)).toEqual(["vigencia"]);
  });

  it("só casa publicada tem promoção ativa", () => {
    const ativa = { ...valida, status: "active" as const };
    expect(pendenciasDaPromocao(ativa, publicada)).toEqual([]);
    expect(
      pendenciasDaPromocao(ativa, { casaPublicada: false }).map((p) => p.campo)
    ).toEqual(["status"]);
  });

  it("não deixa a equipe marcar como encerrada à mão", () => {
    expect(
      pendenciasDaPromocao({ ...valida, status: "expired" }, publicada).map(
        (p) => p.campo
      )
    ).toEqual(["status"]);
  });

  it("no servidor, confere a casa pela fonte, não pelo navegador", () => {
    const resultado = lerDadosDaPromocao(
      { ...valida, status: "active" },
      { casaPublicada: () => false }
    );
    expect(resultado.ok).toBe(false);
  });
});
