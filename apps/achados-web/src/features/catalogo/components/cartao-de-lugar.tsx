import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Etiqueta, Nota } from "@achados/ui";
import { ChevronRight, MapPin } from "lucide-react";

import { rotaDoLugar } from "@/shared/rotas";
import type { CartaoDeLugar as Lugar } from "../domain/tipos";
import { IconeDoBeneficio } from "./icones";
import { SeloDoLugar } from "./selo-do-lugar";

/**
 * O cartão de um lugar na lista de destaques: foto com o selo editorial, a
 * especialidade e o espaço do favorito; nome, nota, cidade e a faixa laranja
 * do benefício. O cartão inteiro leva à ficha pelo link do nome (que se
 * estende sobre o cartão); o favorito fica por cima, como controle próprio,
 * sem botão dentro de link.
 */
export function CartaoDeLugar({
  lugar,
  favorito,
  prioridade = false,
}: {
  lugar: Lugar;
  /** O botão de favoritar, composto por quem monta a lista. */
  favorito?: ReactNode;
  /** A primeira foto visível carrega antes (LCP). */
  prioridade?: boolean;
}) {
  return (
    <article className="group relative overflow-hidden rounded-card border border-border bg-surface shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="relative h-40 bg-surface-hover">
        {lugar.foto && (
          <Image
            src={lugar.foto.url}
            alt={lugar.foto.alt}
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            priority={prioridade}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {lugar.selo && (
          <div className="absolute top-2 left-2">
            <SeloDoLugar selo={lugar.selo} tamanho="sm" />
          </div>
        )}
        <Etiqueta tom="claro" tamanho="sm" className="absolute bottom-2 left-2">
          {lugar.especialidade}
        </Etiqueta>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-bold text-foreground">
            <Link
              href={rotaDoLugar(lugar.slug)}
              className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
            >
              {lugar.nome}
            </Link>
          </h3>
          {lugar.nota !== undefined && <Nota valor={lugar.nota} />}
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-foreground-muted">
          <MapPin aria-hidden="true" className="size-3 shrink-0" />
          {lugar.local}
        </p>
        {lugar.beneficio && (
          <p className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-primary-border bg-primary-subtle p-2 text-xs font-bold text-primary">
            <span className="flex min-w-0 items-center gap-1.5">
              <IconeDoBeneficio
                chave={lugar.beneficio.icone}
                className="size-3.5 shrink-0 text-brand"
              />
              <span className="truncate">{lugar.beneficio.titulo}</span>
            </span>
            <ChevronRight aria-hidden="true" className="size-3 shrink-0" />
          </p>
        )}
      </div>

      {favorito && (
        <div className="absolute top-2 right-2 z-10">{favorito}</div>
      )}
    </article>
  );
}
