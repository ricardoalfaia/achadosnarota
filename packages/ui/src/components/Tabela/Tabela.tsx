"use client";

import { useRef, useState, type ReactNode } from "react";

import { cn } from "../../lib/cn";
import { ALTURA_DA_LINHA, medidasDasColunas } from "./apresentacao";
import { BarraDeSelecao, Rodape } from "./components/barras";
import { Cabecalho } from "./components/cabecalho";
import { LinhasCarregando } from "./components/esqueleto";
import { FiltroCustomizado } from "./components/filtro-customizado";
import { FiltroDaColuna } from "./components/filtro-da-coluna";
import { Linha, marcaDaCelula, type AcoesDaLinha } from "./components/linha";
import type { OperadorDeCondicao } from "./components/operadores";
import { useDadosDaTabela } from "./hooks/use-dados-da-tabela";
import { useEdicaoDeCelula } from "./hooks/use-edicao-de-celula";
import { useFuncoesEstaveis } from "./hooks/use-funcoes-estaveis";
import { useLinhasVisiveis } from "./hooks/use-linhas-visiveis";
import { useOrdemDasColunas } from "./hooks/use-ordem-das-colunas";
import { useSelecaoDeLinhas } from "./hooks/use-selecao-de-linhas";
import type { ColunaDaTabela, EdicaoDeCelula } from "./tipos";

export type TabelaProps<T> = {
  /** Nome acessível da tabela. */
  rotulo: string;
  colunas: readonly ColunaDaTabela<T>[];
  /** Mantenha a mesma referência enquanto os dados não mudam. */
  linhas: readonly T[];
  idDaLinha: (linha: T) => string;
  /**
   * Chamado quando a rolagem chega perto do fim, para buscar a próxima página.
   * Com ele, ordenação e filtro valem só sobre as linhas já carregadas.
   */
  aoChegarAoFim?: () => void;
  carregandoMais?: boolean;
  /** Total no servidor, quando há mais linhas do que as carregadas. */
  total?: number;
  /** Mostra a coluna de marcação. Shift e clique marcam o intervalo. */
  selecionavel?: boolean;
  /** Seleção controlada por quem usa; sem ela, a tabela guarda a seleção. */
  selecionadas?: ReadonlySet<string>;
  aoMudarSelecao?: (ids: ReadonlySet<string>) => void;
  /** Botões da barra que aparece quando há linhas marcadas: excluir, aplicar. */
  acoesDaSelecao?: (selecao: {
    ids: readonly string[];
    limpar: () => void;
  }) => ReactNode;
  /**
   * Confirma a edição de uma célula; quem usa atualiza `linhas`. Devolva um
   * texto para recusar o valor: ele é mostrado e a célula continua em edição.
   */
  aoEditar?: (edicao: EdicaoDeCelula<T>) => string | undefined | void;
  /**
   * Clique na linha (ou Enter nela) abre o registro: a tela de cadastro, o
   * detalhe. Cliques em controles da linha (marcação, botões) não contam.
   */
  aoAbrirLinha?: (linha: T) => void;
  /**
   * Altura de cada linha, em px. O padrão (32) é a linha densa de uma linha de
   * texto; uma listagem de cadastro com nome e complemento usa 64.
   */
  alturaDaLinha?: number;
  /**
   * Esconde o rodapé da própria tabela (contagem, andamento, limpar filtros),
   * para quando a tela já tem o seu rodapé, como a `GradeDeCadastro`.
   */
  semRodape?: boolean;
  /** Mostrado quando não há linhas depois dos filtros. */
  vazio?: ReactNode;
  /** Define a altura: a tabela rola por dentro (`h-96`, `flex-1`). */
  className?: string;
};

/**
 * Tabela de dados para grandes volumes: só as linhas visíveis vão para a tela.
 * Ordena pelo título, filtra pelo menu de cada coluna, redimensiona pela borda,
 * reordena arrastando o título, marca linhas e edita células.
 *
 * Não busca dados nem conhece consultas: recebe colunas e linhas prontas. Este
 * arquivo só junta as partes; cada comportamento mora em um hook de `hooks/`.
 */
