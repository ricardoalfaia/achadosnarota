import { describe, expect, it } from "vitest";

import {
  ehEnderecoLocal,
  emailDeRedefinicao,
  resolverTransporte,
} from "./transporte";

const LOCAL = { ambiente: "local", appUrl: "http://localhost:4400" } as const;
const PRODUCAO = {
  ambiente: "production",
  appUrl: "https://app.meuproduto.com.br",
} as const;

describe("resolverTransporte", () => {
  it("usa o Resend quando há chave e remetente", () => {
    expect(
      resolverTransporte({
        ...PRODUCAO,
        resendApiKey: "re_x",
        remetente: "Meuproduto <a@b.c>",
      })
    ).toBe("resend");
  });

  it("sem transporte, cai no console só no ambiente local", () => {
    expect(resolverTransporte(LOCAL)).toBe("console");
    expect(resolverTransporte(PRODUCAO)).toBe("nenhum");
    expect(resolverTransporte({ ...PRODUCAO, ambiente: "homolog" })).toBe(
      "nenhum"
    );
    // Chave sem remetente não basta.
    expect(resolverTransporte({ ...PRODUCAO, resendApiKey: "re_x" })).toBe(
      "nenhum"
    );
  });

  it("a caixa de teste só vale com o app num endereço local", () => {
    expect(
      resolverTransporte({
        ...PRODUCAO,
        appUrl: "http://127.0.0.1:4401",
        caixaDeTeste: "e2e/saida/caixa.jsonl",
      })
    ).toBe("caixa");
    expect(
      resolverTransporte({ ...PRODUCAO, caixaDeTeste: "/tmp/caixa.jsonl" })
    ).toBe("nenhum");
  });
});

describe("ehEnderecoLocal", () => {
  it("reconhece só os endereços da própria máquina", () => {
    expect(ehEnderecoLocal("http://127.0.0.1:4401")).toBe(true);
    expect(ehEnderecoLocal("http://localhost:4400")).toBe(true);
    expect(ehEnderecoLocal("https://localhost.meuproduto.com.br")).toBe(false);
    expect(ehEnderecoLocal("não é url")).toBe(false);
  });
});

describe("emailDeRedefinicao", () => {
  it("leva o link no texto e no HTML, com o HTML escapado e só o primeiro nome", () => {
    const email = emailDeRedefinicao({
      para: "ana@exemplo.com.br",
      nome: "Ana <b>Souza</b>",
      url: "http://localhost:4400/login/redefinir?token=abc&x=1",
      validadeEmMinutos: 60,
    });

    expect(email.para).toBe("ana@exemplo.com.br");
    expect(email.texto).toContain(
      "http://localhost:4400/login/redefinir?token=abc&x=1"
    );
    expect(email.texto).toContain("Olá, Ana.");
    expect(email.texto).not.toContain("Souza");
    expect(email.html).toContain("token=abc&amp;x=1");
    expect(email.html).not.toContain("<b>");
  });
});
