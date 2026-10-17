// Datas de calendário sem hora nem fuso. Toda conta é feita em
// UTC para que horário de verão e fuso do navegador não desloquem o dia.

/** Data de calendário no formato `AAAA-MM-DD`. Compara-se como string. */
export type DataIso = string;

/** Intervalo fechado: `inicio` e `fim` fazem parte do período. */
export type Periodo = { inicio: DataIso; fim: DataIso };

/** Mês de calendário; `mes` vai de 1 a 12. */
export type Mes = { ano: number; mes: number };

const DIA_EM_MS = 86_400_000;
const PADRAO_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const PADRAO_BR = /^(\d{2})\/(\d{2})\/(\d{4})$/;

type Partes = { ano: number; mes: number; dia: number };

function partesValidas(ano: number, mes: number, dia: number): Partes | null {
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  const confere =
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia;
  return confere ? { ano, mes, dia } : null;
}

function lerDataIso(iso: string): Partes | null {
  const partes = PADRAO_ISO.exec(iso);
  return partes
    ? partesValidas(Number(partes[1]), Number(partes[2]), Number(partes[3]))
    : null;
}

function emMs(iso: DataIso): number {
  const partes = lerDataIso(iso);
  if (!partes) throw new Error(`Data ISO inválida: ${iso}`);
  return Date.UTC(partes.ano, partes.mes - 1, partes.dia);
}

function deMs(ms: number): DataIso {
  return new Date(ms).toISOString().slice(0, 10);
}

/** `true` para `AAAA-MM-DD` que existe no calendário (recusa 2026-02-30). */
export function ehDataIso(valor: string): boolean {
  return lerDataIso(valor) !== null;
}

export function criarDataIso(ano: number, mes: number, dia: number): DataIso {
  return deMs(Date.UTC(ano, mes - 1, dia));
}

export function somarDias(iso: DataIso, dias: number): DataIso {
  return deMs(emMs(iso) + dias * DIA_EM_MS);
}

/** Dias de `inicio` até `fim`, sem contar o próprio `inicio` (mesmo dia → 0). */
export function diferencaEmDias(inicio: DataIso, fim: DataIso): number {
  return Math.round((emMs(fim) - emMs(inicio)) / DIA_EM_MS);
}

export function mesDe(iso: DataIso): Mes {
  const partes = lerDataIso(iso);
  if (!partes) throw new Error(`Data ISO inválida: ${iso}`);
  return { ano: partes.ano, mes: partes.mes };
}

export function somarMeses({ ano, mes }: Mes, meses: number): Mes {
  const indice = ano * 12 + (mes - 1) + meses;
  return { ano: Math.floor(indice / 12), mes: (indice % 12) + 1 };
}

/** Mesmo dia `meses` adiante; 31/01 + 1 mês → 28 ou 29/02. */
export function somarMesesNaData(iso: DataIso, meses: number): DataIso {
  const alvo = somarMeses(mesDe(iso), meses);
  const dia = Math.min(diaDoMes(iso), diaDoMes(ultimoDiaDoMes(alvo)));
  return criarDataIso(alvo.ano, alvo.mes, dia);
}

/** 0 = domingo … 6 = sábado. */
export function diaDaSemana(iso: DataIso): number {
  return new Date(emMs(iso)).getUTCDay();
}

export function primeiroDiaDoMes({ ano, mes }: Mes): DataIso {
  return criarDataIso(ano, mes, 1);
}

export function ultimoDiaDoMes({ ano, mes }: Mes): DataIso {
  return criarDataIso(ano, mes + 1, 0);
}

export function mesmoMes(a: Mes, b: Mes): boolean {
  return a.ano === b.ano && a.mes === b.mes;
}

/** Semanas do mês, de domingo a sábado; `null` nas casas fora do mês. */
export function semanasDoMes(mes: Mes): (DataIso | null)[][] {
  const primeiro = primeiroDiaDoMes(mes);
  const deslocamento = new Date(emMs(primeiro)).getUTCDay();
  const total = diferencaEmDias(primeiro, ultimoDiaDoMes(mes)) + 1;
  const casas: (DataIso | null)[] = [
    ...Array.from({ length: deslocamento }, () => null),
    ...Array.from({ length: total }, (_, i) => somarDias(primeiro, i)),
  ];
  while (casas.length % 7 !== 0) casas.push(null);

  return Array.from({ length: casas.length / 7 }, (_, i) =>
    casas.slice(i * 7, i * 7 + 7)
  );
}

export function diaDoMes(iso: DataIso): number {
  return lerDataIso(iso)?.dia ?? 0;
}

const FORMATO_DO_MES = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  timeZone: "UTC",
});
const FORMATO_POR_EXTENSO = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "full",
  timeZone: "UTC",
});

/** "Setembro 2026". */
export function tituloDoMes(mes: Mes): string {
  const nome = FORMATO_DO_MES.format(emMs(primeiroDiaDoMes(mes)));
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} ${mes.ano}`;
}

/** "domingo, 27 de setembro de 2026" — rótulo acessível de cada dia. */
export function dataPorExtenso(iso: DataIso): string {
  return FORMATO_POR_EXTENSO.format(emMs(iso));
}

/** `AAAA-MM-DD` → `DD/MM/AAAA`. */
export function formatarDataBr(iso: DataIso): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** `DD/MM/AAAA` → `AAAA-MM-DD`, ou `null` se incompleta ou inexistente. */
export function lerDataBr(texto: string): DataIso | null {
  const partes = PADRAO_BR.exec(texto);
  if (!partes) return null;
  const valida = partesValidas(
    Number(partes[3]),
    Number(partes[2]),
    Number(partes[1])
  );
  return valida ? criarDataIso(valida.ano, valida.mes, valida.dia) : null;
}

/** Máscara de digitação: só dígitos, com as barras no lugar. */
export function mascararDataBr(texto: string): string {
  const digitos = texto.replace(/\D/g, "").slice(0, 8);
  return [digitos.slice(0, 2), digitos.slice(2, 4), digitos.slice(4)]
    .filter(Boolean)
    .join("/");
}

/**
 * O dia de calendário de um instante num fuso. Para calcular `hoje` no
 * servidor: `dataIsoDoInstante(await agoraDoServidor())`.
 */
export function dataIsoDoInstante(
  instante: number,
  fuso = "America/Sao_Paulo"
): DataIso {
  return new Intl.DateTimeFormat("en-CA", { timeZone: fuso }).format(instante);
}

/**
 * Hoje no relógio do navegador. **Só em evento** (abrir o calendário), nunca no
 * render: servidor e cliente poderiam produzir dias diferentes na hidratação.
 */
export function hojeNoNavegador(): DataIso {
  const agora = new Date();
  return criarDataIso(
    agora.getFullYear(),
    agora.getMonth() + 1,
    agora.getDate()
  );
}
