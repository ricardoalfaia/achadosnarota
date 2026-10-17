import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { estiloDoBotao } from "@achados/ui/estilos";
import { ArrowRight } from "lucide-react";

import { ROTAS } from "@/shared/rotas";

/**
 * A chamada final da versão desktop: "Sua próxima experiência começa aqui",
 * sobre a estrada ao pôr do sol, com o cartão do passaporte ao lado (vindo de
 * quem compõe).
 */
export function ChamadaDoPassaporte({ cartao }: { cartao: ReactNode }) {
  return (
    <section className="bg-surface-hover py-16">
      <div className="mx-auto max-w-7xl px-8">
        <div
          data-theme="dark"
          className="relative flex min-h-[320px] items-center overflow-hidden rounded-3xl bg-background text-white shadow-2xl"
        >
          <Image
            src="/imagens/hero-estrada.webp"
            alt=""
            fill
            sizes="1280px"
            className="object-cover object-bottom opacity-40 brightness-75"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-r from-background via-background/80 to-transparent"
          />
          <div className="relative z-10 grid w-full grid-cols-12 items-center gap-8 p-16">
            <div className="col-span-8">
              <h2 className="text-4xl leading-tight font-extrabold tracking-tight">
                Sua próxima experiência
                <br />
                começa aqui.
              </h2>
              <p className="mt-3 max-w-lg text-base text-white/75">
                Com o Passaporte Achados na Rota, você tem benefícios nos
                lugares avaliados pela curadoria, com as regras de cada um à
                vista.
              </p>
              <Link
                href={ROTAS.passaporte}
                className={estiloDoBotao({
                  tamanho: "lg",
                  className: "mt-6 px-8",
                })}
              >
                Conhecer o passaporte
                <ArrowRight />
              </Link>
            </div>
            <div className="col-span-4 flex justify-end">{cartao}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
