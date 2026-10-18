// O código de resgate na tela: o erro de sessão, o tempo que falta e como
// mostrar os caracteres. Puro: testado sem render.

export const SESSAO_NECESSARIA_PARA_USAR = "RESGATE_SESSAO_NECESSARIA";

/** A validade do código, igual à do servidor (`@achados/db`, 10 minutos). */
export const VALIDADE_EM_SEGUNDOS = 10 * 60;

/**
 * Segundos até o código expirar, entre zero e a validade: o relógio do
 * aparelho pode estar um pouco adiantado ou atrasado em relação ao servidor.
 */
export function segundosRestantes(expiraEm: string, agora: number): number {
  const segundos = Math.ceil((Date.parse(expiraEm) - agora) / 1000);
  return Math.min(VALIDADE_EM_SEGUNDOS, Math.max(0, segundos));
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

/** "18/10/2026 às 14:32", no horário de Brasília, para o histórico. */
export function dataEHora(iso: string): string {
  const data = new Date(iso);
  const dia = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
  }).format(data);
  const hora = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(data);
  return `${dia} às ${hora}`;
}
