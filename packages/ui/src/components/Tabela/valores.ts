import { normalizarParaBusca } from "../../hooks/use-select";
import { ehDataIso, formatarDataBr } from "../../lib/datas";
import type {
  CondicaoDeFiltro,
  FiltroDeColuna,
  JuncaoDeFiltro,
  OperadorDeNumero,
  OperadorDeTexto,
  TipoDeColuna,
  ValorDeCelula,
} from "./tipos";

// Regras puras da tabela: como um valor vira texto, chave de filtro e posição
// na ordenação. Sem React e sem biblioteca de tabela, para testar à parte.

const NUMERO = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 6 });

/** Rótulo do valor ausente na lista do filtro. */
export const VAZIO = "(vazio)";

/** Texto padrão de um valor, quando a coluna não informa `formatar`. */
export function textoDoValor(valor: ValorDeCelula, tipo: TipoDeColuna): string {
  if (valor === null || valor === "") return "";
  if (typeof valor === "number") return NUMERO.format(valor);
  if (tipo === "data" && ehDataIso(valor)) return formatarDataBr(valor);
  return valor;
}

/** Identidade de um valor na lista do filtro; ausente vira `""`. */
export function chaveDoValor(valor: ValorDeCelula): string {
  return valor === null ? "" : String(valor);
}

// Normalizar (sem acento, minúsculas) é caro e os valores se repetem muito em
// uma coluna: o resultado fica guardado por texto.
const normalizados = new Map<string, string>();

function normalizado(texto: string): string {
  let pronto = normalizados.get(texto);
  if (pronto === undefined) {
    if (normalizados.size > 200_000) normalizados.clear();
    pronto = normalizarParaBusca(texto);
    normalizados.set(texto, pronto);
  }
  return pronto;
}

/**
 * Ordem crescente entre dois valores. Texto ignora acento e caixa; ausentes vão
 * sempre para o fim, em qualquer direção de quem chama em ordem crescente.
 */
export function compararValores(a: ValorDeCelula, b: ValorDeCelula): number {
  if (a === b) return 0;
  const aAusente = a === null || a === "";
  const bAusente = b === null || b === "";
  if (aAusente || bAusente)
    return aAusente === bAusente ? 0 : aAusente ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  const [x, y] = [normalizado(String(a)), normalizado(String(b))];
  return x < y ? -1 : x > y ? 1 : 0;
}

function passaNoNumero(
  valor: number,
  operador: OperadorDeNumero,
  termo: number
): boolean {
  switch (operador) {
    case "igual":
      return valor === termo;
    case "diferente":
      return valor !== termo;
    case "maiorQue":
      return valor > termo;
    case "maiorOuIgual":
      return valor >= termo;
    case "menorQue":
      return valor < termo;
    case "menorOuIgual":
      return valor <= termo;
  }
}

function passaNoTexto(
  texto: string,
  operador: OperadorDeTexto,
  termo: string
): boolean {
  switch (operador) {
    case "igual":
      return texto === termo;
    case "diferente":
      return texto !== termo;
    case "comecaCom":
      return texto.startsWith(termo);
    case "terminaCom":
      return texto.endsWith(termo);
    case "contem":
      return texto.includes(termo);
    case "naoContem":
      return !texto.includes(termo);
  }
}

function combinar(
  primeira: boolean,
  juncao: JuncaoDeFiltro | undefined,
  segunda: () => boolean
): boolean {
  if (!juncao) return primeira;
  return juncao === "e" ? primeira && segunda() : primeira || segunda();
}

function passaNaCondicao(
  valor: ValorDeCelula,
  condicao: CondicaoDeFiltro
): boolean {
  if (condicao.tipo === "numero") {
    if (typeof valor !== "number") return false;
    const { segunda } = condicao;
    return combinar(
      passaNoNumero(valor, condicao.operador, condicao.termo),
      segunda?.juncao,
      () => passaNoNumero(valor, segunda!.operador, segunda!.termo)
    );
  }

  // Sem "diferenciar caixa", texto e termo perdem acento e caixa antes de comparar.
  const preparar = condicao.diferenciarCaixa
    ? (texto: string) => texto
    : normalizado;
  const texto = preparar(chaveDoValor(valor));
  const { segunda } = condicao;
  return combinar(
    passaNoTexto(texto, condicao.operador, preparar(condicao.termo)),
    segunda?.juncao,
    () => passaNoTexto(texto, segunda!.operador, preparar(segunda!.termo))
  );
}

/** O valor da célula satisfaz o filtro da coluna? */
export function passaNoFiltro(
  valor: ValorDeCelula,
  filtro: FiltroDeColuna
): boolean {
  if (filtro.valores && !filtro.valores.has(chaveDoValor(valor))) return false;
  return filtro.condicao ? passaNaCondicao(valor, filtro.condicao) : true;
}

/** Um filtro que não restringe nada não precisa existir no estado. */
export function filtroEstaVazio(filtro: FiltroDeColuna | undefined): boolean {
  if (!filtro) return true;
  const { condicao } = filtro;
  const semCondicao =
    !condicao ||
    (condicao.tipo === "texto" &&
      condicao.termo.trim() === "" &&
      !condicao.segunda);
  return !filtro.valores && semCondicao;
}

/** Nova ordem das colunas ao soltar `movida` sobre `alvo`. */
export function moverColuna(
  ordem: readonly string[],
  movida: string,
  alvo: string
): string[] {
  if (movida === alvo || !ordem.includes(movida) || !ordem.includes(alvo)) {
    return [...ordem];
  }
  const destino = ordem.indexOf(alvo);
  const resto = ordem.filter((id) => id !== movida);
  resto.splice(destino, 0, movida);
  return resto;
}

/** Texto que aparece no campo ao começar a editar uma célula. */
export function textoParaEditar(
  valor: ValorDeCelula,
  tipo: TipoDeColuna
): string {
  if (valor === null) return "";
  if (typeof valor === "number") return String(valor).replace(".", ",");
  if (tipo === "data" && ehDataIso(valor)) return formatarDataBr(valor);
  return valor;
}

/**
 * Converte o texto digitado para o valor da coluna. Vazio vira ausente.
 * `undefined` quando o texto não é um número ou uma data válidos.
 */
export function interpretarEdicao(
  texto: string,
  tipo: TipoDeColuna
): ValorDeCelula | undefined {
  const limpo = texto.trim();
  if (tipo === "texto") return texto;
  if (limpo === "") return null;

  if (tipo === "numero") {
    // Formato brasileiro: ponto separa milhar e vírgula separa decimal
    // ("1.234,56", "1.234"). "1234.56", sem agrupamento, também é aceito.
    const emMilhares = /^-?\d{1,3}(\.\d{3})+$/.test(limpo);
    const padrao =
      limpo.includes(",") || emMilhares
        ? limpo.replace(/\./g, "").replace(",", ".")
        : limpo;
    if (!/^-?\d+(\.\d+)?$/.test(padrao)) return undefined;
    return Number(padrao);
  }

  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(limpo);
  const iso = partes ? `${partes[3]}-${partes[2]}-${partes[1]}` : limpo;
  return ehDataIso(iso) ? iso : undefined;
}