export function Tabela<T>({
  rotulo,
  colunas,
  linhas,
  idDaLinha,
  aoChegarAoFim,
  carregandoMais = false,
  total,
  selecionavel = false,
  selecionadas,
  aoMudarSelecao,
  acoesDaSelecao,
  aoEditar,
  aoAbrirLinha,
  alturaDaLinha = ALTURA_DA_LINHA,
  semRodape = false,
  vazio = "Nenhum registro encontrado.",
  className,
}: TabelaProps<T>) {
  const {
    linhas: exibidas,
    ordenacao,
    filtros,
    larguras,
  } = useDadosDaTabela({ colunas, linhas, idDaLinha });
  const { ordenadas, arrasto } = useOrdemDasColunas(colunas);
  const { rolagem, visiveis, alturaTotal } = useLinhasVisiveis({
    total: exibidas.length,
    alturaDaLinha,
    aoChegarAoFim,
    carregandoMais,
  });
  const selecao = useSelecaoDeLinhas({
    linhas: exibidas,
    selecionadas,
    aoMudarSelecao,
  });
  const edicao = useEdicaoDeCelula({
    colunas: ordenadas,
    aoEditar,
    aoSair: focarCelula,
  });

  const { variaveis, larguraTotal } = medidasDasColunas(
    ordenadas,
    larguras.de,
    selecionavel
  );

  const acoes = useFuncoesEstaveis<AcoesDaLinha<T>>({
    podeEditar: edicao.podeEditar,
    alternarSelecao: selecao.alternar,
    iniciarEdicao: edicao.iniciar,
    concluirEdicao: edicao.concluir,
    cancelarEdicao: edicao.cancelar,
    abrir: aoAbrirLinha,
  });

  function focarCelula(linha: string, coluna: string) {
    requestAnimationFrame(() => {
      const marca = CSS.escape(marcaDaCelula(linha, coluna));
      rolagem.current
        ?.querySelector<HTMLElement>(`[data-celula="${marca}"]`)
        ?.focus();
    });
  }

  // O menu de filtro fica ancorado ao título da coluna que o abriu.
  const [colunaDoMenu, setColunaDoMenu] = useState<string | null>(null);
  const ancoraDoMenu = useRef<HTMLElement | null>(null);
  const rolagemAoAbrir = useRef({ topo: 0, esquerda: 0 });
  const colunaFiltrada = ordenadas.find((coluna) => coluna.id === colunaDoMenu);

  function alternarMenu(coluna: string, ancora: HTMLElement) {
    ancoraDoMenu.current = ancora;
    rolagemAoAbrir.current = {
      topo: rolagem.current?.scrollTop ?? 0,
      esquerda: rolagem.current?.scrollLeft ?? 0,
    };
    setColunaDoMenu(colunaDoMenu === coluna ? null : coluna);
  }

  function fecharMenuSeRolou(grade: HTMLDivElement) {
    if (!colunaDoMenu) return;
    const { topo, esquerda } = rolagemAoAbrir.current;
    const rolou =
      Math.abs(grade.scrollTop - topo) > 4 ||
      Math.abs(grade.scrollLeft - esquerda) > 4;
    if (rolou) setColunaDoMenu(null);
  }

  // O filtro customizado é um diálogo modal, fora do menu: o menu fecha ao abri-lo.
  const [dialogo, setDialogo] = useState<{
    coluna: string;
    operador?: OperadorDeCondicao;
  } | null>(null);
  const colunaDoDialogo = ordenadas.find(
    (coluna) => coluna.id === dialogo?.coluna
  );

  const semLinhas = exibidas.length === 0 && !carregandoMais;

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-card border border-border bg-surface",
        className
      )}
    >
      {selecionavel && selecao.marcadas.size > 0 && (
        <BarraDeSelecao
          quantidade={selecao.marcadas.size}
          aoLimpar={selecao.limpar}
        >
          {acoesDaSelecao?.({
            ids: [...selecao.marcadas],
            limpar: selecao.limpar,
          })}
        </BarraDeSelecao>
      )}

      <div
        ref={rolagem}
        role="grid"
        aria-label={rotulo}
        aria-rowcount={exibidas.length + 1}
        aria-colcount={ordenadas.length + (selecionavel ? 1 : 0)}
        aria-multiselectable={selecionavel || undefined}
        aria-busy={carregandoMais || undefined}
        tabIndex={0}
        onScroll={(evento) => fecharMenuSeRolou(evento.currentTarget)}
        className="relative min-h-0 flex-1 overflow-auto outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <div
          role="presentation"
          style={{ ...variaveis, width: larguraTotal, minWidth: "100%" }}
        >
          <Cabecalho
            colunas={ordenadas}
            ordenacao={ordenacao}
            filtros={filtros}
            larguras={larguras}
            arrasto={arrasto}
            marcacao={
              selecionavel
                ? {
                    todas: selecao.todas,
                    algumas: !selecao.todas && selecao.marcadas.size > 0,
                    desabilitada: exibidas.length === 0,
                    aoMarcarTodas: selecao.marcarTodas,
                  }
                : undefined
            }
            colunaComMenuAberto={colunaDoMenu}
            aoAbrirMenu={alternarMenu}
          />

          <div
            role="rowgroup"
            className="relative"
            style={{ height: alturaTotal }}
          >
            {visiveis.map(({ indice, inicio }) => {
              const linha = exibidas[indice];
              if (!linha) return null;
              return (
                <Linha
                  key={linha.id}
                  linha={linha.original}
                  id={linha.id}
                  indice={indice}
                  inicio={inicio}
                  altura={alturaDaLinha}
                  colunas={ordenadas}
                  selecionavel={selecionavel}
                  marcada={selecao.marcadas.has(linha.id)}
                  emEdicao={
                    edicao.celula?.linha === linha.id
                      ? edicao.celula.coluna
                      : null
                  }
                  acoes={acoes}
                />
              );
            })}
          </div>
          {carregandoMais && <LinhasCarregando colunas={ordenadas.length} />}
        </div>
        {semLinhas && (
          <div className="sticky left-0 p-8 text-center text-foreground-muted">
            {vazio}
          </div>
        )}
      </div>

      {!semRodape && (
        <Rodape
          exibidas={exibidas.length}
          total={total ?? linhas.length}
          filtrosAtivos={filtros.ativos}
          andamento={carregandoMais ? "carregando mais" : undefined}
          recusa={edicao.recusa}
          aoLimparFiltros={filtros.limpar}
        />
      )}

      {colunaFiltrada && (
        <FiltroDaColuna
          key={colunaFiltrada.id}
          coluna={colunaFiltrada}
          ordenacao={ordenacao}
          filtros={filtros}
          ancora={ancoraDoMenu}
          aoAbrirCustomizado={(operador) => {
            setColunaDoMenu(null);
            setDialogo({ coluna: colunaFiltrada.id, operador });
          }}
          aoFechar={() => setColunaDoMenu(null)}
        />
      )}

      {colunaDoDialogo && (
        <FiltroCustomizado
          key={colunaDoDialogo.id}
          titulo={colunaDoDialogo.titulo}
          tipo={colunaDoDialogo.tipo ?? "texto"}
          condicao={filtros.de(colunaDoDialogo.id)?.condicao}
          operadorInicial={dialogo?.operador}
          aoAplicar={(condicao) => {
            filtros.aplicar(colunaDoDialogo.id, {
              ...filtros.de(colunaDoDialogo.id),
              condicao,
            });
            setDialogo(null);
          }}
          aoCancelar={() => setDialogo(null)}
        />
      )}
    </div>
  );
}
