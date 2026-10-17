import { describe, expect, it } from "vitest";

import {
  lerCodigo,
  lerConfirmacaoDeSenha,
  lerCredenciais,
  lerPedidoDeRecuperacao,
  lerRedefinicao,
  lerTrocaDeSenha,
} from "./credenciais";

describe("lerCredenciais", () => {
  it("aceita e-mail e senha, aparando e baixando só o e-mail", () => {
    const lido = lerCredenciais({
      email: "  Ana@Exemplo.com.br ",
      senha: " s3nh@ ",
    });

    expect(lido).toEqual({
      ok: true,
      value: { email: "ana@exemplo.com.br", senha: " s3nh@ " },
    });
  });

  it("aponta cada campo vazio ou ausente como obrigatório", () => {
    expect(lerCredenciais({ email: "   ", senha: "" })).toEqual({
      ok: false,
      error: { email: "obrigatorio", senha: "obrigatorio" },
    });
    expect(lerCredenciais({})).toEqual({
      ok: false,
      error: { email: "obrigatorio", senha: "obrigatorio" },
    });
  });

  it("recusa o que não é e-mail", () => {
    expect(lerCredenciais({ email: "ana", senha: "x" })).toEqual({
      ok: false,
      error: { email: "emailInvalido" },
    });
  });

  it("ignora campos que não fazem parte das credenciais", () => {
    const lido = lerCredenciais({
      email: "ana@exemplo.com.br",
      senha: "x",
      lembrar: "on",
    });

    expect(lido).toEqual({
      ok: true,
      value: { email: "ana@exemplo.com.br", senha: "x" },
    });
  });
});

describe("lerPedidoDeRecuperacao", () => {
  it("exige um e-mail válido", () => {
    expect(lerPedidoDeRecuperacao({ email: "" })).toEqual({
      ok: false,
      error: { email: "obrigatorio" },
    });
    expect(lerPedidoDeRecuperacao({ email: "ana@exemplo.com.br" })).toEqual({
      ok: true,
      value: { email: "ana@exemplo.com.br" },
    });
  });
});

describe("lerCodigo", () => {
  it("aceita os 6 dígitos do autenticador, ignorando espaços", () => {
    expect(lerCodigo({ codigo: "123 456" })).toEqual({
      ok: true,
      value: { tipo: "autenticador", codigo: "123456" },
    });
    expect(lerCodigo({ codigo: "12345" })).toEqual({
      ok: false,
      error: { codigo: "codigoInvalido" },
    });
  });

  it("com tipo=recuperacao, aceita o código de recuperação com ou sem hífen", () => {
    for (const codigo of ["AbCde-12345", "AbCde12345", " AbCde 12345 "]) {
      expect(lerCodigo({ tipo: "recuperacao", codigo })).toEqual({
        ok: true,
        value: { tipo: "recuperacao", codigo: "AbCde-12345" },
      });
    }
    expect(lerCodigo({ tipo: "recuperacao", codigo: "123456" })).toEqual({
      ok: false,
      error: { codigo: "codigoDeRecuperacaoInvalido" },
    });
  });
});

describe("lerTrocaDeSenha", () => {
  it("exige a senha nova com o tamanho mínimo e igual à confirmação", () => {
    expect(
      lerTrocaDeSenha({
        senhaAtual: "atual",
        novaSenha: "curta",
        confirmacao: "curta",
      })
    ).toEqual({ ok: false, error: { novaSenha: "senhaCurta" } });
    expect(
      lerTrocaDeSenha({
        senhaAtual: "atual",
        novaSenha: "uma-senha-longa",
        confirmacao: "outra-senha-longa",
      })
    ).toEqual({ ok: false, error: { confirmacao: "senhasDiferentes" } });
    expect(
      lerTrocaDeSenha({
        senhaAtual: "atual",
        novaSenha: "uma-senha-longa",
        confirmacao: "uma-senha-longa",
      }).ok
    ).toBe(true);
  });
});

describe("lerRedefinicao", () => {
  it("exige o token do link, além da senha nova e da confirmação", () => {
    expect(
      lerRedefinicao({
        token: "",
        novaSenha: "uma-senha-longa",
        confirmacao: "uma-senha-longa",
      })
    ).toEqual({ ok: false, error: { token: "obrigatorio" } });
    expect(
      lerRedefinicao({
        token: "tk",
        novaSenha: "uma-senha-longa",
        confirmacao: "uma-senha-longa",
      })
    ).toEqual({
      ok: true,
      value: {
        token: "tk",
        novaSenha: "uma-senha-longa",
        confirmacao: "uma-senha-longa",
      },
    });
  });
});

describe("lerConfirmacaoDeSenha", () => {
  it("devolve a senha digitada, sem aparar", () => {
    expect(lerConfirmacaoDeSenha({ senhaDeConfirmacao: " x " })).toEqual({
      ok: true,
      value: " x ",
    });
    expect(lerConfirmacaoDeSenha({})).toEqual({
      ok: false,
      error: { senhaDeConfirmacao: "obrigatorio" },
    });
  });
});
