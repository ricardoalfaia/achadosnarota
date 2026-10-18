// O que acontece ao tocar em "Resgatar". A decisão final é sempre do
// servidor, na emissão do código (F4, ADR-005 de produto); aqui só se escolhe
// o que mostrar antes.

export type SituacaoDoResgate =
  /** Sem conta: entrar ou criar conta primeiro. */
  | "entrar"
  /** Com conta, sem passaporte vigente: conhecer o passaporte. */
  | "assinar"
  /**
   * Passaporte vigente: emite o código temporário (aleatório, em hash, de uso
   * único) que o garçom valida no painel do parceiro. O servidor confere de
   * novo o passaporte e o limite na emissão e no consumo.
   */
  | "usar";

export function situacaoDoResgate({
  logado,
  passaporteAtivo,
}: {
  logado: boolean;
  passaporteAtivo: boolean;
}): SituacaoDoResgate {
  if (!logado) return "entrar";
  if (!passaporteAtivo) return "assinar";
  return "usar";
}
