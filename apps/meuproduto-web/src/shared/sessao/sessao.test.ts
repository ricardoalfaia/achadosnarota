import { describe, expect, it } from "vitest";

import {
  primeiroNome,
  sessaoDoCliente,
  tenantsDaLista,
  type ContextoDoTenant,
} from "./sessao";

describe("primeiroNome", () => {
  it("fica com a primeira palavra do nome", () => {
    expect(primeiroNome("  Ana Souza Lima ")).toBe("Ana");
    expect(primeiroNome("Ana")).toBe("Ana");
    expect(primeiroNome("   ")).toBe("");
  });
});

const CONTEXTO: ContextoDoTenant = {
  usuario: {
    id: "usuario-interno-123",
    nome: "Ana Souza",
    email: "ana@exemplo.com.br",
  },
  tenant: {
    id: "8f6d2a52-6b1c-4d5e-9f00-000000000001",
    slug: "escritorio-demo",
    nome: "Escritório Demo",
  },
  papel: "owner",
  organizacao: { nome: "Organização Demo" },
};

describe("sessaoDoCliente", () => {
  it("entrega à interface nome, e-mail, organização e tenant, sem ids internos", () => {
    const recorte = sessaoDoCliente(CONTEXTO);

    expect(recorte).toEqual({
      nome: "Ana Souza",
      email: "ana@exemplo.com.br",
      organizacao: { nome: "Organização Demo" },
      tenant: {
        nome: "Escritório Demo",
        slug: "escritorio-demo",
        papel: "owner",
      },
    });
    const texto = JSON.stringify(recorte);
    expect(texto).not.toContain("usuario-interno-123");
    expect(texto).not.toContain(CONTEXTO.tenant.id);
  });

  it("leva a foto só quando existe", () => {
    expect(
      sessaoDoCliente({
        ...CONTEXTO,
        usuario: { ...CONTEXTO.usuario, foto: "https://exemplo.com/a.png" },
      }).fotoUrl
    ).toBe("https://exemplo.com/a.png");
  });
});

describe("tenantsDaLista", () => {
  it("deixa só nome e endereço de cada tenant", () => {
    expect(
      tenantsDaLista([
        {
          tenantId: CONTEXTO.tenant.id,
          slug: "escritorio-demo",
          nome: "Escritório Demo",
          papel: "member",
          organizacao: { nome: "Organização Demo" },
        },
      ])
    ).toEqual([{ nome: "Escritório Demo", slug: "escritorio-demo" }]);
  });
});
