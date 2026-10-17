import type { ReactNode } from "react";

import { AvisoSemConexao } from "@/shared/casca/aviso-sem-conexao";
import { NavegacaoInferior } from "@/shared/casca/navegacao-inferior";

/**
 * A casca do PWA: uma coluna de até 480px (no celular, a tela toda; no
 * computador, centralizada como o app) e a barra de navegação no pé. Cada
 * tela compõe o próprio topo: o cabeçalho com a marca, a barra de seção ou a
 * foto do lugar.
 */
export default function LayoutDoApp({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-background shadow-[0_0_40px_rgb(15_23_42/0.06)]">
      <AvisoSemConexao />
      <main className="flex-1 pb-28">{children}</main>
      <NavegacaoInferior />
    </div>
  );
}
