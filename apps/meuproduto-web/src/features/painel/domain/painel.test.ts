import { describe, expect, it } from "vitest";

import {
  comTotalDeClientes,
  intencaoDoStatus,
  maisRecentes,
  textoDaVariacao,
} from "./painel";
import { lerPainelProvisorio, PAINEL_PROVISORIO } from "./painel-provisorio";

describe("intencaoDoStatus", () => {
  it("dá uma cor a cada status, como no mockup", () => {
    expect(intencaoDoStatus("assinado")).toBe("sucesso");
    expect(intencaoDoStatus("emAndamento")).toBe("primario");
    expect(intencaoDoStatus("aguardando")).toBe("atencao");
    expect(intencaoDoStatus("rascunho")).toBe("neutro");
  });
});

describe("maisRecentes", () => {
  it("ordena do mais recente e respeita o limite, sem alterar a lista", () => {
    const lista = [...PAINEL_PROVISORIO.documentosRecentes].reverse();
    const recentes = maisRecentes(lista, 2);

    expect(recentes.map((d) => d.id)).toEqual(["doc-1", "doc-2"]);
    expect(lista[0]?.id).toBe("doc-5");
  });
});

describe("textoDaVariacao", () => {
  it("mostra o percentual sem sinal", () => {
    expect(textoDaVariacao(12)).toBe("12%");
    expect(textoDaVariacao(-2)).toBe("2%");
  });
});

describe("painel provisório", () => {
  it("a leitura devolve Ok com os quatro indicadores do mockup", async () => {
    const lido = await lerPainelProvisorio();

    expect(lido.ok).toBe(true);
    if (!lido.ok) return;
    expect(lido.value.indicadores.map((i) => i.id)).toEqual([
      "documentos",
      "assinaturas",
      "clientes",
      "pendentes",
    ]);
  });

  it("não repete identificadores e usa datas ISO válidas", () => {
    const ids = [
      ...PAINEL_PROVISORIO.documentosRecentes.map((d) => d.id),
      ...PAINEL_PROVISORIO.modelosMaisUsados.map((m) => m.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
    for (const documento of PAINEL_PROVISORIO.documentosRecentes)
      expect(Number.isNaN(Date.parse(documento.atualizadoEm))).toBe(false);
  });
});

describe("comTotalDeClientes", () => {
  it("troca só o indicador de clientes pelo total real, sem variação inventada", () => {
    const painel = comTotalDeClientes(PAINEL_PROVISORIO, 3);
    const clientes = painel.indicadores.find((i) => i.id === "clientes");

    expect(clientes).toEqual({ id: "clientes", valor: 3 });
    expect(painel.indicadores.find((i) => i.id === "documentos")).toEqual(
      PAINEL_PROVISORIO.indicadores.find((i) => i.id === "documentos")
    );
    expect(painel.documentosRecentes).toBe(
      PAINEL_PROVISORIO.documentosRecentes
    );
  });
});
