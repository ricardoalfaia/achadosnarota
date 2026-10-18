import { describe, expect, it } from "vitest";

import {
  montarCartoes,
  notaDe,
  type LinhaDaFoto,
  type LinhaDoBeneficio,
  type LinhaDoLugar,
} from "./montagem";

const lugar = (
  id: string,
  extra: Partial<LinhaDoLugar> = {}
): LinhaDoLugar => ({
  id,
  slug: `lugar-${id}`,
  nome: `Lugar ${id}`,
  especialidade: "Restaurante",
  resumo: "Resumo.",
  cidade: "Pindamonhangaba",
  uf: "SP",
  categoriaSlug: "restaurantes",
  categoriaNome: "Restaurantes",
  nota: "4.8",
  selo: "featured",
  ...extra,
});

const foto = (lugarId: string, posicao: number): LinhaDaFoto => ({
  lugarId,
  posicao,
  url: `/f/${lugarId}-${posicao}.webp`,
  alt: `Foto ${posicao}`,
});

const beneficio = (lugarId: string, posicao: number): LinhaDoBeneficio => ({
  lugarId,
  posicao,
  id: `b-${lugarId}-${posicao}`,
  titulo: `Benefício ${posicao}`,
  regras: "Regras.",
  icone: "percent",
  tipo: "discount",
  limite: 1,
  periodo: "year",
});

describe("montarCartoes", () => {
  it("usa a primeira foto e o primeiro benefício pela posição", () => {
    const [cartao] = montarCartoes(
      [lugar("a")],
      [foto("a", 2), foto("a", 0), foto("a", 1)],
      [beneficio("a", 1), beneficio("a", 0)]
    );
    expect(cartao?.foto?.url).toBe("/f/a-0.webp");
    expect(cartao?.beneficio).toEqual({
      titulo: "Benefício 0",
      icone: "percent",
    });
    expect(cartao?.local).toBe("Pindamonhangaba - SP");
    expect(cartao?.nota).toBe(4.8);
  });

  it("lugar sem foto, avaliação ou benefício não ganha campo inventado", () => {
    const [cartao] = montarCartoes(
      [lugar("b", { nota: null, selo: null })],
      [foto("a", 0)],
      []
    );
    expect(cartao).not.toHaveProperty("foto");
    expect(cartao).not.toHaveProperty("nota");
    expect(cartao).not.toHaveProperty("selo");
    expect(cartao).not.toHaveProperty("beneficio");
  });

  it("não leva o id interno do lugar para a interface", () => {
    const [cartao] = montarCartoes([lugar("01JINTERNO")], [], []);
    expect(JSON.stringify(cartao)).not.toContain('"id"');
  });

  it("mantém a ordem dos lugares", () => {
    const cartoes = montarCartoes([lugar("b"), lugar("a")], [], []);
    expect(cartoes.map((c) => c.slug)).toEqual(["lugar-b", "lugar-a"]);
  });
});

describe("notaDe", () => {
  it("converte o numeric do Postgres", () => {
    expect(notaDe("4.9")).toBe(4.9);
    expect(notaDe(null)).toBeUndefined();
    expect(notaDe("x")).toBeUndefined();
  });
});
