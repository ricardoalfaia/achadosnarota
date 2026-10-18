import { describe, expect, it } from "vitest";

import {
  csvDosResgates,
  diaDeBrasilia,
  indicadores,
  intervaloDoPeriodo,
  lerPeriodo,
  mapaDeCalor,
  ranking,
  seriePorDia,
  type LinhaDeResgate,
} from "./relatorio";

let sequencia = 0;
const linha = (
  usadoEm: string | null,
  extra: Partial<LinhaDeResgate> = {}
): LinhaDeResgate => ({
  id: `r${sequencia++}`,
  situacao: usadoEm ? "redeemed" : "expired",
  geradoEm: usadoEm ?? "2026-10-10T15:00:00.000Z",
  usadoEm,
  casaId: "casa-a",
  casa: "Rancho",
  beneficio: "2 por 1",
  assinante: "a1",
  operador: "Gabi",
  ...extra,
});

describe("período", () => {
  it("lê o período da URL e cai em 30 dias", () => {
    expect(lerPeriodo("7d")).toBe("7d");
    expect(lerPeriodo("qualquer")).toBe("30d");
  });

  it("7 dias começam à meia-noite de Brasília de 6 dias atrás; o anterior tem o mesmo tamanho", () => {
    const agora = new Date("2026-10-18T15:00:00Z");
    const { inicio, anteriorInicio, anteriorFim } = intervaloDoPeriodo(
      "7d",
      agora
    );
    expect(inicio.toISOString()).toBe("2026-10-12T03:00:00.000Z");
    expect(anteriorInicio.toISOString()).toBe("2026-10-05T03:00:00.000Z");
    expect(anteriorFim.toISOString()).toBe(inicio.toISOString());
  });

  it("o dia de Brasília vira às 3h UTC", () => {
    expect(diaDeBrasilia(new Date("2026-10-18T02:59:00Z"))).toBe("2026-10-17");
    expect(diaDeBrasilia(new Date("2026-10-18T03:00:00Z"))).toBe("2026-10-18");
  });
});

describe("indicadores", () => {
  it("conta usados, gerados, taxa, pessoas, casas e variação", () => {
    const atuais = [
      linha("2026-10-15T15:00:00Z"),
      linha("2026-10-16T15:00:00Z", { assinante: "a2", casaId: "casa-b" }),
      linha(null),
      linha("2026-10-17T15:00:00Z"),
    ];
    const anteriores = Array.from({ length: 5 }, (_, i) =>
      linha(`2026-10-0${i + 1}T15:00:00Z`)
    );
    expect(indicadores(atuais, anteriores)).toEqual({
      usados: 3,
      gerados: 4,
      taxaDeUso: 0.75,
      assinantes: 2,
      casas: 2,
      usadosAntes: 5,
      variacao: -0.4,
    });
  });

  it("com menos de 5 usos na base, não calcula porcentagem", () => {
    const resultado = indicadores(
      [linha("2026-10-15T15:00:00Z")],
      [linha("2026-10-08T15:00:00Z")]
    );
    expect(resultado).toMatchObject({ usadosAntes: 1, variacao: null });
  });

  it("sem base anterior nem códigos, não inventa número", () => {
    expect(indicadores([], [])).toMatchObject({
      taxaDeUso: null,
      variacao: null,
    });
  });
});

describe("séries e rankings", () => {
  it("série diária com os dias vazios em zero", () => {
    const serie = seriePorDia(
      [linha("2026-10-16T15:00:00Z"), linha("2026-10-16T20:00:00Z")],
      new Date("2026-10-15T03:00:00Z"),
      new Date("2026-10-17T15:00:00Z")
    );
    expect(serie).toEqual([
      { dia: "2026-10-15", usados: 0 },
      { dia: "2026-10-16", usados: 2 },
      { dia: "2026-10-17", usados: 0 },
    ]);
  });

  it("mapa de calor no dia e hora de Brasília", () => {
    // Sábado 17/10 às 21h em Brasília = domingo 00h UTC.
    const mapa = mapaDeCalor([linha("2026-10-18T00:30:00Z")]);
    expect(mapa[6]![21]).toBe(1);
    expect(mapa.flat().reduce((a, b) => a + b, 0)).toBe(1);
  });

  it("ranking do mais usado para o menos usado", () => {
    expect(
      ranking(
        [
          linha("2026-10-16T15:00:00Z", { casa: "Choperia" }),
          linha("2026-10-16T15:00:00Z", { casa: "Rancho" }),
          linha("2026-10-16T16:00:00Z", { casa: "Rancho" }),
          linha(null, { casa: "Café" }),
        ],
        "casa"
      )
    ).toEqual([
      { nome: "Rancho", usados: 2 },
      { nome: "Choperia", usados: 1 },
    ]);
  });
});

describe("CSV", () => {
  it("sem o assinante, com ; e fórmula neutralizada", () => {
    const csv = csvDosResgates([
      linha("2026-10-16T15:00:00Z", { beneficio: "=HYPERLINK(1)" }),
    ]);
    const [cabecalho, primeira] = csv.split("\r\n");
    expect(cabecalho).toBe(
      '"Gerado em";"Usado em";"Situação";"Casa";"Benefício";"Operador"'
    );
    expect(primeira).toContain(`"'=HYPERLINK(1)"`);
    expect(primeira).toContain('"usado"');
    expect(csv).not.toContain("a1");
  });
});
