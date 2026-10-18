import { describe, expect, it } from "vitest";

import { filtrarRegistros, TODAS } from "@/shared/cadastro/filtro";
import {
  comSituacao,
  nomesDosOperadores,
  resumoDoBalcao,
  textoDaCasa,
  type CasaComOperadores,
} from "./balcao";

const gabi = {
  usuarioId: "u1",
  nome: "Gabi do Balcão",
  email: "gabi@teste.local",
};
const rui = { usuarioId: "u2", nome: "Rui Garçom", email: "rui@teste.local" };

const CASAS: CasaComOperadores[] = [
  { id: "c1", nome: "Café da Serra", cidade: "Petrópolis", operadores: [] },
  {
    id: "c2",
    nome: "Choperia Pinguim",
    cidade: "Ribeirão Preto",
    operadores: [gabi],
  },
  {
    id: "c3",
    nome: "Rancho Português",
    cidade: "Itaipava",
    operadores: [gabi, rui],
  },
];

describe("comSituacao", () => {
  it("marca quem tem e quem não tem operador", () => {
    expect(comSituacao(CASAS).map((c) => c.status)).toEqual([
      "sem",
      "com",
      "com",
    ]);
  });
});

describe("busca", () => {
  const lista = comSituacao(CASAS);
  const buscar = (
    busca: string,
    situacao: "sem" | "com" | typeof TODAS = TODAS
  ) =>
    filtrarRegistros(lista, { situacao, busca, textoDe: textoDaCasa }).map(
      (c) => c.id
    );

  it("acha pela casa, pela cidade, pelo operador e pelo e-mail, sem acento", () => {
    expect(buscar("cafe")).toEqual(["c1"]);
    expect(buscar("ribeirao")).toEqual(["c2"]);
    expect(buscar("gabi")).toEqual(["c2", "c3"]);
    expect(buscar("rui@teste")).toEqual(["c3"]);
  });

  it("combina a busca com a situação", () => {
    expect(buscar("", "sem")).toEqual(["c1"]);
    expect(buscar("gabi", "com")).toEqual(["c2", "c3"]);
  });
});

describe("resumoDoBalcao", () => {
  it("conta casas por situação e pessoas distintas", () => {
    expect(resumoDoBalcao(CASAS)).toEqual({
      casas: 3,
      comOperador: 2,
      semOperador: 1,
      operadores: 2,
    });
  });
});

describe("nomesDosOperadores", () => {
  it("resume a lista em uma linha", () => {
    expect(nomesDosOperadores([])).toBe("");
    expect(nomesDosOperadores([gabi])).toBe("Gabi do Balcão");
    expect(nomesDosOperadores([gabi, rui])).toBe("Gabi do Balcão e Rui Garçom");
    expect(nomesDosOperadores([gabi, rui, gabi, rui])).toBe(
      "Gabi do Balcão, Rui Garçom e mais 2"
    );
  });
});
