import type { Metadata } from "next";
import { EstadoVazio } from "@achados/ui";
import { Store } from "lucide-react";

import { Balcao } from "@/features/balcao";
import { casasDoOperador } from "@/features/balcao/servidor";
import { BarraDaTela } from "@/shared/casca/barra-da-tela";
import { ROTAS } from "@/shared/rotas";
import { exigirSessao } from "@/shared/sessao/sessao.servidor";

export const metadata: Metadata = {
  title: "Balcão",
  robots: { index: false },
};

/**
 * O modo balcão: o garçom confirma o código que o cliente mostra. Só para
 * contas vinculadas a uma casa; o vínculo é conferido de novo no banco a cada
 * confirmação.
 */
export default async function PaginaDoBalcao() {
  const usuario = await exigirSessao(ROTAS.balcao);
  const casas = await casasDoOperador(usuario.id);

  return (
    <div className="flex flex-col gap-5 p-4 pt-[max(1rem,env(safe-area-inset-top))] lg:mx-auto lg:w-full lg:max-w-xl lg:py-12">
      <BarraDaTela titulo="Balcão" />
      {casas.length === 0 ? (
        <EstadoVazio
          icone={<Store />}
          titulo="Sua conta não opera nenhuma casa"
          descricao="O modo balcão é para quem atende nas casas parceiras. Peça à equipe do Achados na Rota para vincular sua conta."
          className="py-12"
        />
      ) : (
        <>
          <p className="text-[15px] leading-relaxed text-foreground-muted">
            Peça para o cliente tocar em <strong>Usar</strong> no benefício e
            digite o código que aparece na tela dele.
          </p>
          <Balcao casas={casas} />
        </>
      )}
    </div>
  );
}
