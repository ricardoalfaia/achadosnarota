import type { ReactNode } from "react";

import {
  MarcaDeAcesso,
  PainelDaMarca,
  RodapeDeAcesso,
} from "@/features/acesso";

/**
 * As telas públicas (login e recuperação de senha), fora da casca: a coluna do
 * formulário, que segue o tema de quem usa, e o painel da marca ao lado. O
 * painel fica no layout para não ser refeito ao ir do login para a recuperação.
 */
export default function LayoutDeAcesso({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="flex min-h-screen flex-col px-10 py-8 max-sm:px-5 max-sm:py-6">
        <MarcaDeAcesso />
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-100">{children}</div>
        </main>
        <RodapeDeAcesso />
      </div>
      <PainelDaMarca />
    </div>
  );
}
