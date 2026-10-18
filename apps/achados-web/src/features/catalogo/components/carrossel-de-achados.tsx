import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatarNota } from "@achados/ui/estilos";
import { Star } from "lucide-react";

import { rotaDoLugar } from "@/shared/rotas";
import type { CartaoDeLugar as Lugar } from "../domain/tipos";
import { IconeDoBeneficio } from "./icones";
import { SeloDoLugar } from "./selo-do-lugar";

/** Um achado do carrossel: a foto ocupa o cartão, o nome vem grande por cima. */
function CartaoDeAchado({ lugar, ordem }: { lugar: Lugar; ordem: number }) {
  return (
    <li
      style={{ "--ordem": ordem } as CSSProperties}
      className="w-[82%] shrink-0 animate-entrar snap-start"
    >
      <Link
        href={rotaDoLugar(lugar.slug)}
        className="group relative flex h-[22rem] flex-col justify-end overflow-hidden rounded-[2rem] bg-surface-hover text-white shadow-lg transition-transform duration-200 ease-spring outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98]"
      >
        {lugar.foto && (
          <Image
            src={lugar.foto.url}
            alt={lugar.foto.alt}
            fill
            sizes="(max-width: 480px) 82vw, 400px"
            priority={ordem === 0}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/10"
        />
        {lugar.selo && (
          <div className="absolute top-4 left-4">
            <SeloDoLugar selo={lugar.selo} />
          </div>
        )}
        <div className="relative flex flex-col gap-2 p-5">
          <span className="text-xs font-bold tracking-[0.14em] text-white/75 uppercase">
            {lugar.especialidade}
          </span>
          <span className="text-[1.75rem] leading-[1.05] font-extrabold tracking-tight">
            {lugar.nome}
          </span>
          <span className="flex items-center gap-2 text-sm text-white/85">
            {lugar.nota !== undefined && (
              <span className="flex items-center gap-1 font-bold text-white">
                <Star
                  aria-hidden="true"
                  className="size-4 fill-star text-star"
                />
                {formatarNota(lugar.nota)}
              </span>
            )}
            <span className="truncate">{lugar.local}</span>
          </span>
          {lugar.beneficio && (
            <span className="mt-1 flex items-center gap-2 self-start rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold backdrop-blur-md">
              <IconeDoBeneficio
                chave={lugar.beneficio.icone}
                className="size-4 shrink-0 text-accent-on-dark"
              />
              <span className="truncate">{lugar.beneficio.titulo}</span>
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

/**
 * Os achados da curadoria em cartões grandes, deslizando de lado com encaixe.
 * O momento de impacto do topo no celular: foto, nome grande e o benefício.
 */
export function CarrosselDeAchados({ lugares }: { lugares: readonly Lugar[] }) {
  if (lugares.length === 0) return null;
  return (
    <section aria-labelledby="titulo-achados">
      <h2
        id="titulo-achados"
        className="mb-3 text-xl font-extrabold tracking-tight text-foreground"
      >
        Achados da curadoria
      </h2>
      <ul className="-mx-4 scrollbar-none flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2">
        {lugares.map((lugar, ordem) => (
          <CartaoDeAchado key={lugar.slug} lugar={lugar} ordem={ordem} />
        ))}
      </ul>
    </section>
  );
}
