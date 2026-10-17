import Image from "next/image";
import { Nota } from "@achados/ui";

import {
  BarraDeBusca,
  FiltroDeCategorias,
  type Categoria,
  type Cidade,
} from "@/features/catalogo";
import { CartaoPromocionalDoPassaporte } from "@/features/passaporte";

/**
 * O topo da versão desktop (protótipo `index.html`, `page.jpeg`): a estrada ao
 * pôr do sol, o lema em destaque, a busca e as categorias sobre a foto, e o
 * cartão do passaporte flutuando com um prato ao lado. Escuro nos dois temas.
 */
export function HeroDesktop({
  categorias,
  cidades,
}: {
  categorias: readonly Categoria[];
  cidades: readonly Cidade[];
}) {
  return (
    <section
      data-theme="dark"
      aria-labelledby="titulo-hero"
      className="relative flex min-h-[640px] items-center overflow-hidden bg-background text-white"
    >
      <Image
        src="/imagens/hero-estrada.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover brightness-75 contrast-[1.05]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-background/85 via-background/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-background/70 via-transparent to-background/30"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-12 items-center gap-12 px-8 py-24">
        <div className="col-span-7 flex flex-col">
          <h1
            id="titulo-hero"
            className="text-6xl leading-[1.08] font-extrabold tracking-tight"
          >
            Descubra lugares
            <br />
            que <span className="text-brand-gradient">valem a pena</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed font-medium text-white/85">
            Restaurantes, cafés, pousadas e experiências, com curadoria
            independente e benefícios para quem está na rota.
          </p>
          <div
            id="busca"
            data-theme="light"
            className="mt-8 max-w-2xl scroll-mt-32"
          >
            <BarraDeBusca cidades={cidades} variante="hero" />
          </div>
          <div id="categorias" className="mt-8 scroll-mt-32">
            <FiltroDeCategorias categorias={categorias} variante="hero" />
          </div>
        </div>

        <div className="relative col-span-5 flex items-center justify-center">
          <CartaoPromocionalDoPassaporte className="-translate-x-10 -translate-y-8 animate-flutuar" />
          <div
            aria-hidden="true"
            className="absolute right-0 -bottom-24 w-56 -rotate-3 overflow-hidden rounded-2xl border-2 border-white shadow-2xl transition-transform duration-300 hover:rotate-0"
          >
            <Image
              src="/imagens/prato.webp"
              alt=""
              width={448}
              height={288}
              className="h-36 w-full object-cover"
            />
            <div className="bg-surface/95 p-3">
              <Nota valor={4.9} complemento="Alta gastronomia" />
              <p className="mt-0.5 truncate text-xs font-bold text-foreground">
                Experiências que valem a pena
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
