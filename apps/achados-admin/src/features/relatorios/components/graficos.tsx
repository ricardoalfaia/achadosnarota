import { cn } from "@achados/ui/estilos";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  QrCode,
  Store,
  Target,
  Users,
} from "lucide-react";

import type { Indicadores } from "../domain/relatorio";

// As peças visuais do relatório. Sem biblioteca de gráficos: SVG e grade
// simples, desenhados no servidor, com o número sempre legível ao lado da
// cor (acessível sem depender dela).

const inteiro = new Intl.NumberFormat("pt-BR");
const porcento = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 0,
});

function Cartao({
  icone,
  rotulo,
  valor,
  detalhe,
  destaque = false,
}: {
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
  detalhe?: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-card p-4 ring-1",
        destaque
          ? "bg-linear-135 from-primary-solid-start to-primary-solid-end text-primary-solid-foreground ring-transparent"
          : "bg-surface text-foreground ring-border/60"
      )}
    >
      <span
        className={cn(
          "flex items-center gap-2 text-xs font-bold tracking-wide uppercase [&_svg]:size-4",
          destaque ? "text-white/85" : "text-foreground-muted"
        )}
      >
        {icone}
        {rotulo}
      </span>
      <span className="text-3xl font-extrabold tracking-tight tabular-nums">
        {valor}
      </span>
      {detalhe}
    </div>
  );
}

/** Os cinco números do período, o primeiro em destaque, com a variação. */
export function CartoesDeIndicadores({
  indicadores,
}: {
  indicadores: Indicadores;
}) {
  const { variacao } = indicadores;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <Cartao
        destaque
        icone={<BadgeCheck />}
        rotulo="Benefícios usados"
        valor={inteiro.format(indicadores.usados)}
        detalhe={
          <span className="flex items-center gap-1 text-xs font-semibold text-white/90">
            {variacao === null ? (
              indicadores.usadosAntes === 0 ? (
                "Sem usos no período anterior"
              ) : (
                `Eram ${inteiro.format(indicadores.usadosAntes)} no período anterior`
              )
            ) : (
              <>
                {variacao >= 0 ? (
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                ) : (
                  <ArrowDownRight aria-hidden="true" className="size-4" />
                )}
                {porcento.format(Math.abs(variacao))}{" "}
                {variacao >= 0 ? "a mais" : "a menos"} que o período anterior
              </>
            )}
          </span>
        }
      />
      <Cartao
        icone={<QrCode />}
        rotulo="Códigos gerados"
        valor={inteiro.format(indicadores.gerados)}
      />
      <Cartao
        icone={<Target />}
        rotulo="Taxa de uso"
        valor={
          indicadores.taxaDeUso === null
            ? "—"
            : porcento.format(indicadores.taxaDeUso)
        }
        detalhe={
          <span className="text-xs text-foreground-muted">
            Códigos confirmados pelo garçom
          </span>
        }
      />
      <Cartao
        icone={<Users />}
        rotulo="Assinantes"
        valor={inteiro.format(indicadores.assinantes)}
        detalhe={
          <span className="text-xs text-foreground-muted">
            Usaram pelo menos um benefício
          </span>
        }
      />
      <Cartao
        icone={<Store />}
        rotulo="Casas com uso"
        valor={inteiro.format(indicadores.casas)}
      />
    </div>
  );
}

const dataCurta = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

