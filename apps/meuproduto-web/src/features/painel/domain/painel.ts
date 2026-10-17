// O painel da página inicial: o que ele mostra, como tipos, e as regras puras
// de apresentação. Os dados vêm de uma leitura (`lerPainel`), hoje provisória.

export type IdDoIndicador =
  "documentos" | "assinaturas" | "clientes" | "pendentes";

export type TendenciaDoIndicador = "alta" | "baixa" | "estavel";

export type Indicador = {
  id: IdDoIndicador;
  valor: number;
  /**
   * Variação em relação ao mês anterior, em pontos percentuais. Ausente quando
   * ainda não há histórico para comparar (é o caso dos números reais).
   */
  variacao?: { percentual: number; tendencia: TendenciaDoIndicador };
};

export type StatusDoDocumento =
  "assinado" | "emAndamento" | "aguardando" | "rascunho";

export type DocumentoRecente = {
  id: string;
  nome: string;
  status: StatusDoDocumento;
  /** Data e hora ISO da última atualização. */
  atualizadoEm: string;
};

export type IconeDoModelo = "documento" | "cadeado";

export type ModeloMaisUsado = {
  id: string;
  nome: string;
  usos: number;
  icone: IconeDoModelo;
};

export type Painel = {
  indicadores: readonly Indicador[];
  documentosRecentes: readonly DocumentoRecente[];
  modelosMaisUsados: readonly ModeloMaisUsado[];
};

/** A cor de cada status no selo, com os nomes das intenções do `SeloDeStatus`. */
export type IntencaoDoStatus = "sucesso" | "primario" | "atencao" | "neutro";

const INTENCAO: Record<StatusDoDocumento, IntencaoDoStatus> = {
  assinado: "sucesso",
  emAndamento: "primario",
  aguardando: "atencao",
  rascunho: "neutro",
};

export function intencaoDoStatus(status: StatusDoDocumento): IntencaoDoStatus {
  return INTENCAO[status];
}

/** Os documentos do mais recente para o mais antigo, no máximo `limite`. */
export function maisRecentes(
  documentos: readonly DocumentoRecente[],
  limite: number
): readonly DocumentoRecente[] {
  return [...documentos]
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
    .slice(0, limite);
}

/**
 * O painel com o número real de clientes do tenant no lugar do sintético. Sem
 * histórico ainda, o indicador real não mostra variação.
 */
export function comTotalDeClientes(painel: Painel, total: number): Painel {
  return {
    ...painel,
    indicadores: painel.indicadores.map((indicador) =>
      indicador.id === "clientes" ? { id: "clientes", valor: total } : indicador
    ),
  };
}

/** "12%" a partir de 12; sem sinal, porque a seta já diz a direção. */
export function textoDaVariacao(percentual: number): string {
  return `${Math.abs(percentual)}%`;
}
