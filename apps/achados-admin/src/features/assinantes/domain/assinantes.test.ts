import { describe, expect, it } from "vitest";

import {
  codificarCursor,
  impedimentoDaCortesia,
  lerBusca,
  lerCursor,
  lerSituacaoDoAssinante,
  mascararEmail,
  padraoDeBusca,
} from "./assinantes";

const ULID = "01JZ8Y6Q3K5V7W9X1A2B3C4D5E";

describe("mascararEmail", () => {
  it("mostra só o começo do usuário e o domínio", () => {
    expect(mascararEmail("ana.souza@gmail.com")).toBe("an•••@gmail.com");
    expect(mascararEmail("al@x.com")).toBe("a•••@x.com");
    expect(mascararEmail("sem-arroba")).toBe("•••");
  });
});

describe("filtros da URL", () => {
  it("a busca perde espaços e passa de 80 caracteres não", () => {
    expect(lerBusca("  ana  ")).toBe("ana");
    expect(lerBusca("x".repeat(200))).toHaveLength(80);
    expect(lerBusca(["ana"])).toBe("");
  });

  it("situação desconhecida vale como todos", () => {
    expect(lerSituacaoDoAssinante("cortesia")).toBe("cortesia");
    expect(lerSituacaoDoAssinante("admin")).toBe("todos");
  });

  it("% e _ digitados não viram curinga", () => {
    expect(padraoDeBusca("50%_off")).toBe("%50\\%\\_off%");
  });
});

describe("cursor", () => {
  it("vai e volta", () => {
    const cursor = { desde: new Date("2026-10-01T12:00:00Z"), id: ULID };
    expect(lerCursor(codificarCursor(cursor))).toEqual(cursor);
  });

  it("recusa o que não foi gerado aqui", () => {
    expect(lerCursor("qualquer")).toBeNull();
    expect(
      lerCursor(Buffer.from("2026-10-01|1 or 1=1").toString("base64url"))
    ).toBeNull();
    expect(lerCursor(undefined)).toBeNull();
  });
});

describe("impedimentoDaCortesia", () => {
  const cortesia = {
    inicio: "2026-10-01T00:00:00Z",
    fim: "2026-10-08T00:00:00Z",
    liberadaPor: "Ricardo",
    revogadaEm: null,
    revogadaPor: null,
  };

  it("uma por pessoa, e não para quem já paga", () => {
    expect(
      impedimentoDaCortesia({ situacao: "sem", cortesia: null })
    ).toBeNull();
    expect(impedimentoDaCortesia({ situacao: "encerrado", cortesia })).toMatch(
      /uma por pessoa/
    );
    expect(impedimentoDaCortesia({ situacao: "pago", cortesia: null })).toMatch(
      /pago ativo/
    );
  });
});
