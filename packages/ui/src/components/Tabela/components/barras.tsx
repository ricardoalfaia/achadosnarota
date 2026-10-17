import type { ReactNode } from "react";

import { Botao } from "../../Botao";

function contar(quantidade: number): string {
  return quantidade.toLocaleString("pt-BR");
}

/** Aparece quando há linhas marcadas: a contagem e as ações que a tela oferece. */
export function BarraDeSelecao({
  quantidade,
  aoLimpar,
  children,
}: {
  quantidade: number;
  aoLimpar: () => void;
  /** Os botões de ação em lote. */
  children: ReactNode;
}) {
  return (
    <div
      role="toolbar"
      aria-label="Ações das linhas selecionadas"
      className="flex animate-panel-in items-center gap-3 border-b border-border bg-primary-subtle px-3 py-1.5"
    >
      <span className="font-bold text-primary">
        {contar(quantidade)} {quantidade === 1 ? "selecionada" : "selecionadas"}
      </span>
      <div className="flex flex-1 items-center gap-2">{children}</div>
      <Botao variante="fantasma" tamanho="xs" onClick={aoLimpar}>
        Limpar seleção
      </Botao>
    </div>
  );
}

/** O rodapé: quantas linhas estão à mostra, o que está em andamento e os filtros ativos. */
export function Rodape({
  exibidas,
  total,
  filtrosAtivos,
  andamento,
  recusa,
  aoLimparFiltros,
}: {
  exibidas: number;
  total: number;
  filtrosAtivos: number;
  /** "aplicando", "carregando mais": o que a tabela está fazendo agora. */
  andamento?: string;
  /** Por que a última edição foi recusada. */
  recusa?: string;
  aoLimparFiltros: () => void;
}) {
  const parcial = filtrosAtivos > 0 || total !== exibidas;

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-4 border-t border-border bg-surface-raised px-3 py-1.5 text-xs text-foreground-muted"
    >
      <span className="font-mono">
        {contar(exibidas)}
        {parcial && ` de ${contar(total)}`} registros
        {andamento && ` · ${andamento}…`}
      </span>
      {recusa && (
        <span role="alert" className="flex-1 font-semibold text-danger">
          {recusa}
        </span>
      )}
      {filtrosAtivos > 0 && (
        <Botao variante="fantasma" tamanho="xs" onClick={aoLimparFiltros}>
          Limpar {filtrosAtivos} {filtrosAtivos === 1 ? "filtro" : "filtros"}
        </Botao>
      )}
    </div>
  );
}
