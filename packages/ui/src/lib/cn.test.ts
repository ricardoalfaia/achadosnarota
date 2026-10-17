import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("a última classe vence quando há conflito", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("reconhece as alturas de controle dos tokens como altura", () => {
    expect(cn("h-control-lg", "h-control-sm")).toBe("h-control-sm");
    expect(cn("h-14", "h-control-md")).toBe("h-control-md");
  });

  it("reconhece os raios por papel como raio", () => {
    expect(cn("rounded-lg", "rounded-control")).toBe("rounded-control");
    expect(cn("rounded-control", "rounded-card")).toBe("rounded-card");
  });

  it("não confunde tamanho de texto com cor de texto", () => {
    expect(cn("text-2xs", "text-foreground")).toBe("text-2xs text-foreground");
    expect(cn("text-base", "text-2xs")).toBe("text-2xs");
  });

  it("ignora valores falsos", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });
});
