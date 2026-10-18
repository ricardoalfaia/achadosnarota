import { describe, expect, it } from "vitest";

import type { DadosDaCasa } from "./tipos";
import {
  DADOS_DA_CASA_INVALIDOS,
  lerDadosDaCasa,
  novaCasa,
  pendenciasDaCasa,
} from "./validacao";

const valida: DadosDaCasa = {
  ...novaCasa(),
  nome: "Casa Exemplo",
  slug: "casa-exemplo",
  categoriaId: "01JCATEGORIA0000000000000",
  cidadeId: "01JCIDADE00000000000000000",
  especialidade: "Culinária Caipira",
  resumo: "Um resumo curto.",
};

describe("validação da casa", () => {
  it("uma casa nova mostra o que falta, por seção", () => {
    const campos = pendenciasDaCasa(novaCasa(), 0).map(
      (p) => `${p.secao}.${p.campo}`
    );
    expect(campos).toEqual([
      "dados.nome",
      "dados.slug",
      "dados.categoriaId",
      "dados.especialidade",
      "dados.resumo",
      "local.cidadeId",
    ]);
  });

  it("aceita a casa preenchida em rascunho, sem foto", () => {
    expect(pendenciasDaCasa(valida, 0)).toEqual([]);
  });

  it("publicar exige foto", () => {
    const publicada = { ...valida, status: "published" as const };
    expect(pendenciasDaCasa(publicada, 0).map((p) => p.campo)).toEqual([
      "fotos",
    ]);
    expect(pendenciasDaCasa(publicada, 1)).toEqual([]);
  });

  it("recusa slug, telefone e site fora do formato", () => {
    const campos = pendenciasDaCasa(
      { ...valida, slug: "Casa Exemplo", telefone: "12-3", site: "casa.com" },
      0
    ).map((p) => p.campo);
    expect(campos).toEqual(["slug", "telefone", "site"]);
  });

  it("no servidor, recusa formato inválido sem ecoar valores", () => {
    const resultado = lerDadosDaCasa({ nome: 1 }, 0);
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.error.code).toBe(DADOS_DA_CASA_INVALIDOS);
      expect(resultado.error.details).toBeUndefined();
    }
  });

  it("no servidor, limpa o telefone e devolve as pendências", () => {
    const ok = lerDadosDaCasa({ ...valida, telefone: "(12) 3644-8899" }, 0);
    expect(ok.ok && ok.value.telefone).toBe("1236448899");

    const recusado = lerDadosDaCasa({ ...valida, nome: "" }, 0);
    expect(recusado.ok).toBe(false);
    if (!recusado.ok)
      expect(recusado.error.details?.pendencias).toHaveLength(1);
  });
});
