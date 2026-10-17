// Formatação da nota, sem React: testável e usável no servidor.

const UMA_CASA = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** 4.8 → "4,8"; 5 → "5,0". Valores fora de 0 a 5 são limitados. */
export function formatarNota(valor: number): string {
  const limitado = Math.min(5, Math.max(0, valor));
  return UMA_CASA.format(Math.round(limitado * 10) / 10);
}
