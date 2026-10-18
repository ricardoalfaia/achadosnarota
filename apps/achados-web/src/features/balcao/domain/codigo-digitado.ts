// O que o garçom digita no balcão. Puro: testado sem render. O servidor
// normaliza e confere de novo; aqui é só conveniência de digitação.

/** Mesmo alfabeto do servidor (`@achados/db`): sem 0/O, 1/I/L. */
const ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const TAMANHO_DO_CODIGO = 6;

/**
 * Caixa alta, só caracteres do alfabeto, no máximo 6. "o" e "i" digitados por
 * engano viram "0"/"1"? Não: eles não existem no alfabeto e saem, para o
 * garçom ver na hora que digitou algo que não é do código.
 */
export function limparCodigo(digitado: string): string {
  return [...digitado.toUpperCase()]
    .filter((c) => ALFABETO.includes(c))
    .join("")
    .slice(0, TAMANHO_DO_CODIGO);
}

export function codigoCompleto(codigo: string): boolean {
  return codigo.length === TAMANHO_DO_CODIGO;
}

/** "ABC234" → "ABC 234" para conferir com o que está na tela do cliente. */
export function codigoParaConferir(codigo: string): string {
  return codigo.length > 3
    ? `${codigo.slice(0, 3)} ${codigo.slice(3)}`
    : codigo;
}

/** A hora do uso, "14:32", no horário de Brasília. */
export function horaDoUso(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}
