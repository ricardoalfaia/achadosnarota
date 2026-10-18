import type { Metadata } from "next";
import { unwrapOrThrow } from "@achados/core";
import { EstadoVazio } from "@achados/ui";
import { HydrationBoundary } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";

import { IndicadoresDosAssinantes } from "@/features/assinantes/components/indicadores-dos-assinantes";
import { TelaDeAssinantes } from "@/features/assinantes/components/tela-de-assinantes";
import { lerSituacaoDoAssinante } from "@/features/assinantes/domain/assinantes";
import {
  prefetchDosAssinantes,
  resumoDosAssinantes,
} from "@/features/assinantes/servidor";
import { CabecalhoDaPagina } from "@/shared/casca/cabecalho-da-pagina";
import { estadoDesidratado } from "@/shared/consultas/cliente.servidor";
import { exigirEquipe } from "@/shared/sessao/sessao.servidor";

export const metadata: Metadata = { title: "Assinantes" };

/**
 * Assinantes (Gestão): os números do topo, a grade paginada no servidor (busca
 * por nome ou e-mail, situação do passaporte) e a ficha de cada pessoa, onde
 * a administração libera a cortesia de 7 dias. `?situacao=cortesia` abre já
 * no filtro. Só a administração; o banco confere de novo (RLS).
 */
export default async function PaginaDeAssinantes({
  searchParams,
}: PageProps<"/assinantes">) {
  const pessoa = await exigirEquipe();
  const cabecalho = (
    <CabecalhoDaPagina
      secao="Gestão"
      titulo="Assinantes"
      descricao="Passaportes, situação da assinatura e cortesias, com dados mínimos."
    />
  );
  if (pessoa.papel !== "administrador")
    return (
      <>
        {cabecalho}
        <EstadoVazio
          icone={<ShieldAlert />}
          titulo="Só a administração consulta os assinantes"
          className="py-16"
        />
      </>
    );

  const { situacao } = await searchParams;
  const situacaoInicial = lerSituacaoDoAssinante(situacao);
  const [resumo] = await Promise.all([
    resumoDosAssinantes(),
    prefetchDosAssinantes({ busca: "", situacao: situacaoInicial }),
  ]);

  return (
    <>
      {cabecalho}
      <div className="flex flex-col gap-6">
        <IndicadoresDosAssinantes resumo={unwrapOrThrow(resumo)} />
        <HydrationBoundary state={estadoDesidratado()}>
          <TelaDeAssinantes situacaoInicial={situacaoInicial} />
        </HydrationBoundary>
      </div>
    </>
  );
}
