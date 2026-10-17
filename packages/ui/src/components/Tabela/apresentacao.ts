import type { CSSProperties } from "react";

import type { ColunaDaTabela, ValorDeCelula } from "./tipos";
import { textoDoValor } from "./valores";

// Medidas e classes que o cabeçalho e as linhas precisam aplicar do mesmo jeito.

export const ALTURA_DA_LINHA = 32;
export const ALTURA_DO_CABECALHO = 36;
export const LARGURA_PADRAO = 160;
export const LARGURA_MINIMA = 64;
export const LARGURA_DA_SELECAO = 40;

/** Faixa de cor da linha marcada, por cima do fundo opaco das células fixas. */
export const MARCADA = "shadow-[inset_0_0_0_999px_var(--pl-primary-subtle)]";

const ALINHAMENTO = {
  inicio: "justify-start text-left",
  centro: "justify-center text-center",
  fim: "justify-end text-right",
} as const;

/** Números à direita, o resto à esquerda, salvo se a coluna disser outra coisa. */
export function alinhamentoDe<T>(coluna: ColunaDaTabela<T>): string {
  return ALINHAMENTO[
    coluna.alinhamento ?? (coluna.tipo === "numero" ? "fim" : "inicio")
  ];
}

/** Texto de um valor na célula e na lista do filtro. */
export function textoDe<T>(
  coluna: ColunaDaTabela<T>,
  valor: ValorDeCelula
): string {
  return coluna.formatar
    ? coluna.formatar(valor)
    : textoDoValor(valor, coluna.tipo ?? "texto");
}

function variavel(prefixo: "largura" | "recuo", id: string): string {
  return `--tabela-${prefixo}-${id.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

/** Largura (e recuo, se fixa) da célula, lidos das variáveis da grade. */
export function estiloDaCelula<T>(coluna: ColunaDaTabela<T>): CSSProperties {
  return {
    width: `var(${variavel("largura", coluna.id)})`,
    left: coluna.fixa ? `var(${variavel("recuo", coluna.id)})` : undefined,
  };
}

/**
 * Larguras e recuos das colunas como variáveis CSS na raiz da grade. Assim,
 * redimensionar uma coluna muda um estilo só e não redesenha as linhas.
 */
export function medidasDasColunas<T>(
  colunas: readonly ColunaDaTabela<T>[],
  larguraDe: (coluna: string) => number,
  comSelecao: boolean
): { variaveis: Record<string, string>; larguraTotal: number } {
  const variaveis: Record<string, string> = {};
  // A coluna de marcação vem antes das fixas e também fica presa.
  let recuo = comSelecao ? LARGURA_DA_SELECAO : 0;
  let larguraTotal = recuo;

  for (const coluna of colunas) {
    const largura = larguraDe(coluna.id);
    variaveis[variavel("largura", coluna.id)] = `${largura}px`;
    if (coluna.fixa) {
      variaveis[variavel("recuo", coluna.id)] = `${recuo}px`;
      recuo += largura;
    }
    larguraTotal += largura;
  }
  return { variaveis, larguraTotal };
}
