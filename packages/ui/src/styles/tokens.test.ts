import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Resolve os tokens de tokens.css para cada tema e mede o contraste WCAG dos pares
// de texto e fundo que os componentes usam.

type Tema = "claro" | "escuro";
type Cor = { r: number; g: number; b: number; a: number };

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");
const declaracoes = new Map<string, string>();
for (const [, nome, valor] of css.matchAll(/(--pl-[\w-]+):\s*([^;]+);/g)) {
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
  const cor = (token: string) => resolver(`var(--pl-${token})`, tema);
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
  ["foreground-muted", "surface", "surface"],
  ["foreground-muted", "background", "background"],
  ["primary", "surface", "surface"],
  ["primary", "primary-subtle", "surface"],
  ["primary-solid-foreground", "primary-solid", "surface"],
  ["primary-solid-foreground", "primary-solid-hover", "surface"],
  ["sidebar-foreground", "surface-sidebar", "surface-sidebar"],
  ["success", "surface", "surface"],
  ["success", "success-subtle", "surface"],
  ["warning", "surface", "surface"],
  ["warning", "warning-subtle", "surface"],
  ["danger", "surface", "surface"],
  ["danger", "danger-subtle", "surface"],
  ["danger-solid-foreground", "danger-solid", "surface"],
  ["danger-solid-foreground", "danger-solid-hover", "surface"],
  ["primary-solid-foreground", "primary-solid-start", "surface"],
  ["primary-solid-foreground", "primary-solid-start-hover", "surface"],
  ["primary-solid-foreground", "primary-solid-end", "surface"],
  ["primary", "background", "background"],
  ["primary", "surface-active", "surface"],
  ["info", "info-subtle", "surface"],
  ["accent", "surface", "surface"],
  ["accent", "accent-subtle", "surface"],
  ["highlight", "surface", "surface"],
  ["highlight", "highlight-subtle", "surface"],
  ["warning", "background", "background"],
  ["badge-ok-foreground", "badge-ok", "surface"],
  ["badge-new-foreground", "badge-new-start", "surface"],
  ["badge-new-foreground", "badge-new-end", "surface"],
];

// Degradê de ação (bg-brand-gradient-action): texto branco sobre as duas pontas.
const PONTAS_DA_ACAO = ["verde-agua-700", "azul-600"];

// Texto em degradê (text-brand-gradient): só título grande, que pede 3:1.
const PONTAS_DO_TEXTO = [
  "brand-text-start",
  "brand-text-mid",
  "brand-text-end",
];

describe.each<Tema>(["claro", "escuro"])("tokens no tema %s", (tema) => {
  it.each(PARES)(
    "%s sobre %s atinge contraste AA (4,5:1)",
    (texto, fundo, base) => {
      expect(contraste(texto, fundo, base, tema)).toBeGreaterThanOrEqual(4.5);
    }
  );

  it.each(PONTAS_DA_ACAO)(
    "texto branco sobre %s, no degradê de ação, atinge AA (4,5:1)",
    (ponta) => {
      expect(
        contraste("primary-solid-foreground", ponta, "surface", tema)
      ).toBeGreaterThanOrEqual(4.5);
    }
  );

  it.each(PONTAS_DO_TEXTO)(
    "%s sobre background atinge AA para texto grande (3:1)",
    (ponta) => {
      expect(
        contraste(ponta, "background", "background", tema)
      ).toBeGreaterThanOrEqual(3);
    }
  );

  it("foreground-subtle não atinge AA: uso restrito a texto grande ou decorativo", () => {
    const valor = contraste("foreground-subtle", "surface", "surface", tema);
    expect(valor).toBeLessThan(4.5);
  });
});
