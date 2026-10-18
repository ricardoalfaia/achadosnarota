import type { Metadata } from "next";
import Link from "next/link";
import { unwrapOrThrow } from "@achados/core";
import { ehUlid } from "@achados/db";
import { EstadoVazio } from "@achados/ui";
import { cn, estiloDoBotao } from "@achados/ui/estilos";
import { Download, ShieldAlert } from "lucide-react";

import {
  CartoesDeIndicadores,
  GraficoPorDia,
  MapaDeCalor,
  Ranking,
} from "@/features/relatorios/components/graficos";
import { relatorioDeResgates } from "@/features/relatorios/consultas.servidor";
import {
  lerPeriodo,
  PERIODOS,
  ROTULO_DO_PERIODO,
} from "@/features/relatorios/domain/relatorio";
import { CabecalhoDaPagina } from "@/shared/casca/cabecalho-da-pagina";
import { ROTAS } from "@/shared/rotas";
import { exigirEquipe } from "@/shared/sessao/sessao.servidor";

export const metadata: Metadata = { title: "Resgates" };

const QUANDO = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

function Bloco({
  titulo,
  descricao,
  children,
  className,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-card bg-surface p-5 ring-1 ring-border/60",
        className
      )}
    >
      <header>
        <h2 className="text-base font-extrabold text-foreground">{titulo}</h2>
        {descricao && (
          <p className="text-sm text-foreground-muted">{descricao}</p>
        )}
      </header>
      {children}
    </section>
  );
}

/**
 * Resgates (Comercial): o relatório dos benefícios usados, por período e
 * casa, com a exportação em CSV. Os filtros moram na URL (funcionam sem
 * JavaScript). Só administração e comercial: a RLS não entrega resgates a
 * outros papéis.
 */
export default async function PaginaDeResgates({
  searchParams,
}: PageProps<"/resgates">) {
  const pessoa = await exigirEquipe();
  const busca = await searchParams;
  const periodo = lerPeriodo(busca.periodo);
  const casa =
    typeof busca.casa === "string" && ehUlid(busca.casa) ? busca.casa : null;

  const cabecalho = (
    <CabecalhoDaPagina
      secao="Comercial"
      titulo="Resgates"
      descricao="Como os benefícios do passaporte estão sendo usados nas casas: volume, ritmo, horários e o que mais atrai."
    />
  );
  if (pessoa.papel === "curador")
    return (
      <>
        {cabecalho}
        <EstadoVazio
          icone={<ShieldAlert />}
          titulo="O relatório de resgates é da administração e do comercial"
          descricao="A curadoria não acompanha o uso dos benefícios: o editorial fica separado do comercial."
          className="py-16"
        />
      </>
    );

  const relatorio = unwrapOrThrow(
    await relatorioDeResgates({ periodo, casaId: casa })
  );
  const parametros = (mudanca: Record<string, string | null>) => {
    const atual = new URLSearchParams();
    atual.set("periodo", periodo);
    if (casa) atual.set("casa", casa);
    for (const [chave, valor] of Object.entries(mudanca))
      if (valor) atual.set(chave, valor);
      else atual.delete(chave);
    return atual.toString();
  };

  return (
    <>
      {cabecalho}
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Período" className="flex flex-wrap gap-2">
            {PERIODOS.map((p) => (
              <Link
                key={p}
                href={`${ROTAS.resgates}?${parametros({ periodo: p })}`}
                aria-current={p === periodo ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-bold ring-1 transition-colors",
                  p === periodo
                    ? "bg-primary-solid text-primary-solid-foreground ring-transparent"
                    : "bg-surface text-foreground ring-border hover:bg-surface-hover"
                )}
              >
                {ROTULO_DO_PERIODO[p]}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <form action={ROTAS.resgates} className="flex items-center gap-2">
              <input type="hidden" name="periodo" value={periodo} />
              <label className="sr-only" htmlFor="filtro-casa">
                Casa
              </label>
              <select
                id="filtro-casa"
                name="casa"
                defaultValue={casa ?? ""}
                className="h-9 rounded-full border border-border bg-surface px-3 text-sm text-foreground"
              >
                <option value="">Todas as casas</option>
                {relatorio.opcoesDeCasa.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className={estiloDoBotao({
                  variante: "contorno",
                  tamanho: "xs",
                })}
              >
                Filtrar
              </button>
            </form>
            <a
              href={`/api/relatorios/resgates?${parametros({})}`}
              className={estiloDoBotao({ tamanho: "xs" })}
              download
            >
              <Download aria-hidden="true" />
              Exportar CSV
            </a>
          </div>
        </div>

        <CartoesDeIndicadores indicadores={relatorio.indicadores} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Bloco
            titulo="Usos por dia"
            descricao={`Benefícios confirmados no balcão · ${ROTULO_DO_PERIODO[periodo].toLowerCase()}`}
          >
            <GraficoPorDia serie={relatorio.serie} />
          </Bloco>
          <Bloco
            titulo="Casas que mais recebem"
            descricao="Onde o passaporte leva gente"
          >
            <Ranking itens={relatorio.casas} vazio="Nenhum uso no período." />
          </Bloco>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Bloco
            titulo="Horários de movimento"
            descricao="Dia da semana e hora dos usos (horário de Brasília): bom para combinar a escala com as casas."
          >
            <MapaDeCalor calor={relatorio.calor} />
          </Bloco>
          <Bloco
            titulo="Benefícios mais usados"
            descricao="O que mais atrai o assinante"
          >
            <Ranking
              itens={relatorio.beneficios}
              vazio="Nenhum uso no período."
            />
          </Bloco>
        </div>

        <Bloco
          titulo="Últimos usos"
          descricao="Sem identificar o assinante. O CSV traz o período inteiro."
        >
          {relatorio.recentes.length === 0 ? (
            <p className="text-sm text-foreground-muted">
              Nenhum uso no período.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold tracking-wide text-foreground-muted uppercase">
                    <th className="py-2 pr-4">Quando</th>
                    <th className="py-2 pr-4">Casa</th>
                    <th className="py-2 pr-4">Benefício</th>
                    <th className="py-2">Confirmado por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {relatorio.recentes.map((uso) => (
                    <tr key={uso.id}>
                      <td className="py-2 pr-4 whitespace-nowrap text-foreground-muted tabular-nums">
                        {uso.usadoEm
                          ? QUANDO.format(new Date(uso.usadoEm))
                          : ""}
                      </td>
                      <td className="py-2 pr-4 font-semibold text-foreground">
                        {uso.casa}
                      </td>
                      <td className="py-2 pr-4 text-foreground">
                        {uso.beneficio}
                      </td>
                      <td className="py-2 text-foreground-muted">
                        {uso.operador ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Bloco>
      </div>
    </>
  );
}
