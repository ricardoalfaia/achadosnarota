import { describe, expect, it } from "vitest";

import {
  chaveDoAutenticador,
  lerRespostaDaEntrada,
  mensagemDaRecusa,
  tipoDoCodigo,
} from "./entrada";

describe("entrada no painel", () => {
  it("lê o desafio do 2FA, a sessão aberta e recusa o resto", () => {
    expect(lerRespostaDaEntrada({ twoFactorRedirect: true })).toEqual({
      tipo: "segundoFator",
    });
    expect(
      lerRespostaDaEntrada({ token: "t", user: { id: "01ABC", name: "Ana" } })
    ).toEqual({ tipo: "sessao", usuarioId: "01ABC" });
    expect(lerRespostaDaEntrada({ ok: true })).toBeNull();
  });

  it("tira a chave base32 do otpauth e recusa outra coisa", () => {
    expect(
      chaveDoAutenticador(
        "otpauth://totp/Painel:ana?secret=JBSWY3DPEHPK3PXP&issuer=Painel"
      )
    ).toBe("JBSWY3DPEHPK3PXP");
    expect(chaveDoAutenticador("https://exemplo.com/?secret=X")).toBeNull();
    expect(chaveDoAutenticador("não é url")).toBeNull();
  });

  it("separa código do autenticador de código de recuperação", () => {
    expect(tipoDoCodigo("123 456")).toEqual({
      tipo: "autenticador",
      codigo: "123456",
    });
    expect(tipoDoCodigo("abcde-12345")).toEqual({
      tipo: "recuperacao",
      codigo: "abcde-12345",
    });
    expect(tipoDoCodigo("12")).toBeNull();
  });

  it("não diz se a conta existe; avisa do limite de tentativas", () => {
    expect(mensagemDaRecusa(401)).toBe("E-mail ou senha incorretos.");
    expect(mensagemDaRecusa(429)).toMatch(/Muitas tentativas/);
  });
});
