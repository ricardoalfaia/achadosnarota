import {
  BarraDaGrade,
  CampoSkeleton,
  Esqueleto,
  EsqueletoDeTabela,
  GradeDeCadastro,
} from "@achados/ui";

/** A listagem carregando, na moldura final: barra, tabela e rodapé (ADR-0016). */
export function EsqueletoDaListagem({ colunas = 7 }: { colunas?: number }) {
  return (
    <GradeDeCadastro
      barra={
        <BarraDaGrade>
          <Esqueleto className="h-control-sm w-85 rounded-[10px] max-md:w-full" />
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <Esqueleto key={i} className="h-7 w-24 rounded-2xl" />
            ))}
          </div>
          <Esqueleto className="h-8 w-28 rounded-full" />
        </BarraDaGrade>
      }
    >
      <EsqueletoDeTabela linhas={8} colunas={colunas} className="flex-1" />
    </GradeDeCadastro>
  );
}

/** O formulário carregando: barra, abas e duas colunas de campos. */
export function EsqueletoDoFormulario() {
  return (
    <div
      role="status"
      aria-label="Carregando o registro"
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-3.5">
        <Esqueleto className="h-8.5 w-44 rounded-lg" />
        <Esqueleto className="h-5 w-56 rounded" />
      </div>
      <div className="flex gap-2 border-b border-border bg-surface-hover px-6 py-3">
        {[0, 1, 2, 3].map((i) => (
          <Esqueleto key={i} className="h-6 w-28 rounded" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-7 py-6 max-md:grid-cols-1">
        {[0, 1, 2, 3].map((i) => (
          <CampoSkeleton key={i} />
        ))}
        <Esqueleto className="col-span-full h-28 rounded-control" />
      </div>
    </div>
  );
}