/** Usos por dia, em barras; o número de cada dia vai no título da barra. */
export function GraficoPorDia({
  serie,
}: {
  serie: readonly { dia: string; usados: number }[];
}) {
  const maximo = Math.max(1, ...serie.map((d) => d.usados));
  const largura = 100 / Math.max(serie.length, 1);
  const total = serie.reduce((soma, d) => soma + d.usados, 0);
  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="sr-only">
        Benefícios usados por dia: {total} no período.
      </figcaption>
      <div className="flex items-end justify-between text-xs text-foreground-muted">
        <span>Pico: {inteiro.format(maximo)} por dia</span>
      </div>
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="h-48 w-full overflow-visible"
        role="img"
        aria-label={`Gráfico de ${serie.length} dias`}
      >
        {[0.25, 0.5, 0.75].map((linha) => (
          <line
            key={linha}
            x1="0"
            x2="100"
            y1={40 - linha * 38}
            y2={40 - linha * 38}
            className="stroke-border"
            strokeWidth="0.15"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {serie.map((d, i) => {
          const altura = (d.usados / maximo) * 38;
          return (
            <rect
              key={d.dia}
              x={i * largura + largura * 0.15}
              y={40 - altura}
              width={largura * 0.7}
              height={Math.max(altura, d.usados > 0 ? 0.6 : 0)}
              rx={Math.min(largura * 0.2, 0.8)}
              className="fill-primary-solid"
            >
              <title>
                {dataCurta(d.dia)}: {d.usados}
              </title>
            </rect>
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-foreground-muted tabular-nums">
        <span>{serie[0] ? dataCurta(serie[0].dia) : ""}</span>
        <span>{serie.at(-1) ? dataCurta(serie.at(-1)!.dia) : ""}</span>
      </div>
    </figure>
  );
}

const DIAS = [
  { dia: 1, nome: "Seg" },
  { dia: 2, nome: "Ter" },
  { dia: 3, nome: "Qua" },
  { dia: 4, nome: "Qui" },
  { dia: 5, nome: "Sex" },
  { dia: 6, nome: "Sáb" },
  { dia: 0, nome: "Dom" },
] as const;
const HORAS = Array.from({ length: 17 }, (_, i) => i + 7); // 7h às 23h

/** Dia da semana × hora: onde está o movimento do balcão. */
export function MapaDeCalor({ calor }: { calor: number[][] }) {
  const maximo = Math.max(1, ...calor.flat());
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-xs">
        <caption className="sr-only">
          Usos por dia da semana e hora, no horário de Brasília
        </caption>
        <thead>
          <tr>
            <th scope="col" className="w-10" />
            {HORAS.map((hora) => (
              <th
                key={hora}
                scope="col"
                className="font-semibold text-foreground-muted tabular-nums"
              >
                {hora % 3 === 1 ? `${hora}h` : ""}
                <span className="sr-only">{hora}h</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DIAS.map(({ dia, nome }) => (
            <tr key={dia}>
              <th
                scope="row"
                className="pr-1 text-left font-semibold text-foreground-muted"
              >
                {nome}
              </th>
              {HORAS.map((hora) => {
                const valor = calor[dia]?.[hora] ?? 0;
                return (
                  <td
                    key={hora}
                    title={`${nome} ${hora}h: ${valor}`}
                    className="h-6 min-w-5 rounded-md"
                    style={{
                      backgroundColor:
                        valor === 0
                          ? "var(--color-surface-hover)"
                          : `color-mix(in oklab, var(--color-primary-solid) ${20 + (valor / maximo) * 80}%, transparent)`,
                    }}
                  >
                    <span className="sr-only">{valor}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Um ranking em barras horizontais, com o número ao lado. */
export function Ranking({
  itens,
  vazio,
}: {
  itens: readonly { nome: string; usados: number }[];
  vazio: string;
}) {
  if (itens.length === 0)
    return <p className="py-6 text-sm text-foreground-muted">{vazio}</p>;
  const maximo = Math.max(...itens.map((i) => i.usados));
  return (
    <ol className="flex flex-col gap-3">
      {itens.map((item, posicao) => (
        <li key={item.nome} className="flex flex-col gap-1">
          <span className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 font-semibold text-foreground">
              <span className="w-4 text-xs text-foreground-muted tabular-nums">
                {posicao + 1}
              </span>
              <span className="truncate">{item.nome}</span>
            </span>
            <span className="font-bold text-foreground tabular-nums">
              {inteiro.format(item.usados)}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="ml-6 h-2 overflow-hidden rounded-full bg-surface-hover"
          >
            <span
              className="block h-full rounded-full bg-brand-gradient"
              style={{ width: `${(item.usados / maximo) * 100}%` }}
            />
          </span>
        </li>
      ))}
    </ol>
  );
}
