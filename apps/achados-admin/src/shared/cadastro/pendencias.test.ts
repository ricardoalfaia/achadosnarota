import { describe, expect, it } from "vitest";

import {
  contagemPorSecao,
  erroDoCampo,
  primeiraSecaoComPendencia,
  type Pendencia,
} from "./pendencias";

type P = Pendencia<"nome" | "telefone" | "site", "dados" | "contato">;

const pendencias: P[] = [
  { campo: "telefone", secao: "contato", motivo: "Telefone com DDD" },
  { campo: "site", secao: "contato", motivo: "Endereço do site inválido" },
  { campo: "nome", secao: "dados", motivo: "Informe o nome" },
];

describe("pendências do cadastro", () => {
  it("devolve o motivo do campo", () => {
    expect(erroDoCampo(pendencias, "nome")).toBe("Informe o nome");
    expect(erroDoCampo<P["campo"], P["secao"]>([], "nome")).toBeUndefined();
  });

  it("conta por seção", () => {
    expect(contagemPorSecao(pendencias)).toEqual({ contato: 2, dados: 1 });
  });

  it("acha a primeira seção com problema na ordem das abas", () => {
    expect(primeiraSecaoComPendencia(pendencias, ["dados", "contato"])).toBe(
      "dados"
    );
    expect(
      primeiraSecaoComPendencia(pendencias.slice(0, 2), ["dados", "contato"])
    ).toBe("contato");
    expect(primeiraSecaoComPendencia([], ["dados", "contato"])).toBeUndefined();
  });
});
