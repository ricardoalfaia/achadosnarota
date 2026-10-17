import { describe, expect, it } from "vitest";

import { chavesDaEntrada, estaBloqueado, REGRAS, type Regra } from "./limite";

const REGRA: Regra = { janelaEmSegundos: 60, maximo: 3 };
const AGORA = 1_800_000_000_000;

describe("estaBloqueado", () => {
  it("sem registro, ou abaixo do máximo, deixa tentar", () => {
    expect(estaBloqueado(undefined, REGRA, AGORA)).toBe(false);
    expect(
      estaBloqueado({ count: 2, lastRequest: AGORA - 1_000 }, REGRA, AGORA)
    ).toBe(false);
  });

  it("no máximo, dentro da janela, bloqueia", () => {
    expect(
      estaBloqueado({ count: 3, lastRequest: AGORA - 59_000 }, REGRA, AGORA)
    ).toBe(true);
  });

  it("com a janela vencida, a contagem antiga não vale mais", () => {
    expect(
      estaBloqueado({ count: 30, lastRequest: AGORA - 60_000 }, REGRA, AGORA)
    ).toBe(false);
  });
});

describe("chavesDaEntrada", () => {
  it("separa conta e IP, cada um com a sua regra, sem misturar com o Better Auth", () => {
    const chaves = chavesDaEntrada("hash-da-conta", "hash-do-ip");
    expect(chaves.conta).toEqual({
      chave: "achados:entrada:conta:hash-da-conta",
      regra: REGRAS.entradaPorConta,
    });
    expect(chaves.ip.chave).toBe("achados:entrada:ip:hash-do-ip");
    expect(chaves.ip.regra.maximo).toBeGreaterThan(chaves.conta.regra.maximo);
  });
});
