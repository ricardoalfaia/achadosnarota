// Os critérios públicos da curadoria e a regra do Selo Achados na Rota.
// Puro: testado sem banco. A regra é igual para todas as casas e não depende
// de nada comercial (ADR-004 de produto): selo não se compra.

export const CRITERIOS_DA_CURADORIA = [
  { chave: "hygiene", rotulo: "Higiene" },
  { chave: "presentation", rotulo: "Apresentação do prato" },
  { chave: "flavor", rotulo: "Sabor" },
  { chave: "sophistication", rotulo: "Sofisticação" },
  { chave: "service", rotulo: "Atendimento" },
  { chave: "ambience", rotulo: "Ambiente" },
  { chave: "value", rotulo: "Custo-benefício" },
] as const;

export type ChaveDoCriterio = (typeof CRITERIOS_DA_CURADORIA)[number]["chave"];

export type NotaDoCriterio = {
  chave: ChaveDoCriterio;
  rotulo: string;
  nota: number;
};

/** O selo pede média 4,5 ou mais, nenhum critério abaixo de 4... */
export const MEDIA_MINIMA_DO_SELO = 4.5;
export const CRITERIO_MINIMO_DO_SELO = 4;
/** ...e pelo menos quatro critérios avaliados, para uma nota só não bastar. */
export const CRITERIOS_MINIMOS_DO_SELO = 4;

/**
 * Os critérios avaliados, na ordem pública. O que veio nulo não se aplica à
 * casa (pousada sem "apresentação do prato") e fica de fora.
 */
export function criteriosAvaliados(
  linha: Partial<Record<ChaveDoCriterio, string | number | null>>
): NotaDoCriterio[] {
  return CRITERIOS_DA_CURADORIA.flatMap(({ chave, rotulo }) => {
    const valor = linha[chave];
    if (valor === null || valor === undefined || valor === "") return [];
    const nota = Number(valor);
    return Number.isFinite(nota) ? [{ chave, rotulo, nota }] : [];
  });
}

export function mediaDosCriterios(
  criterios: readonly NotaDoCriterio[]
): number | undefined {
  if (criterios.length === 0) return undefined;
  const soma = criterios.reduce((total, { nota }) => total + nota, 0);
  return Math.round((soma / criterios.length) * 10) / 10;
}

/** A casa ganha o Selo Achados na Rota? */
export function ganhaOSelo(criterios: readonly NotaDoCriterio[]): boolean {
  const media = mediaDosCriterios(criterios);
  return (
    media !== undefined &&
    criterios.length >= CRITERIOS_MINIMOS_DO_SELO &&
    media >= MEDIA_MINIMA_DO_SELO &&
    criterios.every(({ nota }) => nota >= CRITERIO_MINIMO_DO_SELO)
  );
}
