import { describe, expect, it } from "vitest";

import {
  chaveDoValor,
  compararValores,
  filtroEstaVazio,
  interpretarEdicao,
  moverColuna,
  passaNoFiltro,
  textoDoValor,
  textoParaEditar,
} from "./valores";

describe("textoDoValor", () => {
  it("formata número e data no padrão brasileiro", () => {
    expect(textoDoValor(1284930.55, "numero")).toBe("1.284.930,55");
    expect(textoDoValor("2026-10-05", "data")).toBe("05/10/2026");
  });

  it("ausente vira texto vazio e texto passa direto", () => {
    expect(textoDoValor(null, "texto")).toBe("");
    expect(textoDoValor("Em revisão", "texto")).toBe("Em revisão");
  });
});

describe("compararValores", () => {
  it("ordena texto sem diferenciar acento nem caixa", () => {
    const nomes = ["Zulu", "ágata", "Beta", "alfa"];
    expect([...nomes].sort(compararValores)).toEqual([
      "ágata",
      "alfa",
      "Beta",
      "Zulu",
    ]);
  });

  it("ordena números pelo valor, não pelo texto", () => {
    expect([10, 9, 100].sort(compararValores)).toEqual([9, 10, 100]);
  });

  it("ausentes vão para o fim", () => {
    expect([null, "b", "", "a"].sort(compararValores)).toEqual([
      "a",
      "b",
      null,
      "",
    ]);
  });
});

describe("passaNoFiltro", () => {
  it("lista de valores aceita só as chaves marcadas, inclusive o vazio", () => {
    const filtro = { valores: new Set(["Em revisão", ""]) };
    expect(passaNoFiltro("Em revisão", filtro)).toBe(true);
    expect(passaNoFiltro(null, filtro)).toBe(true);
    expect(passaNoFiltro("Assinado", filtro)).toBe(false);
  });

  it("condições de texto ignoram acento e caixa", () => {
    const com = (operador: "contem" | "comecaCom" | "terminaCom" | "igual") =>
      passaNoFiltro("Contrato de Locação Comercial", {
        condicao: { tipo: "texto", operador, termo: "LOCACAO" },
      });
    expect(com("contem")).toBe(true);
    expect(com("comecaCom")).toBe(false);
    expect(
      passaNoFiltro("Contrato de Locação", {
        condicao: { tipo: "texto", operador: "terminaCom", termo: "locacao" },
      })
    ).toBe(true);
    expect(
      passaNoFiltro("Contrato", {
        condicao: { tipo: "texto", operador: "naoContem", termo: "locacao" },
      })
    ).toBe(true);
  });

  it("condições de número comparam o valor", () => {
    const maior = {
      condicao: { tipo: "numero", operador: "maiorQue", termo: 100 },
    } as const;
    expect(passaNoFiltro(250, maior)).toBe(true);
    expect(passaNoFiltro(100, maior)).toBe(false);
    expect(passaNoFiltro(null, maior)).toBe(false);
  });

  it("diferente, maior ou igual e menor ou igual completam os operadores de número", () => {
    const com = (
      operador: "diferente" | "maiorOuIgual" | "menorOuIgual",
      valor: number
    ) =>
      passaNoFiltro(valor, {
        condicao: { tipo: "numero", operador, termo: 100 },
      });
    expect(com("diferente", 100)).toBe(false);
    expect(com("diferente", 101)).toBe(true);
    expect(com("maiorOuIgual", 100)).toBe(true);
    expect(com("maiorOuIgual", 99)).toBe(false);
    expect(com("menorOuIgual", 100)).toBe(true);
    expect(com("menorOuIgual", 101)).toBe(false);
  });

  it("diferente de, em texto, também ignora acento e caixa", () => {
    const filtro = {
      condicao: { tipo: "texto", operador: "diferente", termo: "em revisao" },
    } as const;
    expect(passaNoFiltro("Em revisão", filtro)).toBe(false);
    expect(passaNoFiltro("Assinado", filtro)).toBe(true);
  });

  it("diferenciar caixa compara o texto como está", () => {
    const filtro = {
      condicao: {
        tipo: "texto",
        operador: "contem",
        termo: "Geral",
        diferenciarCaixa: true,
      },
    } as const;
    expect(passaNoFiltro("Procuração Geral 321", filtro)).toBe(true);
    expect(passaNoFiltro("Procuração GERAL 321", filtro)).toBe(false);
  });

  it("a segunda cláusula combina com E ou com OU", () => {
    const comecaComP = { operador: "comecaCom", termo: "p" } as const;
    const e = {
      condicao: {
        tipo: "texto",
        operador: "contem",
        termo: "geral",
        segunda: { juncao: "e", ...comecaComP },
      },
    } as const;
    expect(passaNoFiltro("Procuração Geral", e)).toBe(true);
    expect(passaNoFiltro("Termo Geral", e)).toBe(false);
    expect(passaNoFiltro("Procuração Simples", e)).toBe(false);

    const ou = {
      condicao: { ...e.condicao, segunda: { juncao: "ou", ...comecaComP } },
    } as const;
    expect(passaNoFiltro("Termo Geral", ou)).toBe(true);
    expect(passaNoFiltro("Procuração Simples", ou)).toBe(true);
    expect(passaNoFiltro("Termo Simples", ou)).toBe(false);

    const numeros = {
      condicao: {
        tipo: "numero",
        operador: "maiorOuIgual",
        termo: 10,
        segunda: { juncao: "e", operador: "menorQue", termo: 20 },
      },
    } as const;
    expect(passaNoFiltro(10, numeros)).toBe(true);
    expect(passaNoFiltro(20, numeros)).toBe(false);
  });

  it("lista e condição precisam valer juntas", () => {
    const filtro = {
      valores: new Set(["Alfa", "Beta"]),
      condicao: { tipo: "texto", operador: "comecaCom", termo: "a" },
    } as const;
    expect(passaNoFiltro("Alfa", filtro)).toBe(true);
    expect(passaNoFiltro("Beta", filtro)).toBe(false);
  });
});

