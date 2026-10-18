import type { ReactNode } from "react";

import { BotaoDeVoltar, MarcaDeAcesso } from "@/features/acesso";
import { PainelDaMarca } from "./painel-da-marca";

/**
 * As telas de acesso (entrar, criar conta, recuperar senha), fora da barra
 * de navegação. No celular: o voltar e a marca no alto, sobre um brilho
 * laranja, e o formulário num cartão. No desktop: a tela se divide, com o
 * painel da marca à esquerda e o formulário à direita. O voltar deixa sair
 * sem entrar nem criar conta.
 */
export default function LayoutDeAcesso({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <PainelDaMarca />

      <div className="relative isolate flex min-h-dvh flex-col overflow-hidden px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] lg:px-12">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-80 bg-linear-to-b from-primary-subtle via-primary-subtle/40 to-transparent lg:hidden"
        />
        <div
          aria-hidden="true"
          className="absolute -top-24 left-1/2 -z-10 size-72 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl lg:hidden"
        />

        <div className="mx-auto w-full max-w-[440px] lg:max-w-none">
          <BotaoDeVoltar />
        </div>
        <div className="mt-6 lg:hidden">
          <MarcaDeAcesso />
        </div>

        <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center pt-6 pb-4 lg:py-8">
          <div className="rounded-[28px] border border-border bg-surface p-6 shadow-[0_24px_60px_-24px_var(--ar-shadow-color-strong)] sm:p-8 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
