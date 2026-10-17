import { describe, expect, it } from "vitest";

import { pessoaDaSessao, primeiroNome, type UsuarioDaSessao } from "./sessao";

describe("primeiroNome", () => {
  it("fica com a primeira palavra do nome", () => {
    expect(primeiroNome("  Ana Souza Lima ")).toBe("Ana");
    expect(primeiroNome("Ana")).toBe("Ana");
    expect(primeiroNome("   ")).toBe("");
  });
});

const USUARIO: UsuarioDaSessao = {
  id: "01JABCDEFGHJKMNPQRSTVWXYZ0",
  nome: "Ana Viajante",
  email: "ana@exemplo.com.br",
  criadoEm: new Date("2026-10-01T12:00:00Z"),
};

describe("pessoaDaSessao", () => {
  it("entrega à interface só o nome e a foto, sem id nem e-mail", () => {
    const recorte = pessoaDaSessao(USUARIO);
    expect(recorte).toEqual({ nome: "Ana Viajante" });
    expect(JSON.stringify(recorte)).not.toContain(USUARIO.id);
    expect(JSON.stringify(recorte)).not.toContain(USUARIO.email);
  });

  it("leva a foto quando houver", () => {
    expect(
      pessoaDaSessao({ ...USUARIO, foto: "https://example.com/a.jpg" })
    ).toEqual({ nome: "Ana Viajante", fotoUrl: "https://example.com/a.jpg" });
  });
});
