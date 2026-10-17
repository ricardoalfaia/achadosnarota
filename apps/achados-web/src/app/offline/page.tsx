import type { Metadata } from "next";

import { Marca } from "@/shared/casca/marca";
import { BotaoDeTentarDeNovo } from "./botao-de-tentar-de-novo";

export const metadata: Metadata = {
  title: "Sem conexão",
  robots: { index: false },
};

/**
 * A página que o service worker mostra quando não há rede. É estática e sem
 * dado de ninguém: o worker a guarda na instalação.
 */
export default function Offline() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Marca tamanho="lg" />
      <div>
        <h1 className="text-xl font-extrabold text-foreground">
          Você está sem conexão
        </h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Assim que a internet voltar, os lugares e benefícios aparecem de novo.
        </p>
      </div>
      <BotaoDeTentarDeNovo />
    </main>
  );
}
