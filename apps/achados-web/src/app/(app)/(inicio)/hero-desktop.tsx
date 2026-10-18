import Image from "next/image";

import {
  AtalhosDeCidade,
  BarraDeBusca,
  CartaoEmDestaque,
  FiltroDeCategorias,
  NumerosDoCatalogo,
  type Categoria,
  type Cidade,
  type VitrineDoCatalogo,
} from "@/features/catalogo";
import {
  CartaoPromocionalDoPassaporte,
  ChamadaDoPlano,
  type Plano,
} from "@/features/passaporte";

/**
 * O topo da versão desktop (protótipo `index.html`, `page.jpeg`): a estrada ao
 * pôr do sol e o lema; a busca com atalhos de cidade e as categorias; os
 * números da curadoria como prova. À direita, um achado real da curadoria na
 * frente do cartão do passaporte, com o preço do plano. Tudo vem do banco:
 * nada de nota, lugar ou número de vitrine inventado. Escuro nos dois temas.
 */
export function HeroDesktop({
  categorias,
  cidades,
  vitrine,
  plano,
}: {
  categorias: readonly Categoria[];
  cidades: readonly Cidade[];
  vitrine: VitrineDoCatalogo;
  plano: Plano | null;
}) {
  return (
    <section
      data-theme="dark"
      aria-labelledby="titulo-hero"
      className="relative flex min-h-[680px] items-center overflow-hidden bg-background text-white"
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
        className="absolute inset-0 bg-linear-to-r from-background/90 via-background/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-background/30"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-12 items-center gap-10 px-8 py-20">
        <div className="col-span-7 flex flex-col">
          <h1
            id="titulo-hero"
            className="text-6xl leading-[1.05] font-extrabold tracking-tight"
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
          <div className="mt-4">
            <AtalhosDeCidade cidades={cidades} />
          </div>
          <div id="categorias" className="mt-6 scroll-mt-32">
            <FiltroDeCategorias categorias={categorias} variante="hero" />
          </div>
          <div className="mt-8 border-t border-white/15 pt-6">
            <NumerosDoCatalogo
              lugares={vitrine.lugares}
              cidades={vitrine.cidades}
            />
          </div>
        </div>

        <div className="relative col-span-5 flex min-h-[460px] flex-col items-end justify-center">
          <CartaoPromocionalDoPassaporte
            inclinacao="forte"
            className="absolute top-0 left-0 opacity-90"
          />
          {vitrine.destaques[0] && (
            <div className="relative z-10 mt-16 animate-flutuar">
              <CartaoEmDestaque lugar={vitrine.destaques[0]} />
            </div>
          )}
          <div className="relative z-10 mt-5 self-end">
            <ChamadaDoPlano plano={plano} />
          </div>
        </div>
      </div>
    </section>
  );
}
