import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Resolve os tokens de tokens.css para cada tema e mede o contraste WCAG dos pares
// de texto e fundo que os componentes usam.

type Tema = "claro" | "escuro";
type Cor = { r: number; g: number; b: number; a: number };

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");
const declaracoes = new Map<string, string>();
for (const [, nome, valor] of css.matchAll(/(--ar-[\w-]+):\s*([^;]+);/g)) {
  if (nome && valor) declaracoes.set(nome, valor.replace(/\s+/g, " ").trim());
}

/** Separa argumentos por vírgula, respeitando parênteses aninhados. */
function argumentos(texto: string): string[] {
  const partes: string[] = [];
  let nivel = 0;
  let atual = "";
  for (const letra of texto) {
    if (letra === "(") nivel++;
    if (letra === ")") nivel--;
    if (letra === "," && nivel === 0) {
      partes.push(atual.trim());
      atual = "";
    } else atual += letra;
  }
  partes.push(atual.trim());
  return partes;
}

function resolver(valor: string, tema: Tema): Cor {
  const v = valor.trim();
  const interno = (prefixo: string) => v.slice(prefixo.length, -1);
  if (v === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  if (v.startsWith("var(")) {
    const alvo = declaracoes.get(interno("var("));
    if (!alvo) throw new Error(`Token não declarado: ${v}`);
    return resolver(alvo, tema);
  }
  if (v.startsWith("light-dark(")) {
    const [claro, escuro] = argumentos(interno("light-dark("));
    return resolver((tema === "claro" ? claro : escuro) ?? "", tema);
  }
  if (v.startsWith("color-mix(")) {
    const [, cor] = argumentos(interno("color-mix("));
    const partes = /^(.*) (\d+)%$/.exec(cor ?? "");
    if (!partes?.[1] || !partes[2])
      throw new Error(`color-mix não suportado: ${v}`);
    return { ...resolver(partes[1], tema), a: Number(partes[2]) / 100 };
  }
  const hex = /^#([0-9a-f]{6})$/i.exec(v)?.[1];
  if (hex) {
    const n = parseInt(hex, 16);
    return { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const rgb = /^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/.exec(v);
  if (rgb) return { r: +rgb[1]!, g: +rgb[2]!, b: +rgb[3]!, a: +rgb[4]! };
  throw new Error(`Valor não suportado: ${v}`);
}

function sobre(frente: Cor, fundo: Cor): Cor {
  const mistura = (f: number, b: number) => f * frente.a + b * (1 - frente.a);
  return {
    r: mistura(frente.r, fundo.r),
    g: mistura(frente.g, fundo.g),
    b: mistura(frente.b, fundo.b),
    a: 1,
  };
}

function luminancia({ r, g, b }: Cor): number {
  const canal = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/** Contraste do texto sobre o fundo; fundo translúcido é composto sobre a base. */
function contraste(
  texto: string,
  fundo: string,
  base: string,
  tema: Tema
): number {
  const cor = (token: string) =>
    resolver(token === "white" ? "#ffffff" : `var(--ar-${token})`, tema);
  const fundoFinal = sobre(cor(fundo), cor(base));
  const [a, b] = [
    luminancia(sobre(cor(texto), fundoFinal)),
    luminancia(fundoFinal),
  ];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// [texto, fundo, base sob o fundo]
const PARES: [string, string, string][] = [
  ["foreground", "background", "background"],
  ["foreground", "surface", "surface"],
  ["foreground", "surface-raised", "surface"],
  ["foreground", "surface-active", "surface"],
  ["foreground", "chip", "surface"],
  ["chip-foreground", "chip", "surface"],
  ["foreground-muted", "surface", "surface"],
  ["foreground-muted", "background", "background"],
  ["foreground-muted", "surface-hover", "surface"],
  ["foreground-muted", "chip", "surface"],
  ["foreground-brand", "surface", "surface"],
  ["primary", "surface", "surface"],
  ["primary", "background", "background"],
  ["primary", "primary-subtle", "surface"],
  ["primary", "surface-active", "surface"],
  ["primary-solid-foreground", "primary-solid", "surface"],
  ["primary-solid-foreground", "primary-solid-hover", "surface"],
  ["primary-solid-foreground", "primary-solid-start", "surface"],
  ["primary-solid-foreground", "primary-solid-start-hover", "surface"],
  ["primary-solid-foreground", "primary-solid-end", "surface"],
  ["accent", "surface", "surface"],
  ["accent", "accent-subtle", "surface"],
  ["rating", "surface", "surface"],
  ["highlight", "surface", "surface"],
  ["highlight", "highlight-subtle", "surface"],
  ["seal-foreground", "seal-featured", "surface"],
  ["seal-foreground", "seal-beloved", "surface"],
  ["seal-foreground", "seal-verified", "surface"],
  ["seal-foreground", "seal-new", "surface"],
  ["success", "surface", "surface"],
  ["success", "success-subtle", "surface"],
  ["white", "success-solid", "surface"],
  ["warning", "surface", "surface"],
  ["warning", "warning-subtle", "surface"],
  ["warning", "background", "background"],
  ["danger", "surface", "surface"],
  ["danger", "danger-subtle", "surface"],
  ["danger-solid-foreground", "danger-solid", "surface"],
  ["danger-solid-foreground", "danger-solid-hover", "surface"],
  ["info", "surface", "surface"],
  ["info", "info-subtle", "surface"],
  ["badge-ok-foreground", "badge-ok", "surface"],
  ["badge-new-foreground", "badge-new-start", "surface"],
  ["badge-new-foreground", "badge-new-end", "surface"],
  ["white", "passport-start", "surface"],
  ["white", "passport-end", "surface"],
  ["passport-muted", "passport-end", "surface"],
];

// Marca decorativa (ícones, item ativo, estrela): elemento gráfico pede 3:1.
const GRAFICOS: [string, string][] = [
  ["brand", "surface"],
  ["brand", "background"],
  ["favorite", "surface"],
];

describe.each<Tema>(["claro", "escuro"])("tokens no tema %s", (tema) => {
  it.each(PARES)(
    "%s sobre %s atinge contraste AA (4,5:1)",
    (texto, fundo, base) => {
      expect(contraste(texto, fundo, base, tema)).toBeGreaterThanOrEqual(4.5);
    }
  );

  it.each(GRAFICOS)(
    "%s sobre %s atinge 3:1 (elemento gráfico)",
    (cor, fundo) => {
      expect(contraste(cor, fundo, fundo, tema)).toBeGreaterThanOrEqual(3);
    }
  );

  it("foreground-subtle não atinge AA: uso restrito a texto grande ou decorativo", () => {
    const valor = contraste("foreground-subtle", "surface", "surface", tema);
    expect(valor).toBeLessThan(4.5);
  });
});
