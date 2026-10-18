// O código de resgate na tela: o erro de sessão, o tempo que falta e como
// mostrar os caracteres. Puro: testado sem render.

export const SESSAO_NECESSARIA_PARA_USAR = "RESGATE_SESSAO_NECESSARIA";

/** Segundos até o código expirar (nunca negativo). */
export function segundosRestantes(expiraEm: string, agora: number): number {
  return Math.max(0, Math.ceil((Date.parse(expiraEm) - agora) / 1000));
}

/** 541 → "09:01". */
export function relogio(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  return `${String(minutos).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;
}

/** "ABC234" → "ABC 234": duas metades, para o garçom ler e digitar. */
export function codigoEmDuasPartes(codigo: string): string {
  return `${codigo.slice(0, 3)} ${codigo.slice(3)}`;
}

/** A data em que o limite renova, "01/01/2027", a partir do ISO do servidor. */
export function dataDaRenovacao(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}
