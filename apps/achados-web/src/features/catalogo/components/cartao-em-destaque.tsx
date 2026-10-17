import Image from "next/image";
import Link from "next/link";
import { Nota } from "@achados/ui";
import { ArrowRight, MapPin } from "lucide-react";

import { rotaDoLugar } from "@/shared/rotas";
import type { CartaoDeLugar as Lugar } from "../domain/tipos";
import { IconeDoBeneficio } from "./icones";
import { SeloDoLugar } from "./selo-do-lugar";

/**
 * O achado em destaque no topo da versão desktop: o primeiro lugar da
 * curadoria, com foto, selo, nota, cidade e o benefício do passaporte. Um
 * exemplo real do que o visitante encontra, que leva direto à ficha.
 */
export function CartaoEmDestaque({ lugar }: { lugar: Lugar }) {
  return (
    <article className="group relative w-80 overflow-hidden rounded-3xl border border-white/15 bg-surface text-foreground shadow-2xl transition-transform duration-500 hover:-translate-y-1">
      <div className="relative h-44 bg-surface-hover">
        {lugar.foto && (
          <Image
            src={lugar.foto.url}
            alt={lugar.foto.alt}
            fill
            sizes="320px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-white uppercase backdrop-blur-sm">
            Achado em destaque
          </span>
          {lugar.selo && <SeloDoLugar selo={lugar.selo} tamanho="sm" />}
        </div>
      </div>
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="truncate text-base font-extrabold">
            <Link
              href={rotaDoLugar(lugar.slug)}
              className="outline-none after:absolute after:inset-0 focus-visible:after:rounded-3xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
            >
              {lugar.nome}
            </Link>
          </h2>
          {lugar.nota !== undefined && <Nota valor={lugar.nota} />}
        </div>
        <p className="flex items-center gap-1 text-xs text-foreground-muted">
          <MapPin aria-hidden="true" className="size-3 shrink-0" />
          {lugar.especialidade} · {lugar.local}
        </p>
        {lugar.beneficio && (
          <p className="mt-2 flex items-center gap-1.5 rounded-xl border border-primary-border bg-primary-subtle px-2.5 py-2 text-xs font-bold text-primary">
            <IconeDoBeneficio
              chave={lugar.beneficio.icone}
              className="size-3.5 shrink-0 text-brand"
            />
            <span className="truncate">{lugar.beneficio.titulo}</span>
          </p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">
          Ver a avaliação
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </article>
  );
}
