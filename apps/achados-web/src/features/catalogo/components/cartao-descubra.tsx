import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ROTAS } from "@/shared/rotas";

/**
 * O cartão de abertura da exploração: foto escurecida, "Descubra lugares que
 * valem a pena" com o trecho em âmbar e a seta que leva ao passaporte. O
 * cartão inteiro é o link.
 */
export function CartaoDescubra() {
  return (
    <Link
      href={ROTAS.passaporte}
      className="group relative flex min-h-[148px] items-center overflow-hidden rounded-3xl text-white shadow-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <Image
        src="/imagens/descubra.webp"
        alt=""
        fill
        sizes="(max-width: 480px) 100vw, 480px"
        priority
        className="object-cover brightness-[0.62] transition-transform duration-500 group-hover:scale-105"
      />
      <div className="relative z-10 p-5">
        <h2 className="text-lg leading-tight font-extrabold tracking-tight">
          Descubra lugares
          <br />
          que <span className="text-accent-on-dark">valem a pena</span>
        </h2>
        <p className="mt-1 max-w-[210px] text-xs leading-relaxed text-white/85">
          Comida boa, experiências reais e benefícios exclusivos para quem está
          na rota.
        </p>
        <span
          aria-hidden="true"
          className="mt-3 flex size-8 items-center justify-center rounded-full bg-white text-foreground shadow-md transition-transform duration-200 group-hover:translate-x-1"
        >
          <ArrowRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
