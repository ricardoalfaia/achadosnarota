import Image from "next/image";
import { ClipboardCheck, KeyRound, Store } from "lucide-react";

import { Marca } from "@/shared/casca/marca";

const ITENS = [
  {
    icone: ClipboardCheck,
    texto: "Curadoria com critérios e parecer, separada da oferta comercial",
  },
  { icone: Store, texto: "Casas, promoções e operadores do balcão" },
  { icone: KeyRound, texto: "Acesso só da equipe, com autenticador" },
];

/**
 * O lado da marca na entrada do painel, só no desktop: a estrada ao pôr do
 * sol do app do assinante e o que a equipe faz aqui. Escuro nos dois temas.
 */
export function PainelDaMarca() {
  return (
    <aside
      data-theme="dark"
      className="relative hidden overflow-hidden bg-background text-white lg:flex lg:flex-col"
    >
      <Image
        src="/imagens/hero-estrada.webp"
        alt=""
        fill
        priority
        sizes="55vw"
        className="object-cover brightness-75 contrast-[1.05]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-background/95 via-background/75 to-background/40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-background via-transparent to-background/50"
      />

      <div className="relative z-10 flex flex-1 flex-col px-14 py-12 xl:px-20">
        <Marca className="self-start" />

        <div className="flex flex-1 items-center py-12">
          <div className="max-w-lg">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-extrabold tracking-wide text-white/90 uppercase backdrop-blur">
              Painel da equipe
            </p>
            <h2 className="mt-5 text-4xl leading-[1.1] font-extrabold tracking-tight xl:text-5xl">
              Os achados da rota passam por aqui.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              Cadastre as casas, registre a curadoria e cuide das promoções dos
              parceiros.
            </p>
            <ul className="mt-8 flex flex-col gap-4">
              {ITENS.map(({ icone: Icone, texto }) => (
                <li key={texto} className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-brand backdrop-blur">
                    <Icone className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-white/90">
                    {texto}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-white/50">
          Área restrita à equipe do Achados na Rota.
        </p>
      </div>
    </aside>
  );
}
