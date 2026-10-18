// O filtro de situação das listagens (os chips "Todas", "Publicadas"...).
// Valor fechado: pode ir para a URL (ADR-0021). O texto livre da busca não
// vai, enquanto a pendência do ADR-0006 não for decidida.

export const TODAS = "todas";

/** Lê `?status=` contra os valores aceitos; qualquer outra coisa é "todas". */
export function lerSituacao<S extends string>(
  valor: string | string[] | undefined | null,
  aceitos: readonly S[]
): S | typeof TODAS {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  return aceitos.find((aceito) => aceito === texto) ?? TODAS;
}

/** Quantos registros há em cada situação, mais o total em "todas". */
export function contagemPorSituacao<S extends string>(
  registros: readonly { status: S }[],
  situacoes: readonly S[]
): Record<S | typeof TODAS, number> {
  const contagem = Object.fromEntries(
    [TODAS, ...situacoes].map((s) => [s, 0])
  ) as Record<S | typeof TODAS, number>;
  for (const { status } of registros) {
    contagem[TODAS] += 1;
    if (status in contagem) contagem[status] += 1;
  }
  return contagem;
}

/** "São Paulo" → "sao paulo": busca sem acento e sem caixa. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Os registros da situação escolhida cujo texto (os campos que `textoDe`
 * devolve) contém todas as palavras da busca, sem acento nem caixa.
 */
export function filtrarRegistros<T extends { status: string }>(
  registros: readonly T[],
  {
    situacao,
    busca,
    textoDe,
  }: {
    situacao: T["status"] | typeof TODAS;
    busca: string;
    textoDe: (registro: T) => readonly string[];
  }
): readonly T[] {
  const palavras = normalizar(busca).split(/\s+/).filter(Boolean);
  if (situacao === TODAS && palavras.length === 0) return registros;
  return registros.filter((registro) => {
    if (situacao !== TODAS && registro.status !== situacao) return false;
    if (palavras.length === 0) return true;
    const texto = normalizar(textoDe(registro).join(" "));
    return palavras.every((palavra) => texto.includes(palavra));
  });
}
