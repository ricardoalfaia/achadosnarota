import { describe, expect, it } from "vitest";

import { exigeMfa, motivoDaRecusa, pendenciasDaConta } from "./regras";

describe("exigeMfa", () => {
  it("owner e admin em qualquer tenant exigem segundo fator; member e viewer não", () => {
    expect(exigeMfa(["owner"])).toBe(true);
    expect(exigeMfa(["member", "admin"])).toBe(true);
    expect(exigeMfa(["member", "viewer"])).toBe(false);
    expect(exigeMfa([])).toBe(false);
  });
});

describe("pendenciasDaConta", () => {
  const conta = {
    mustChangePassword: false,
    twoFactorEnabled: false,
    papeis: ["member"] as const,
  };

  it("conta comum sem pendências entra direto", () => {
    expect(pendenciasDaConta(conta)).toEqual([]);
  });

  it("owner sem autenticador precisa configurá-lo; com ele, não", () => {
    expect(pendenciasDaConta({ ...conta, papeis: ["owner"] })).toEqual([
      "configurarDoisFatores",
    ]);
    expect(
      pendenciasDaConta({ ...conta, papeis: ["owner"], twoFactorEnabled: true })
    ).toEqual([]);
  });

  it("a troca obrigatória de senha vem antes do autenticador", () => {
    expect(
      pendenciasDaConta({
        ...conta,
        mustChangePassword: true,
        papeis: ["admin"],
      })
    ).toEqual(["trocaDeSenha", "configurarDoisFatores"]);
  });
});

describe("motivoDaRecusa", () => {
  it("traduz os códigos do Better Auth sem dizer se o e-mail existe", () => {
    expect(
      motivoDaRecusa({ status: 401, codigo: "INVALID_EMAIL_OR_PASSWORD" })
    ).toBe("credenciaisInvalidas");
    expect(motivoDaRecusa({ status: 400, codigo: "INVALID_EMAIL" })).toBe(
      "credenciaisInvalidas"
    );
  });

  it("códigos do segundo fator e bloqueios", () => {
    expect(motivoDaRecusa({ status: 401, codigo: "INVALID_CODE" })).toBe(
      "codigoIncorreto"
    );
    expect(motivoDaRecusa({ status: 401, codigo: "INVALID_BACKUP_CODE" })).toBe(
      "codigoIncorreto"
    );
    expect(
      motivoDaRecusa({ status: 429, codigo: "ACCOUNT_TEMPORARILY_LOCKED" })
    ).toBe("muitasTentativas");
    expect(
      motivoDaRecusa({ status: 401, codigo: "INVALID_TWO_FACTOR_COOKIE" })
    ).toBe("etapaExpirada");
  });

  it("429 é sempre excesso de tentativas, com ou sem código", () => {
    expect(motivoDaRecusa({ status: 429 })).toBe("muitasTentativas");
  });

  it("senha e link de redefinição", () => {
    expect(motivoDaRecusa({ status: 400, codigo: "PASSWORD_TOO_SHORT" })).toBe(
      "senhaCurta"
    );
    expect(motivoDaRecusa({ status: 400, codigo: "INVALID_PASSWORD" })).toBe(
      "senhaIncorreta"
    );
    expect(motivoDaRecusa({ status: 400, codigo: "INVALID_TOKEN" })).toBe(
      "linkInvalido"
    );
  });

  it("código desconhecido vira uma recusa genérica", () => {
    expect(motivoDaRecusa({ status: 400, codigo: "QUALQUER_OUTRO" })).toBe(
      "recusado"
    );
    expect(motivoDaRecusa({ status: 403 })).toBe("recusado");
  });
});