describe("filtroEstaVazio", () => {
  it("sem lista e com termo em branco não restringe nada", () => {
    expect(filtroEstaVazio(undefined)).toBe(true);
    expect(
      filtroEstaVazio({
        condicao: { tipo: "texto", operador: "contem", termo: "  " },
      })
    ).toBe(true);
    expect(filtroEstaVazio({ valores: new Set() })).toBe(false);
  });

  it("uma segunda cláusula preenchida mantém o filtro mesmo com a primeira em branco", () => {
    expect(
      filtroEstaVazio({
        condicao: {
          tipo: "texto",
          operador: "contem",
          termo: "",
          segunda: { juncao: "ou", operador: "igual", termo: "x" },
        },
      })
    ).toBe(false);
  });
});

describe("moverColuna", () => {
  const ordem = ["status", "tipo", "cliente", "data"];

  it("leva a coluna para a posição do alvo, nos dois sentidos", () => {
    expect(moverColuna(ordem, "data", "tipo")).toEqual([
      "status",
      "data",
      "tipo",
      "cliente",
    ]);
    expect(moverColuna(ordem, "status", "cliente")).toEqual([
      "tipo",
      "cliente",
      "status",
      "data",
    ]);
  });

  it("não muda nada quando solta sobre si mesma ou sobre coluna desconhecida", () => {
    expect(moverColuna(ordem, "tipo", "tipo")).toEqual(ordem);
    expect(moverColuna(ordem, "tipo", "outra")).toEqual(ordem);
  });

  it("chaveDoValor trata ausente como vazio", () => {
    expect(chaveDoValor(null)).toBe("");
    expect(chaveDoValor(42)).toBe("42");
  });
});

describe("interpretarEdicao", () => {
  it("aceita número no formato brasileiro e com ponto decimal", () => {
    expect(interpretarEdicao("1.234,56", "numero")).toBe(1234.56);
    expect(interpretarEdicao("1234.56", "numero")).toBe(1234.56);
    expect(interpretarEdicao("1.234", "numero")).toBe(1234);
    expect(interpretarEdicao("12.345.678", "numero")).toBe(12345678);
    expect(interpretarEdicao(" -40 ", "numero")).toBe(-40);
  });

  it("recusa o que não é número", () => {
    expect(interpretarEdicao("12abc", "numero")).toBeUndefined();
    expect(interpretarEdicao("1,2,3", "numero")).toBeUndefined();
  });

  it("converte data digitada para o formato guardado e recusa data inexistente", () => {
    expect(interpretarEdicao("05/10/2026", "data")).toBe("2026-10-05");
    expect(interpretarEdicao("31/02/2026", "data")).toBeUndefined();
    expect(interpretarEdicao("ontem", "data")).toBeUndefined();
  });

  it("vazio vira ausente em número e data; texto é mantido como digitado", () => {
    expect(interpretarEdicao("  ", "numero")).toBeNull();
    expect(interpretarEdicao("", "data")).toBeNull();
    expect(interpretarEdicao(" XP ", "texto")).toBe(" XP ");
  });
});

describe("textoParaEditar", () => {
  it("mostra o valor como a pessoa digitaria", () => {
    expect(textoParaEditar(1234.5, "numero")).toBe("1234,5");
    expect(textoParaEditar("2026-10-05", "data")).toBe("05/10/2026");
    expect(textoParaEditar(null, "texto")).toBe("");
  });
});
