"use client";

import Link from "next/link";
import { DataBoundary } from "@achados/data-boundary";
import { CartaoDeAcao, Destaque } from "@achados/ui";
import { estiloDoBotao } from "@achados/ui/estilos";
import { BadgePercent, ClipboardCheck, Plus, Store } from "lucide-react";

import { FalhaDaRegiao } from "@/shared/cadastro/falha-da-regiao";
import { rotaDoRegistro, ROTAS } from "@/shared/rotas";
import { EsqueletoDaFila, FilaDeTrabalho } from "./fila-de-trabalho";
import { EsqueletoDosIndicadores, Indicadores } from "./indicadores";

const ACOES = [
  {
    href: rotaDoRegistro(ROTAS.casas, "novo"),
    icone: <Store />,
    titulo: "Cadastrar casa",
    descricao: "Dados, fotos e publicação",
    tom: "primario" as const,
  },
  {
    href: rotaDoRegistro(ROTAS.curadoria, "novo"),
    icone: <ClipboardCheck />,
    titulo: "Registrar visita",
    descricao: "Notas por critério e parecer",
    tom: "destaque" as const,
  },
  {
    href: rotaDoRegistro(ROTAS.promocoes, "novo"),
    icone: <BadgePercent />,
    titulo: "Criar promoção",
    descricao: "Benefício com regras de uso",
    tom: "sucesso" as const,
  },
];

/**
 * O início do painel: o destaque da marca, os indicadores e, lado a lado, a
 * fila de trabalho e as ações rápidas. Indicadores e fila são regiões com
 * DataBoundary próprio: uma falha não apaga a outra (ADR-0005), e os dois
 * leem o mesmo recurso do Query (`select`), sem pedido duplicado.
 */
export function PainelInicial({ saudacao }: { saudacao: string }) {
  return (
    <div className="flex flex-col gap-6">
      <Destaque
        nivelDoTitulo="h1"
        saudacao={`${saudacao}, equipe 👋`}
        titulo={
          <>
            Descubra lugares que{" "}
            <span className="text-brand-gradient">valem a pena.</span>
          </>
        }
        descricao="Cadastre casas, registre a curadoria e cuide das promoções do passaporte. O editorial e o comercial ficam sempre separados."
        acoes={
          <>
            <Link
              href={rotaDoRegistro(ROTAS.casas, "novo")}
              className={estiloDoBotao({ tamanho: "md" })}
            >
              <Plus aria-hidden="true" />
              Nova casa
            </Link>
            <Link
              href={ROTAS.curadoria}
              className={estiloDoBotao({ variante: "contorno", tamanho: "md" })}
            >
              Abrir a curadoria
            </Link>
          </>
        }
        ilustracao={<IlustracaoDaRota />}
        className="animate-pagina"
      />

      <DataBoundary
        fallback={<EsqueletoDosIndicadores />}
        errorFallback={(erro, reset) => (
          <FalhaDaRegiao erro={erro} tentarDeNovo={reset} />
        )}
      >
        <Indicadores />
      </DataBoundary>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <DataBoundary
          fallback={<EsqueletoDaFila />}
          errorFallback={(erro, reset) => (
            <FalhaDaRegiao erro={erro} tentarDeNovo={reset} />
          )}
        >
          <FilaDeTrabalho />
        </DataBoundary>

        <section
          aria-labelledby="acoes-rapidas"
          className="flex flex-col gap-3"
        >
          <h2 id="acoes-rapidas" className="text-lg font-bold text-foreground">
            Ações rápidas
          </h2>
          <ul className="flex flex-col gap-3">
            {ACOES.map((acao) => (
              <li key={acao.titulo}>
                <Link
                  href={acao.href}
                  className="block rounded-card outline-none"
                >
                  <CartaoDeAcao
                    icone={acao.icone}
                    titulo={acao.titulo}
                    descricao={acao.descricao}
                    tom={acao.tom}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/** A estrada curva com o pin, como no símbolo da marca. Decorativa. */
function IlustracaoDaRota() {
  return (
    <svg viewBox="0 0 220 160" className="h-40 w-56" fill="none">
      <defs>
        <linearGradient id="estrada" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="var(--ar-brand-gradient-start)" />
          <stop offset="1" stopColor="var(--ar-brand-gradient-end)" />
        </linearGradient>
      </defs>
      <path
        d="M10 150 C 70 140, 60 90, 110 80 S 170 40, 210 20"
        stroke="url(#estrada)"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="M10 150 C 70 140, 60 90, 110 80 S 170 40, 210 20"
        stroke="var(--ar-surface)"
        strokeWidth="2"
        strokeDasharray="8 10"
        strokeLinecap="round"
      />
      <g className="animate-flutuar">
        <path
          d="M150 18c-11 0-20 9-20 20 0 15 20 34 20 34s20-19 20-34c0-11-9-20-20-20Z"
          fill="var(--ar-foreground-brand)"
        />
        <circle cx="150" cy="38" r="7" fill="var(--ar-surface)" />
      </g>
    </svg>
  );
}
