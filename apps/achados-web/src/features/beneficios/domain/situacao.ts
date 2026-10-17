// O que acontece ao tocar em "Resgatar". A decisão final é sempre do
// servidor, na emissão do código (F4, ADR-005 de produto); aqui só se escolhe
// o que mostrar antes.

export type SituacaoDoResgate =
  /** Sem conta: entrar ou criar conta primeiro. */
  | "entrar"
  /** Com conta, sem passaporte vigente: conhecer o passaporte. */
  | "assinar"
  /**
   * Passaporte vigente. A emissão do código temporário (aleatório, em hash,
   * de uso único) ainda não existe: a tela diz isso, sem código inventado.
   */
  | "emissaoIndisponivel";

export function situacaoDoResgate({
  logado,
  passaporteAtivo,
}: {
  logado: boolean;
  passaporteAtivo: boolean;
}): SituacaoDoResgate {
  if (!logado) return "entrar";
  if (!passaporteAtivo) return "assinar";
  return "emissaoIndisponivel";
}
