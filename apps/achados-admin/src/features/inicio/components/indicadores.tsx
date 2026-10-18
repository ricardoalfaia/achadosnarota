"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { CartaoDeIndicador, Esqueleto } from "@achados/ui";
import { BadgePercent, ClipboardCheck, FilePen, Store } from "lucide-react";

import { ROTAS } from "@/shared/rotas";
import { useIndicadores } from "../hooks/use-resumo-do-painel";

const LINK =
  "rounded-card outline-none animate-entrar [animation-delay:calc(var(--ordem)*60ms)]";

/** Os quatro números do início; cada cartão leva à lista filtrada. */
export function Indicadores() {
  const i = useIndicadores();
  const cartoes = [
    {
      href: `${ROTAS.casas}?status=published`,
      icone: <Store />,
      valor: i.casasPublicadas,
      rotulo: "Casas publicadas",
      tom: "primario" as const,
    },
    {
      href: `${ROTAS.curadoria}?status=in_review`,
      icone: <ClipboardCheck />,
      valor: i.avaliacoesEmRevisao,
      rotulo: "Avaliações em revisão",
      tom: "destaque" as const,
    },
    {
      href: `${ROTAS.promocoes}?status=active`,
      icone: <BadgePercent />,
      valor: i.promocoesAtivas,
      rotulo: "Promoções ativas",
      tom: "sucesso" as const,
    },
    {
      href: `${ROTAS.casas}?status=draft`,
      icone: <FilePen />,
      valor: i.casasEmRascunho,
      rotulo: "Casas em rascunho",
      tom: "aviso" as const,
    },
  ];

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cartoes.map((cartao, ordem) => (
        <li key={cartao.rotulo}>
          <Link
            href={cartao.href}
            className={LINK}
            style={{ "--ordem": ordem } as CSSProperties}
          >
            <CartaoDeIndicador
              icone={cartao.icone}
              valor={cartao.valor}
              rotulo={cartao.rotulo}
              tom={cartao.tom}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Enquanto os números chegam: quatro cartões na forma final. */
export function EsqueletoDosIndicadores() {
  return (
    <ul
      aria-busy="true"
      aria-label="Carregando indicadores"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {[0, 1, 2, 3].map((i) => (
        <li
          key={i}
          className="flex h-40 flex-col gap-3 rounded-card border border-border bg-surface p-5"
        >
          <Esqueleto className="size-6 rounded" />
          <Esqueleto className="h-9 w-16 rounded" />
          <Esqueleto className="h-5 w-40 rounded" />
        </li>
      ))}
    </ul>
  );
}
