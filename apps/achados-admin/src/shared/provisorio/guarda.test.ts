import { describe, expect, it } from "vitest";

import {
  DADOS_PROVISORIOS_RECUSADOS,
  guardaDosDadosProvisorios,
} from "./guarda";

describe("guarda dos dados provisórios", () => {
  it("libera no desenvolvimento", () => {
    expect(
      guardaDosDadosProvisorios({ appEnv: "local", nodeEnv: "production" }).ok
    ).toBe(true);
    expect(
      guardaDosDadosProvisorios({ appEnv: undefined, nodeEnv: "development" })
        .ok
    ).toBe(true);
  });

  it.each([
    { appEnv: "homolog", nodeEnv: "production" },
    { appEnv: "production", nodeEnv: "production" },
    { appEnv: undefined, nodeEnv: "production" },
  ])("recusa fora do desenvolvimento ($appEnv, $nodeEnv)", (ambiente) => {
    const resultado = guardaDosDadosProvisorios(ambiente);
    expect(resultado.ok).toBe(false);
    if (!resultado.ok)
      expect(resultado.error.code).toBe(DADOS_PROVISORIOS_RECUSADOS);
  });
});
