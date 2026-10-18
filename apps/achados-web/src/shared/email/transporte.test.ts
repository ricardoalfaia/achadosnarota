import { describe, expect, it } from "vitest";

import {
  ehEnderecoLocal,
  emailDeAssinaturaConfirmada,
  emailDeBoasVindas,
  emailDeRedefinicao,
  resolverTransporte,
} from "./transporte";

const LOCAL = { ambiente: "local", appUrl: "http://localhost:4500" } as const;
const PRODUCAO = {
  ambiente: "production",
  appUrl: "https://app.achados.com.br",
} as const;

describe("resolverTransporte", () => {
  it("usa o Resend quando há chave e remetente", () => {
    expect(
      resolverTransporte({
        ...PRODUCAO,
        resendApiKey: "re_x",
        remetente: "Achados na Rota <a@b.c>",
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
        appUrl: "http://127.0.0.1:4501",
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
    expect(ehEnderecoLocal("http://127.0.0.1:4501")).toBe(true);
    expect(ehEnderecoLocal("http://localhost:4500")).toBe(true);
    expect(ehEnderecoLocal("https://localhost.achados.com.br")).toBe(false);
    expect(ehEnderecoLocal("não é url")).toBe(false);
  });
});

describe("emailDeRedefinicao", () => {
  it("leva o link no texto e no HTML, com o HTML escapado e só o primeiro nome", () => {
    const email = emailDeRedefinicao({
      para: "ana@exemplo.com.br",
      nome: "Ana <b>Souza</b>",
      url: "http://localhost:4500/login/redefinir?token=abc&x=1",
      validadeEmMinutos: 60,
    });

    expect(email.para).toBe("ana@exemplo.com.br");
    expect(email.texto).toContain(
      "http://localhost:4500/login/redefinir?token=abc&x=1"
    );
    expect(email.texto).toContain("Olá, Ana.");
    expect(email.texto).not.toContain("Souza");
    expect(email.html).toContain("token=abc&amp;x=1");
    expect(email.html).not.toContain("<b>");
  });
});

describe("e-mails da marca", () => {
  it("boas-vindas pelo primeiro nome, com o link e sem o e-mail no corpo", () => {
    const email = emailDeBoasVindas({
      para: "ana@exemplo.com.br",
      nome: "Ana Viajante",
      url: "https://achados.exemplo/",
    });
    expect(email.assunto).toBe("Boas-vindas ao Achados na Rota");
    expect(email.texto).toContain("Olá, Ana!");
    expect(email.texto).toContain("https://achados.exemplo/");
    expect(email.html).not.toContain("ana@exemplo.com.br");
  });

  it("assinatura confirmada traz a validade e escapa o HTML", () => {
    const email = emailDeAssinaturaConfirmada({
      para: "a@b.c",
      nome: "<b>Bruno</b>",
      validoAte: "17/10/2027",
      url: "https://achados.exemplo/passaporte",
    });
    expect(email.texto).toContain("ativo até 17/10/2027");
    expect(email.html).toContain("&lt;b&gt;Bruno&lt;/b&gt;");
    expect(email.html).not.toContain("<b>Bruno</b>");
  });
});
