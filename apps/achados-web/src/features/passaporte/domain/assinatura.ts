// Os códigos e textos da assinatura na tela. Puro.

export const SESSAO_NECESSARIA_PARA_ASSINAR = "ASSINATURA_SESSAO_NECESSARIA";
export const ASSINATURA_INDISPONIVEL = "ASSINATURA_INDISPONIVEL";

/** Faltando até 30 dias, o passaporte ativo mostra "Renovar". */
export const DIAS_PARA_RENOVAR = 30;

/** O passaporte vence em até `DIAS_PARA_RENOVAR` dias? */
export function pertoDeVencer(validoAte: Date, agora: Date): boolean {
  const faltam = validoAte.getTime() - agora.getTime();
  return faltam > 0 && faltam <= DIAS_PARA_RENOVAR * 24 * 60 * 60 * 1000;
}

export type RetornoDoPagamento = "retorno" | "cancelado" | undefined;

export function lerRetorno(valor: unknown): RetornoDoPagamento {
  return valor === "retorno" || valor === "cancelado" ? valor : undefined;
}
