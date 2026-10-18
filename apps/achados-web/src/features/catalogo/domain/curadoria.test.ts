import { describe, expect, it } from "vitest";

import { criteriosAvaliados, ganhaOSelo, mediaDosCriterios } from "./curadoria";

const todos = (nota: number) =>
  criteriosAvaliados({
    hygiene: nota,
    presentation: nota,
    flavor: nota,
    sophistication: nota,
    service: nota,
    ambience: nota,
    value: nota,
  });

describe("criteriosAvaliados", () => {
  it("segue a ordem pública e deixa de fora o que não se aplica", () => {
    const criterios = criteriosAvaliados({
      value: "4.7",
      hygiene: "5.0",
      presentation: null,
      flavor: undefined,
    });
    expect(criterios).toEqual([
      { chave: "hygiene", rotulo: "Higiene", nota: 5 },
      { chave: "value", rotulo: "Custo-benefício", nota: 4.7 },
    ]);
  });
});

describe("mediaDosCriterios", () => {
  it("arredonda para uma casa; sem critérios, não há média", () => {
    expect(
      mediaDosCriterios(criteriosAvaliados({ hygiene: 4.9, flavor: 4.6 }))
    ).toBe(4.8);
    expect(mediaDosCriterios([])).toBeUndefined();
  });
});

describe("ganhaOSelo", () => {
  it("dá o selo com média 4,5 ou mais e nenhum critério abaixo de 4", () => {
    expect(ganhaOSelo(todos(4.5))).toBe(true);
    expect(ganhaOSelo(todos(4.4))).toBe(false);
  });

  it("um critério abaixo de 4 tira o selo, mesmo com média alta", () => {
    const criterios = criteriosAvaliados({
      hygiene: 5,
      presentation: 5,
      flavor: 5,
      sophistication: 3.9,
      service: 5,
      ambience: 5,
      value: 5,
    });
    expect(mediaDosCriterios(criterios)).toBeGreaterThanOrEqual(4.5);
    expect(ganhaOSelo(criterios)).toBe(false);
  });

  it("pede pelo menos quatro critérios avaliados", () => {
    expect(
      ganhaOSelo(criteriosAvaliados({ hygiene: 5, flavor: 5, value: 5 }))
    ).toBe(false);
    expect(
      ganhaOSelo(
        criteriosAvaliados({ hygiene: 5, flavor: 5, value: 5, service: 5 })
      )
    ).toBe(true);
  });
});
