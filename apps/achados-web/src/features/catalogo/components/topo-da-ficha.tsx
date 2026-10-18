import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { estiloDoBotao } from "@achados/ui/estilos";
import { ChevronLeft, Image as IconeImagem } from "lucide-react";

import { ROTAS } from "@/shared/rotas";
import type { Foto } from "../domain/tipos";

/**
 * A foto do topo da ficha. No celular, domina a tela, com o nome do lugar
 * por cima (`children`, sobre o degradê escuro); no desktop, fica fixa na
 * coluna da esquerda. Voltar à esquerda, as ações (compartilhar, favoritar) à
 * direita e o total de fotos, que leva à aba de fotos.
 */
export function TopoDaFicha({
  foto,
  totalDeFotos,
  hrefDasFotos,
  acoes,
  children,
}: {
  foto?: Foto;
  totalDeFotos: number;
  hrefDasFotos: string;
  acoes: ReactNode;
  /** O que vai sobre a foto no celular: o cabeçalho do lugar. */
  children?: ReactNode;
}) {
  return (
    <div className="relative h-[60svh] max-h-[560px] min-h-[380px] overflow-hidden rounded-b-[2rem] bg-surface-hover lg:sticky lg:top-28 lg:h-[560px] lg:max-h-none lg:rounded-3xl lg:shadow-xl">
      {foto && (
        <Image
          src={foto.url}
          alt={foto.alt}
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 720px"
          className="object-cover"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-black/30 lg:from-black/60 lg:via-transparent lg:to-black/20"
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
          className="absolute top-[calc(max(0.75rem,env(safe-area-inset-top))+3rem)] right-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm outline-none focus-visible:outline-2 focus-visible:outline-white lg:top-auto lg:bottom-3"
        >
          <IconeImagem aria-hidden="true" className="size-3" />
          {totalDeFotos} fotos
        </Link>
      )}
      {children && (
        <div
          data-theme="dark"
          className="absolute inset-x-0 bottom-0 z-10 p-5 pb-6 lg:hidden"
        >
          {children}
        </div>
      )}
    </div>
  );
}
