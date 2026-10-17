import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { estiloDoBotao } from "@achados/ui/estilos";
import { ChevronLeft, Image as IconeImagem } from "lucide-react";

import { ROTAS } from "@/shared/rotas";
import type { Foto } from "../domain/tipos";

/**
 * A foto panorâmica no topo da ficha, com o degradê para o texto respirar,
 * voltar à esquerda, as ações (compartilhar, favoritar) à direita e o total de
 * fotos no canto, que leva à aba de fotos.
 */
export function TopoDaFicha({
  foto,
  totalDeFotos,
  hrefDasFotos,
  acoes,
}: {
  foto?: Foto;
  totalDeFotos: number;
  hrefDasFotos: string;
  acoes: ReactNode;
}) {
  return (
    <div className="relative h-64 bg-surface-hover lg:sticky lg:top-28 lg:h-[560px] lg:overflow-hidden lg:rounded-3xl lg:shadow-xl">
      {foto && (
        <Image
          src={foto.url}
          alt={foto.alt}
          fill
          priority
          sizes="(max-width: 1023px) 480px, 720px"
          className="object-cover"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20"
      />
      <div className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex items-center justify-between">
        <Link
          href={ROTAS.explorar}
          aria-label="Voltar para explorar"
          className={estiloDoBotao({
            variante: "flutuante",
            tamanho: "xs",
            somenteIcone: true,
            className: "size-9 [&_svg]:size-4",
          })}
        >
          <ChevronLeft />
        </Link>
        <div className="flex items-center gap-2">{acoes}</div>
      </div>
      {totalDeFotos > 1 && (
        <Link
          href={hrefDasFotos}
          scroll={false}
          className="absolute right-3 bottom-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm outline-none focus-visible:outline-2 focus-visible:outline-white"
        >
          <IconeImagem aria-hidden="true" className="size-3" />
          {totalDeFotos} fotos
        </Link>
      )}
    </div>
  );
}
