import { describe, expect, it } from "vitest";

import {
  chaveDoAutenticador,
  lerRespostaDaEntrada,
  proximoPasso,
} from "./etapas";

describe("lerRespostaDaEntrada", () => {
  it("reconhece o desafio do segundo fator", () => {
    expect(
      lerRespostaDaEntrada({ twoFactorRedirect: true, twoFactorMethods: [] })
    ).toEqual({ tipo: "segundoFator" });
  });

  it("lê o usuário da sessão aberta e descarta o token", () => {
    const lido = lerRespostaDaEntrada({
      redirect: false,
      token: "token-da-sessao",
      user: {
        id: "u1",
        email: "ana@exemplo.com.br",
        twoFactorEnabled: false,
        mustChangePassword: true,
      },
    });

    expect(lido).toEqual({
      tipo: "sessao",
      usuario: { id: "u1", twoFactorEnabled: false, mustChangePassword: true },
    });
    expect(JSON.stringify(lido)).not.toContain("token-da-sessao");
  });

  it("campos ausentes valem como desligados; formato estranho vira null", () => {
    expect(lerRespostaDaEntrada({ user: { id: "u1" } })).toEqual({
      tipo: "sessao",
      usuario: { id: "u1", twoFactorEnabled: false, mustChangePassword: false },
    });
    expect(lerRespostaDaEntrada(null)).toBeNull();
    expect(lerRespostaDaEntrada({ twoFactorRedirect: "sim" })).toBeNull();
  });
});

describe("proximoPasso", () => {
  const conta = {
    mustChangePassword: false,
    twoFactorEnabled: false,
    exigeMfa: false,
  };

  it("com o 2FA ligado, a próxima etapa é o código", () => {
    expect(proximoPasso({ tipo: "segundoFator" })).toBe("doisFatores");
  });

  it("sem pendências, a entrada termina", () => {
    expect(proximoPasso({ tipo: "conta", conta })).toBe("concluida");
  });

  it("senha provisória leva à troca; conta que exige MFA sem autenticador, à configuração", () => {
    expect(
      proximoPasso({
        tipo: "conta",
        conta: { ...conta, mustChangePassword: true, exigeMfa: true },
      })
    ).toBe("trocaDeSenha");
    expect(
      proximoPasso({ tipo: "conta", conta: { ...conta, exigeMfa: true } })
    ).toBe("configurarDoisFatores");
    expect(
      proximoPasso({
        tipo: "conta",
        conta: { ...conta, exigeMfa: true, twoFactorEnabled: true },
      })
    ).toBe("concluida");
  });
});

describe("chaveDoAutenticador", () => {
  it("tira a chave base32 da URI otpauth", () => {
    expect(
      chaveDoAutenticador(
        "otpauth://totp/Achados na Rota:ana%40exemplo.com.br?secret=JBSWY3DPEHPK3PXP&issuer=Achados na Rota&digits=6&period=30"
      )
    ).toBe("JBSWY3DPEHPK3PXP");
  });

  it("recusa o que não é otpauth ou não tem chave válida", () => {
    expect(chaveDoAutenticador("https://exemplo.com/?secret=ABC")).toBeNull();
    expect(chaveDoAutenticador("otpauth://totp/x?secret=abc!")).toBeNull();
    expect(chaveDoAutenticador("lixo")).toBeNull();
  });
});
