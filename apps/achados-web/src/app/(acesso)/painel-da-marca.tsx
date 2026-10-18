import Image from "next/image";
import Link from "next/link";
import { Crown, Heart, ShieldCheck, Ticket } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { CartaoPromocionalDoPassaporte } from "@/features/passaporte";
import { Marca } from "@/shared/casca/marca";
import { ROTAS } from "@/shared/rotas";

/**
 * O lado da marca nas telas de acesso, só no desktop: a estrada ao pôr do sol
 * do topo do app, o convite e o que a conta oferece, com o cartão do
 * passaporte como peça de vitrine. Escuro nos dois temas, como o hero.
 */
export async function PainelDaMarca() {
  const t = await getTranslations("Acesso.casca.painel");
  const itens = [
    { icone: ShieldCheck, texto: t("curadoria") },
    { icone: Ticket, texto: t("beneficios") },
    { icone: Heart, texto: t("favoritos") },
  ];

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
        <Link
          href={ROTAS.explorar}
          aria-label="Achados na Rota, início"
          className="self-start rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Marca tamanho="lg" />
        </Link>

        <div className="flex flex-1 items-center gap-10 py-12">
          <div className="max-w-lg">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-accent-on-dark/40 bg-accent-on-dark/15 px-3 py-1 text-xs font-extrabold text-accent-on-dark">
              <Crown className="size-3" aria-hidden="true" />
              {t("selo")}
            </p>
            <h2 className="mt-5 text-4xl leading-[1.1] font-extrabold tracking-tight xl:text-5xl">
              {t("titulo")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              {t("texto")}
            </p>
            <ul className="mt-8 flex flex-col gap-4">
              {itens.map(({ icone: Icone, texto }) => (
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
          <div className="hidden shrink-0 2xl:block">
            <CartaoPromocionalDoPassaporte className="w-72" />
          </div>
        </div>
      </div>
    </aside>
  );
}
