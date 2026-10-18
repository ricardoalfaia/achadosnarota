import type { ItemDoHistorico } from "./tipos";

/**
 * Os números do passaporte a partir do histórico real: cupons usados e em
 * quantas casas e cidades diferentes. Códigos expirados não contam.
 */
export function estatisticasDoHistorico(
  historico: readonly ItemDoHistorico[]
): {
  cupons: number;
  estabelecimentos: number;
  cidades: number;
} {
  const usados = historico.filter((item) => item.situacao === "usado");
  const distintos = (valores: (string | undefined)[]) =>
    new Set(valores.filter((v): v is string => Boolean(v))).size;
  return {
    cupons: usados.length,
    estabelecimentos: distintos(usados.map((item) => item.lugarSlug)),
    cidades: distintos(usados.map((item) => item.cidade)),
  };
}
