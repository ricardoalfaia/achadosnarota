import { cn } from "../../../lib/cn";
import { Checkbox } from "../../Checkbox";
import { IconeFiltro, IconeFiltroDeLista } from "../../Icones";
import {
  alinhamentoDe,
  ALTURA_DO_CABECALHO,
  estiloDaCelula,
  LARGURA_DA_SELECAO,
} from "../apresentacao";
import type {
  FiltrosDaTabela,
  LargurasDaTabela,
  OrdenacaoDaTabela,
} from "../hooks/use-dados-da-tabela";
import type { ArrastoDeColuna } from "../hooks/use-ordem-das-colunas";
import type { ColunaDaTabela } from "../tipos";
import { IconeDeOrdem } from "./icone-de-ordem";

const ARIA_DA_ORDEM = {
  asc: "ascending",
  desc: "descending",
  nenhuma: "none",
} as const;

function TituloDaColuna<T>({
  coluna,
  posicao,
  ordenacao,
  filtros,
  larguras,
  arrasto,
  menuAberto,
  aoAbrirMenu,
}: {
  coluna: ColunaDaTabela<T>;
  posicao: number;
  ordenacao: OrdenacaoDaTabela;
  filtros: FiltrosDaTabela;
  larguras: LargurasDaTabela;
  arrasto: ArrastoDeColuna<T>;
  menuAberto: boolean;
  aoAbrirMenu: (ancora: HTMLElement) => void;
}) {
  const ordem = ordenacao.de(coluna.id);
  const filtrada = filtros.de(coluna.id) !== undefined;
  const sendoArrastada = arrasto.arrastada === coluna.id;
  const recebeASolta = arrasto.alvo === coluna.id && !sendoArrastada;

  return (
    <div
      role="columnheader"
      aria-colindex={posicao}
      aria-sort={ARIA_DA_ORDEM[ordem || "nenhuma"]}
      onDragOver={(evento) => {
        if (!arrasto.arrastada) return;
        evento.preventDefault();
        arrasto.passarSobre(coluna.id);
      }}
      onDrop={(evento) => {
        evento.preventDefault();
        arrasto.soltarSobre(coluna);
      }}
      onDragEnd={arrasto.encerrar}
      className={cn(
        "relative flex shrink-0 items-center bg-surface-raised text-xs font-bold text-foreground select-none",
        coluna.fixa && "sticky z-10 border-r border-border",
        sendoArrastada && "opacity-40",
        recebeASolta && "shadow-[inset_2px_0_0_var(--ar-ring)]"
      )}
      style={estiloDaCelula(coluna)}
    >
      {/* Clique ordena; arrastar pelo título muda a coluna de lugar. */}
      <button
        type="button"
        disabled={coluna.semOrdenacao}
        draggable
        onDragStart={(evento) => {
          evento.dataTransfer.effectAllowed = "move";
          evento.dataTransfer.setData("text/plain", coluna.id);
          arrasto.iniciar(coluna.id);
        }}
        onClick={() => ordenacao.alternar(coluna.id)}
        title={coluna.titulo}
        className={cn(
          "flex h-full min-w-0 flex-1 cursor-pointer items-center gap-1.5 pl-3 uppercase outline-none hover:text-primary focus-visible:text-primary focus-visible:underline disabled:cursor-default",
          alinhamentoDe(coluna)
        )}
      >
        <span className="truncate">{coluna.titulo}</span>
        {ordem && (
          <IconeDeOrdem
            tipo={coluna.tipo ?? "texto"}
            direcao={ordem}
            className="size-3.5 shrink-0 text-primary"
          />
        )}
      </button>

      {!coluna.semFiltro && (
        <button
          type="button"
          aria-label={
            filtrada
              ? `Filtrar ${coluna.titulo} (filtro aplicado)`
              : `Filtrar ${coluna.titulo}`
          }
          aria-haspopup="dialog"
          aria-expanded={menuAberto}
          onClick={(evento) => aoAbrirMenu(evento.currentTarget)}
          className={cn(
            "mr-1.5 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md outline-none focus-visible:outline-2 focus-visible:outline-ring",
            // Coluna filtrada: o funil cheio sobre fundo sólido, visível de longe.
            filtrada
              ? "bg-primary-solid text-primary-solid-foreground shadow-sm hover:bg-primary-solid-hover"
              : "text-foreground-muted hover:bg-surface-active hover:text-foreground"
          )}
        >
          {filtrada ? (
            <IconeFiltro className="size-3.5 fill-current" />
          ) : (
            <IconeFiltroDeLista />
          )}
        </button>
      )}

      {/* Borda de redimensionar: arrastar muda a largura, duplo clique restaura. */}
      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={larguras.aoRedimensionar(coluna.id)}
        onTouchStart={larguras.aoRedimensionar(coluna.id)}
        onDoubleClick={() => larguras.restaurar(coluna.id)}
        className={cn(
          "absolute inset-y-0 right-0 w-1.5 cursor-col-resize touch-none border-r border-border hover:border-r-2 hover:border-ring",
          larguras.redimensionando(coluna.id) && "border-r-2 border-ring"
        )}
      />
    </div>
  );
}

/** A linha de títulos: marcar todas, e em cada coluna ordenar, filtrar, mover e redimensionar. */
export function Cabecalho<T>({
  colunas,
  ordenacao,
  filtros,
  larguras,
  arrasto,
  marcacao,
  colunaComMenuAberto,
  aoAbrirMenu,
}: {
  colunas: readonly ColunaDaTabela<T>[];
  ordenacao: OrdenacaoDaTabela;
  filtros: FiltrosDaTabela;
  larguras: LargurasDaTabela;
  arrasto: ArrastoDeColuna<T>;
  /** A caixa de "selecionar todas". Ausente quando a tabela não tem coluna de marcação. */
  marcacao?: {
    todas: boolean;
    algumas: boolean;
    desabilitada: boolean;
    aoMarcarTodas: (marcar: boolean) => void;
  };
  colunaComMenuAberto: string | null;
  aoAbrirMenu: (coluna: string, ancora: HTMLElement) => void;
}) {
  return (
    <div role="rowgroup" className="sticky top-0 z-20">
      <div
        role="row"
        aria-rowindex={1}
        className="flex border-b border-border-strong bg-surface-raised"
        style={{ height: ALTURA_DO_CABECALHO }}
      >
        {marcacao && (
          <div
            role="columnheader"
            className="sticky left-0 z-10 flex shrink-0 items-center justify-center border-r border-border bg-surface-raised"
            style={{ width: LARGURA_DA_SELECAO }}
          >
            <Checkbox
              label="Selecionar todas as linhas"
              rotuloOculto
              marcado={marcacao.todas}
              indeterminado={marcacao.algumas}
              desabilitado={marcacao.desabilitada}
              aoMudar={marcacao.aoMarcarTodas}
            />
          </div>
        )}
        {colunas.map((coluna, indice) => (
          <TituloDaColuna
            key={coluna.id}
            coluna={coluna}
            posicao={indice + 1 + (marcacao ? 1 : 0)}
            ordenacao={ordenacao}
            filtros={filtros}
            larguras={larguras}
            arrasto={arrasto}
            menuAberto={colunaComMenuAberto === coluna.id}
            aoAbrirMenu={(ancora) => aoAbrirMenu(coluna.id, ancora)}
          />
        ))}
      </div>
    </div>
  );
}
