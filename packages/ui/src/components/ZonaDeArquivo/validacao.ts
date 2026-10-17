// A triagem dos arquivos escolhidos, como função pura. É só conforto de
// interface: o navegador informa o tipo pela extensão e o nome pode mentir. O
// servidor revalida tudo (MIME real pelo conteúdo, tamanho, varredura de
// vírus) antes de aceitar o arquivo.

export type RecusaDeArquivo = {
  /** O nome do arquivo, para a mensagem. */
  arquivo: string;
  motivo: "tipo" | "tamanho" | "quantidade";
};

export type RegrasDeArquivo = {
  /** MIME ("application/pdf"), família ("image/*") ou extensão (".pdf"). Vazio aceita todos. */
  aceitar?: readonly string[];
  tamanhoMaximoEmBytes?: number;
  /** Sem ele, só o primeiro arquivo válido entra; os demais são recusados por quantidade. */
  multiplo?: boolean;
};

type ArquivoParaValidar = { name: string; type: string; size: number };

function tipoAceito(
  arquivo: ArquivoParaValidar,
  aceitar: readonly string[]
): boolean {
  if (aceitar.length === 0) return true;
  const nome = arquivo.name.toLowerCase();
  const tipo = arquivo.type.toLowerCase();
  return aceitar.some((regra) => {
    const r = regra.trim().toLowerCase();
    if (r.startsWith(".")) return nome.endsWith(r);
    if (r.endsWith("/*")) return tipo.startsWith(r.slice(0, -1));
    return tipo === r;
  });
}

/**
 * Separa os arquivos aceitos (pelos índices, na ordem recebida) dos recusados,
 * com o motivo. Tipo é conferido antes de tamanho; a quantidade só conta entre
 * os que passaram nos dois.
 */
export function validarArquivos(
  arquivos: readonly ArquivoParaValidar[],
  { aceitar = [], tamanhoMaximoEmBytes, multiplo = false }: RegrasDeArquivo
): { aceitos: number[]; recusas: RecusaDeArquivo[] } {
  const aceitos: number[] = [];
  const recusas: RecusaDeArquivo[] = [];
  arquivos.forEach((arquivo, indice) => {
    const recusa = (motivo: RecusaDeArquivo["motivo"]) =>
      recusas.push({ arquivo: arquivo.name, motivo });
    if (!tipoAceito(arquivo, aceitar)) recusa("tipo");
    else if (
      tamanhoMaximoEmBytes !== undefined &&
      arquivo.size > tamanhoMaximoEmBytes
    )
      recusa("tamanho");
    else if (!multiplo && aceitos.length > 0) recusa("quantidade");
    else aceitos.push(indice);
  });
  return { aceitos, recusas };
}
