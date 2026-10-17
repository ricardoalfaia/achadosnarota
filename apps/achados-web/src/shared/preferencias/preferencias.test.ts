import { describe, expect, it } from "vitest";

import {
  atributoDoTema,
  cookieDaPreferencia,
  corDaBarra,
  lerPreferencias,
  PREFERENCIAS_PADRAO,
} from "./preferencias";

const cookies = (valores: Record<string, string>) => (nome: string) =>
  valores[nome];

describe("lerPreferencias", () => {
  it("sem cookies, devolve o padrão: tema claro e português", () => {
    expect(lerPreferencias(cookies({}))).toEqual(PREFERENCIAS_PADRAO);
    expect(PREFERENCIAS_PADRAO).toEqual({ tema: "light", idioma: "pt-BR" });
  });

  it("lê tema e idioma gravados", () => {
    expect(
      lerPreferencias(
        cookies({ "achados-tema": "dark", "achados-idioma": "pt-BR" })
      )
    ).toEqual({ tema: "dark", idioma: "pt-BR" });
    expect(lerPreferencias(cookies({ "achados-tema": "light" })).tema).toBe(
      "light"
    );
  });

  it("valor desconhecido cai no padrão em vez de chegar à tela", () => {
    expect(
      lerPreferencias(
        cookies({ "achados-tema": "sepia", "achados-idioma": "fr" })
      )
    ).toEqual(PREFERENCIAS_PADRAO);
  });
});

describe("atributoDoTema", () => {
  it("auto não gera atributo, para o sistema operacional decidir", () => {
    expect(atributoDoTema("auto")).toBeUndefined();
    expect(atributoDoTema("dark")).toBe("dark");
    expect(atributoDoTema("light")).toBe("light");
  });
});

describe("cookieDaPreferencia", () => {
  it("vale para o site inteiro por um ano", () => {
    expect(cookieDaPreferencia("tema", "dark")).toBe(
      "achados-tema=dark; Path=/; Max-Age=31536000; SameSite=Lax"
    );
  });

  it("o que é gravado é lido de volta igual", () => {
    const gravado = cookieDaPreferencia("tema", "auto");
    const valor = gravado.split(";")[0]?.split("=")[1] ?? "";
    expect(lerPreferencias(cookies({ "achados-tema": valor })).tema).toBe(
      "auto"
    );
  });
});

describe("corDaBarra", () => {
  it("segue o tema escolhido e, em auto, o do aparelho", () => {
    expect(corDaBarra("light")).toBe("#f15a24");
    expect(corDaBarra("dark")).toBe("#06131e");
    expect(corDaBarra("auto")).toEqual([
      { media: "(prefers-color-scheme: light)", color: "#f15a24" },
      { media: "(prefers-color-scheme: dark)", color: "#06131e" },
    ]);
  });
});
