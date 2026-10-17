import { memo, useRef } from "react";

import { cn } from "../../../lib/cn";
import { Checkbox } from "../../Checkbox";
import {
  alinhamentoDe,
  estiloDaCelula,
  LARGURA_DA_SELECAO,
  MARCADA,
  textoDe,
} from "../apresentacao";
import type { Seguir } from "../hooks/use-edicao-de-celula";
import type { ColunaDaTabela } from "../tipos";
import { textoParaEditar } from "../valores";
import { EditorDeCelula } from "./editor-de-celula";

/**
 * O que uma linha pede à tabela. O objeto é sempre o mesmo
 * (`useFuncoesEstaveis`), para marcar ou editar uma linha não redesenhar as outras.
 */
export type AcoesDaLinha<T> = {
  podeEditar: (coluna: ColunaDaTabela<T>, linha: T) => boolean;
  alternarSelecao: (id: string, indice: number, comShift: boolean) => void;
  iniciarEdicao: (id: string, coluna: string) => void;
  concluirEdicao: (
    linha: T,
    id: string,
    coluna: string,
    texto: string,
    seguir: Seguir
  ) => string | undefined;
  cancelarEdicao: (id: string, coluna: string) => void;
  /** Abre o registro da linha; ausente quando a tabela não abre nada. */
  abrir?: (linha: T) => void;
};

/** Clique ou Enter em um controle da linha (marcação, botão, edição) não abre o registro. */
function veioDeUmControle(alvo: EventTarget | null): boolean {
  return (
    alvo instanceof HTMLElement &&
    alvo.closest("button, input, a, [contenteditable], [role='textbox']") !==
      null
  );
}

/** Identifica a célula no DOM, para devolver o foco a ela depois de editar. */
export function marcaDaCelula(linha: string, coluna: string): string {
  return `${linha}|${coluna}`;
}

function CelulaDeMarcacao({
  indice,
  marcada,
  aoAlternar,
}: {
  indice: number;
  marcada: boolean;
  aoAlternar: (comShift: boolean) => void;
}) {
  // O Checkbox só informa marcado ou não; o Shift é lido do clique.
  const comShift = useRef(false);

  return (
    <div
      role="gridcell"
      onClickCapture={(evento) => {
        comShift.current = evento.shiftKey;
      }}
      className={cn(
        "sticky left-0 z-10 flex shrink-0 items-center justify-center border-r border-border bg-surface group-hover:bg-surface-hover",
        marcada && MARCADA
      )}
      style={{ width: LARGURA_DA_SELECAO }}
    >
      <Checkbox
        label={`Selecionar a linha ${indice + 1}`}
        rotuloOculto
        marcado={marcada}
        aoMudar={() => aoAlternar(comShift.current)}
      />
    </div>
  );
}

function Celula<T>({
  coluna,
  linha,
  id,
  indice,
  marcada,
  editando,
  acoes,
}: {
  coluna: ColunaDaTabela<T>;
  linha: T;
  id: string;
  indice: number;
  marcada: boolean;
  editando: boolean;
  acoes: AcoesDaLinha<T>;
}) {
  const editavel = acoes.podeEditar(coluna, linha);
  const abreEdicao = editavel && !editando;

  return (
    <div
      role="gridcell"
      data-celula={marcaDaCelula(id, coluna.id)}
      aria-readonly={editavel ? undefined : true}
      tabIndex={abreEdicao ? -1 : undefined}
      onDoubleClick={
        abreEdicao ? () => acoes.iniciarEdicao(id, coluna.id) : undefined
      }
      onKeyDown={
        abreEdicao
          ? (evento) => {
              if (evento.key !== "Enter" && evento.key !== "F2") return;
              evento.preventDefault();
              acoes.iniciarEdicao(id, coluna.id);
            }
          : undefined
      }
      className={cn(
        "flex shrink-0 items-center overflow-hidden text-sm",
        !editando && "px-3",
        alinhamentoDe(coluna),
        (coluna.tipo === "numero" || coluna.tipo === "data") && "font-mono",
        coluna.fixa &&
          "sticky z-10 border-r border-border bg-surface group-hover:bg-surface-hover",
        coluna.fixa && marcada && MARCADA,
        abreEdicao &&
          "cursor-text outline-none hover:shadow-[inset_0_0_0_1px_var(--pl-border-strong)] focus-visible:shadow-[inset_0_0_0_2px_var(--pl-ring)]"
      )}
      style={estiloDaCelula(coluna)}
    >
      {editando ? (
        <EditorDeCelula
          rotulo={`${coluna.titulo}, linha ${indice + 1}`}
          inicial={textoParaEditar(coluna.valor(linha), coluna.tipo ?? "texto")}
          alinhamento={alinhamentoDe(coluna)}
          aoConcluir={(texto, seguir) =>
            acoes.concluirEdicao(linha, id, coluna.id, texto, seguir)
          }
          aoCancelar={() => acoes.cancelarEdicao(id, coluna.id)}
        />
      ) : (
        <span className="truncate">
          {coluna.celula
            ? coluna.celula(linha)
            : textoDe(coluna, coluna.valor(linha))}
        </span>
      )}
    </div>
  );
}

type LinhaProps<T> = {
  linha: T;
  id: string;
  /** Posição entre as linhas exibidas. */
  indice: number;
  /** Distância do topo da lista, em px. */
  inicio: number;
  /** Altura da linha, em px. */
  altura: number;
  colunas: readonly ColunaDaTabela<T>[];
  selecionavel: boolean;
  marcada: boolean;
  /** `id` da coluna em edição nesta linha. */
  emEdicao: string | null;
  acoes: AcoesDaLinha<T>;
};

function LinhaSemMemo<T>({
  linha,
  id,
  indice,
  inicio,
  altura,
  colunas,
  selecionavel,
  marcada,
  emEdicao,
  acoes,
}: LinhaProps<T>) {
  const abrir = acoes.abrir;

  return (
    <div
      role="row"
      aria-rowindex={indice + 2}
      aria-selected={selecionavel ? marcada : undefined}
      onClick={
        abrir &&
        ((evento) => {
          if (!veioDeUmControle(evento.target)) abrir(linha);
        })
      }
      onKeyDown={
        abrir &&
        ((evento) => {
          if (evento.key !== "Enter" || veioDeUmControle(evento.target)) return;
          if (emEdicao) return;
          evento.preventDefault();
          abrir(linha);
        })
      }
      className={cn(
        "group absolute top-0 left-0 flex border-b border-border bg-surface hover:bg-surface-hover",
        abrir && "cursor-pointer",
        marcada && MARCADA
      )}
      style={{ height: altura, transform: `translateY(${inicio}px)` }}
    >
      {selecionavel && (
        <CelulaDeMarcacao
          indice={indice}
          marcada={marcada}
          aoAlternar={(comShift) => acoes.alternarSelecao(id, indice, comShift)}
        />
      )}
      {colunas.map((coluna) => (
        <Celula
          key={coluna.id}
          coluna={coluna}
          linha={linha}
          id={id}
          indice={indice}
          marcada={marcada}
          editando={emEdicao === coluna.id}
          acoes={acoes}
        />
      ))}
    </div>
  );
}

/**
 * Uma linha da grade. Com `memo`, só é redesenhada quando os seus dados, a sua
 * marcação ou a sua edição mudam; as larguras vêm de variáveis CSS.
 */
export const Linha = memo(LinhaSemMemo) as typeof LinhaSemMemo;
