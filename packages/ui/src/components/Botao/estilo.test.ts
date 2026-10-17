import { describe, expect, it } from "vitest";

import { estiloDoBotao } from "./estilo";

const classes = (estilo: string) => estilo.split(/\s+/);

describe("estiloDoBotao", () => {
  it("sem argumentos, é o botão sólido no tamanho padrão", () => {
    const padrao = classes(estiloDoBotao());
    expect(padrao).toContain("bg-linear-135");
    expect(padrao).toContain("from-primary-solid-start");
    expect(padrao).toContain("to-primary-solid-end");
    expect(padrao).toContain("h-control-sm");
  });

  it("cada variante e intenção tem a sua aparência", () => {
    expect(classes(estiloDoBotao({ variante: "contorno" }))).toContain(
      "bg-surface"
    );
    expect(classes(estiloDoBotao({ variante: "fantasma" }))).toContain(
      "border-transparent"
    );
    expect(classes(estiloDoBotao({ intencao: "perigo" }))).toContain(
      "bg-danger-solid"
    );
  });

  it("o tamanho define a altura; só com ícone, o botão é quadrado", () => {
    expect(classes(estiloDoBotao({ tamanho: "lg" }))).toContain("h-control-lg");
    const quadrado = classes(
      estiloDoBotao({ tamanho: "xs", somenteIcone: true })
    );
    expect(quadrado).toContain("size-control-xs");
    expect(quadrado).not.toContain("h-control-xs");
  });

  it("uma classe de quem usa vence a do botão quando as duas conflitam", () => {
    const largo = classes(estiloDoBotao({ className: "h-control-md w-full" }));
    expect(largo).toContain("h-control-md");
    expect(largo).toContain("w-full");
    expect(largo).not.toContain("h-control-sm");
  });
});
