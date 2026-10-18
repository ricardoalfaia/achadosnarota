// Pendências de um formulário de cadastro (ADR-0021): o campo, a seção em que
// ele está e o motivo. Cada feature escreve as próprias regras; aqui ficam só
// as operações comuns sobre a lista, puras e testadas.

export type Pendencia<Campo extends string, Secao extends string> = {
  campo: Campo;
  secao: Secao;
  motivo: string;
};

/** O motivo do primeiro problema do campo, para o `erro` do campo. */
export function erroDoCampo<C extends string, S extends string>(
  pendencias: readonly Pendencia<C, S>[],
  campo: C
): string | undefined {
  return pendencias.find((p) => p.campo === campo)?.motivo;
}

/** Quantos problemas cada seção tem, para o contador da aba. */
export function contagemPorSecao<C extends string, S extends string>(
  pendencias: readonly Pendencia<C, S>[]
): Partial<Record<S, number>> {
  const contagem: Partial<Record<S, number>> = {};
  for (const { secao } of pendencias)
    contagem[secao] = (contagem[secao] ?? 0) + 1;
  return contagem;
}

/** A primeira seção com problema, na ordem das abas, para o salto. */
export function primeiraSecaoComPendencia<C extends string, S extends string>(
  pendencias: readonly Pendencia<C, S>[],
  ordem: readonly S[]
): S | undefined {
  return ordem.find((secao) => pendencias.some((p) => p.secao === secao));
}
