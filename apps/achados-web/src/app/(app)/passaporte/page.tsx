import type { Metadata } from "next";
import { unwrapOrThrow } from "@achados/core";

import { CuponsDoPassaporte } from "@/features/beneficios";
import { listarBeneficiosDisponiveis } from "@/features/beneficios/servidor";
import {
  CartaoDoPassaporte,
  EstatisticasDoPassaporte,
  OfertaDoPassaporte,
} from "@/features/passaporte";
import { lerPassaporte, lerPlanoAtivo } from "@/features/passaporte/servidor";
import { BarraDaTela } from "@/shared/casca/barra-da-tela";
import { sessaoLiberada } from "@/shared/sessao/sessao.servidor";

export const metadata: Metadata = {
  title: "Meu Passaporte",
  description:
    "O passaporte anual do Achados na Rota: benefícios em lugares com curadoria independente.",
};

/**
 * Meu Passaporte (protótipo, tela 3). Com passaporte vigente: o cartão, os
 * números e os cupons. Sem ele (ou sem conta): o cartão apagado, o plano e
 * os benefícios que ele dá.
 */
export default async function PaginaDoPassaporte() {
  const usuario = await sessaoLiberada();
  const [passaporte, plano, disponiveis] = await Promise.all([
    usuario ? lerPassaporte(usuario.id) : null,
    lerPlanoAtivo(),
    listarBeneficiosDisponiveis(),
  ]);
  const meuPassaporte = passaporte
    ? unwrapOrThrow(passaporte)
    : ({ situacao: "inativo" } as const);
  const ativo = meuPassaporte.situacao === "ativo";

  return (
    <div className="flex flex-col gap-4 p-4 pt-[max(1rem,env(safe-area-inset-top))] lg:mx-auto lg:w-full lg:max-w-2xl lg:py-12">
      <BarraDaTela titulo="Meu Passaporte" />

      <CartaoDoPassaporte
        passaporte={meuPassaporte}
        {...(usuario ? { titular: usuario.nome } : {})}
      />

      {ativo ? (
        <EstatisticasDoPassaporte cupons={0} cidades={0} estabelecimentos={0} />
      ) : (
        <OfertaDoPassaporte
          plano={unwrapOrThrow(plano)}
          logado={usuario !== null}
        />
      )}

      <section aria-labelledby="titulo-cupons">
        <h2
          id="titulo-cupons"
          className="mb-2 text-xs font-extrabold text-foreground"
        >
          {ativo ? "Meus cupons" : "Benefícios do passaporte"}
        </h2>
        <CuponsDoPassaporte disponiveis={unwrapOrThrow(disponiveis)} />
      </section>
    </div>
  );
}
