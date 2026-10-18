import type { Criterio } from "@achados/db";

// Os critérios públicos da curadoria e a regra do Selo Achados na Rota.
// Puro: testado sem banco. A regra é igual para todas as casas e não depende
// de nada comercial (ADR-004 de produto): selo não se compra.
//
// PENDÊNCIA: a mesma regra existe no app do assinante
// (apps/achados-web/src/features/catalogo/domain/curadoria.ts). Aplicações
// não importam aplicações; a regra deve ir para um pacote de domínio comum,
// combinado com a frente do app, antes de qualquer mudança nos números.

export const CRITERIOS_DA_CURADORIA: readonly {
  chave: Criterio;
  rotulo: string;
}[] = [
  { chave: "hygiene", rotulo: "Higiene" },
  { chave: "presentation", rotulo: "Apresentação do prato" },
  { chave: "flavor", rotulo: "Sabor" },
  { chave: "sophistication", rotulo: "Sofisticação" },
  { chave: "service", rotulo: "Atendimento" },
  { chave: "ambience", rotulo: "Ambiente" },
  { chave: "value", rotulo: "Custo-benefício" },
];

export const MEDIA_MINIMA_DO_SELO = 4.5;
export const CRITERIO_MINIMO_DO_SELO = 4;
export const CRITERIOS_MINIMOS_DO_SELO = 4;

/** Nota de cada critério como digitada: `""` é "não se aplica". */
export type NotasDosCriterios = Record<Criterio, string>;

/** "4,5" ou "4.5" → 4.5; vazio ou fora de 0–5 com uma casa → `null`. */
export function lerNota(texto: string): number | null {
  const limpo = texto.trim().replace(",", ".");
  if (!/^\d(\.\d)?$/.test(limpo)) return null;
  const nota = Number(limpo);
  return nota >= 0 && nota <= 5 ? nota : null;
}

/** As notas válidas, na ordem pública; as que não se aplicam ficam de fora. */
export function notasAvaliadas(notas: NotasDosCriterios): number[] {
  return CRITERIOS_DA_CURADORIA.flatMap(({ chave }) => {
    const nota = lerNota(notas[chave]);
    return nota === null ? [] : [nota];
  });
}

export function media(notas: readonly number[]): number | undefined {
  if (notas.length === 0) return undefined;
  const soma = notas.reduce((total, nota) => total + nota, 0);
  return Math.round((soma / notas.length) * 10) / 10;
}

/** A casa ganha o Selo Achados na Rota com estas notas? */
export function ganhaOSelo(notas: readonly number[]): boolean {
  const m = media(notas);
  return (
    m !== undefined &&
    notas.length >= CRITERIOS_MINIMOS_DO_SELO &&
    m >= MEDIA_MINIMA_DO_SELO &&
    notas.every((nota) => nota >= CRITERIO_MINIMO_DO_SELO)
  );
}
