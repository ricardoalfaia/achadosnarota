import type { ReactNode } from "react";

import { MarcaDeAcesso } from "@/features/acesso";

/**
 * As telas de acesso (entrar, criar conta, recuperar senha), fora da barra
 * de navegação: a marca no alto e o formulário num cartão, na mesma coluna de
 * até 480px do app.
 */
export default function LayoutDeAcesso({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-background px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-8">
      <MarcaDeAcesso />
      <main className="flex flex-1 flex-col justify-center py-8">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
