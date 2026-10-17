import { cn } from "../../../lib/cn";
import { Esqueleto } from "../../Esqueleto";
import { ALTURA_DA_LINHA, ALTURA_DO_CABECALHO } from "../apresentacao";

const LARGURAS = ["w-16", "w-24", "w-32", "w-48", "w-28", "w-20"] as const;

function LinhaDeEsqueleto({ colunas }: { colunas: number }) {
  return (
    <div
      className="flex items-center gap-6 border-b border-border px-3"
      style={{ height: ALTURA_DA_LINHA }}
    >
      {Array.from({ length: colunas }, (_, indice) => (
        <Esqueleto
          key={indice}
          className={cn("h-3", LARGURAS[indice % LARGURAS.length])}
        />
      ))}
    </div>
  );
}

/** Linhas de espera no fim da lista, enquanto a próxima página chega. */
export function LinhasCarregando({ colunas }: { colunas: number }) {
  return (
    <div aria-hidden="true" className="sticky left-0 w-full">
      {Array.from({ length: 3 }, (_, indice) => (
        <LinhaDeEsqueleto key={indice} colunas={Math.min(colunas, 6)} />
      ))}
    </div>
  );
}

/**
 * O lugar da tabela enquanto os dados dela carregam: `fallback` do `<Suspense>`
 * ou do `DataBoundary`. Tem a mesma moldura, para a tela não pular. Use o mesmo
 * `className` de altura da tabela. Server Component.
 */
export function EsqueletoDeTabela({
  linhas = 10,
  colunas = 6,
  className,
}: {
  linhas?: number;
  colunas?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-card border border-border bg-surface",
        className
      )}
    >
      <div
        className="flex items-center gap-6 border-b border-border-strong bg-surface-raised px-3"
        style={{ height: ALTURA_DO_CABECALHO }}
      >
        {Array.from({ length: colunas }, (_, indice) => (
          <Esqueleto
            key={indice}
            className={cn("h-2.5", LARGURAS[indice % LARGURAS.length])}
          />
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {Array.from({ length: linhas }, (_, indice) => (
          <LinhaDeEsqueleto key={indice} colunas={colunas} />
        ))}
      </div>
      <span className="sr-only">Carregando a tabela…</span>
    </div>
  );
}
