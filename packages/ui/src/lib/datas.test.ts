import { describe, expect, it } from "vitest";

import { periodoSchema } from "../zod";
import {
  dataIsoDoInstante,
  ehDataIso,
  lerDataBr,
  semanasDoMes,
  somarDias,
  somarMesesNaData,
} from "./datas";

describe("contratos dos campos de calendário", () => {
  it("recusa datas inexistentes e aceita dia bissexto", () => {
    expect(ehDataIso("2024-02-29")).toBe(true);
    expect(ehDataIso("2026-02-29")).toBe(false);
    expect(lerDataBr("31/02/2026")).toBeNull();
  });
  it("preserva as viradas de dia e o clamp de mês", () => {
    expect(somarDias("2024-02-28", 1)).toBe("2024-02-29");
    expect(somarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(somarMesesNaData("2026-01-31", 1)).toBe("2026-02-28");
    expect(somarMesesNaData("2024-01-31", 1)).toBe("2024-02-29");
  });
  it("a grade mensal contém cada dia exatamente uma vez", () => {
    const weeks = semanasDoMes({ ano: 2026, mes: 10 });
    const days = weeks.flat().filter(Boolean);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(days).toHaveLength(31);
    expect(new Set(days).size).toBe(31);
    expect(days[0]).toBe("2026-10-01");
    expect(days.at(-1)).toBe("2026-10-31");
  });
  it("o fuso explícito determina o dia de calendário", () => {
    const instant = Date.UTC(2026, 9, 5, 2);
    expect(dataIsoDoInstante(instant, "UTC")).toBe("2026-10-05");
    expect(dataIsoDoInstante(instant, "America/Sao_Paulo")).toBe("2026-10-04");
  });
  it("o período é inclusivo e respeita ordem e maxDias", () => {
    const schema = periodoSchema({ maxDias: 2 });
    expect(
      schema.safeParse({ inicio: "2026-10-05", fim: "2026-10-06" }).success
    ).toBe(true);
    expect(
      schema.safeParse({ inicio: "2026-10-05", fim: "2026-10-07" }).success
    ).toBe(false);
    expect(
      schema.safeParse({ inicio: "2026-10-06", fim: "2026-10-05" }).success
    ).toBe(false);
  });
});
