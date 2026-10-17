import { describe, expect, it } from "vitest";

import { estiloDaPilula } from "./estilo";

const classes = (estilo: string) => estilo.split(/\s+/);

describe("estiloDaPilula", () => {
  it("inativa por padrão: superfície com borda", () => {
    const inativa = classes(estiloDaPilula());
    expect(inativa).toContain("bg-surface");
    expect(inativa).not.toContain("bg-primary-solid");
  });

  it("ativa: laranja sólido com texto branco", () => {
    const ativa = classes(estiloDaPilula({ ativa: true }));
    expect(ativa).toContain("bg-primary-solid");
    expect(ativa).toContain("text-primary-solid-foreground");
  });

  it("a classe de quem usa vence quando conflita", () => {
    expect(classes(estiloDaPilula({ className: "h-11" }))).not.toContain("h-9");
  });
});
