// Os operadores do balcão vistos pela equipe: tipos e regras puras da tela
// de Parceiros (situação de cada casa, busca e números do topo).

export type OperadorDaCasa = { usuarioId: string; nome: string; email: string };

export type CasaComOperadores = {
  id: string;
  nome: string;
  cidade: string;
  operadores: OperadorDaCasa[];
};

/** A casa tem alguém para validar o código no balcão? */
export type SituacaoDoBalcao = "sem" | "com";

export const SITUACOES_DO_BALCAO: readonly SituacaoDoBalcao[] = ["sem", "com"];

export const ROTULO_DA_SITUACAO: Record<SituacaoDoBalcao, string> = {
  sem: "Sem operador",
  com: "Com operador",
};

/** A casa com a situação no campo `status`, como as listagens filtram. */
export type CasaDaLista = CasaComOperadores & { status: SituacaoDoBalcao };

export function comSituacao(
  casas: readonly CasaComOperadores[]
): CasaDaLista[] {
  return casas.map((casa) => ({
    ...casa,
    status: casa.operadores.length > 0 ? "com" : "sem",
  }));
}

/** O que a busca procura: a casa, a cidade e quem opera (nome e e-mail). */
export function textoDaCasa(casa: CasaComOperadores): string[] {
  return [
    casa.nome,
    casa.cidade,
    ...casa.operadores.flatMap((o) => [o.nome, o.email]),
  ];
}

export type ResumoDoBalcao = {
  casas: number;
  comOperador: number;
  semOperador: number;
  /** Pessoas distintas: quem opera duas casas conta uma vez. */
  operadores: number;
};

export function resumoDoBalcao(
  casas: readonly CasaComOperadores[]
): ResumoDoBalcao {
  const comOperador = casas.filter((c) => c.operadores.length > 0).length;
  const pessoas = new Set(
    casas.flatMap((c) => c.operadores.map((o) => o.usuarioId))
  );
  return {
    casas: casas.length,
    comOperador,
    semOperador: casas.length - comOperador,
    operadores: pessoas.size,
  };
}

/** "Gabi do Balcão", "Gabi e Rui", "Gabi, Rui e mais 2". */
export function nomesDosOperadores(
  operadores: readonly OperadorDaCasa[]
): string {
  const nomes = operadores.map((o) => o.nome);
  if (nomes.length <= 1) return nomes[0] ?? "";
  if (nomes.length === 2) return `${nomes[0]} e ${nomes[1]}`;
  return `${nomes[0]}, ${nomes[1]} e mais ${nomes.length - 2}`;
}
