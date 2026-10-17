import type { ReactNode } from "react";

import { BuscaRapida } from "@/features/catalogo";
import { AvisoSemConexao } from "@/shared/casca/aviso-sem-conexao";
import { CabecalhoDesktop } from "@/shared/casca/cabecalho-desktop";
import { NavegacaoInferior } from "@/shared/casca/navegacao-inferior";
import { RodapeDesktop } from "@/shared/casca/rodape-desktop";
import { pessoaDaSessao } from "@/shared/sessao/sessao";
import { pessoaDoPedido } from "@/shared/sessao/sessao.servidor";

/**
 * A casca do app, mobile-first. No celular: uma coluna de até 480px e a barra
 * de navegação no pé; cada tela compõe o próprio topo. A partir de 1024px
 * (`lg`), a versão desktop do protótipo: cabeçalho com navegação, conteúdo
 * na largura da página e rodapé; a barra inferior some. É o mesmo app, por
 * CSS: sem detectar aparelho, sem "piscar" entre modelos.
 */
export default async function LayoutDoApp({
  children,
}: {
  children: ReactNode;
}) {
  const usuario = await pessoaDoPedido();
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-background shadow-[0_0_40px_rgb(15_23_42/0.06)] lg:max-w-none lg:shadow-none">
      <CabecalhoDesktop
        pessoa={usuario ? pessoaDaSessao(usuario) : null}
        busca={<BuscaRapida />}
      />
      <AvisoSemConexao />
      <main className="flex-1 pb-28 lg:pb-0">{children}</main>
      <RodapeDesktop />
      <NavegacaoInferior />
    </div>
  );
}
