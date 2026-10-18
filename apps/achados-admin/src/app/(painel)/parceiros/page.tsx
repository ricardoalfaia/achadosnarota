import type { Metadata } from "next";
import { unwrapOrThrow } from "@achados/core";
import { EstadoVazio } from "@achados/ui";
import { ShieldAlert } from "lucide-react";

import { BalcaoDasCasas } from "@/features/operadores/components/balcao-das-casas";
import { IndicadoresDoBalcao } from "@/features/operadores/components/indicadores-do-balcao";
import { casasComOperadores } from "@/features/operadores/consultas.servidor";
import {
  resumoDoBalcao,
  SITUACOES_DO_BALCAO,
} from "@/features/operadores/domain/balcao";
import { lerSituacao } from "@/shared/cadastro/filtro";
import { CabecalhoDaPagina } from "@/shared/casca/cabecalho-da-pagina";
import { podeEscrever } from "@/shared/sessao/sessao";
import { exigirEquipe } from "@/shared/sessao/sessao.servidor";

export const metadata: Metadata = { title: "Parceiros" };

/**
 * Parceiros (Comercial): por enquanto, os operadores do balcão de cada casa,
 * que validam o código de resgate no app. Os números do topo, a grade com
 * busca e filtro e o balcão de cada casa numa janela. `?status=sem` abre já
 * nas casas sem operador. Só a administração vincula; o banco confere de
 * novo (RLS).
 */
export default async function PaginaDeParceiros({
  searchParams,
}: PageProps<"/parceiros">) {
  const pessoa = await exigirEquipe();
  const cabecalho = (
    <CabecalhoDaPagina
      secao="Comercial"
      titulo="Parceiros"
      descricao="Quem opera o balcão de cada casa e valida o código de resgate do cliente."
    />
  );
  if (!podeEscrever(pessoa, "operadores")) {
    return (
      <>
        {cabecalho}
        <EstadoVazio
          icone={<ShieldAlert />}
          titulo="Só a administração gerencia os operadores"
          className="py-16"
        />
      </>
    );
  }

  const { status } = await searchParams;
  const casas = unwrapOrThrow(await casasComOperadores());
  return (
    <>
      {cabecalho}
      <div className="flex flex-col gap-6">
        <IndicadoresDoBalcao resumo={resumoDoBalcao(casas)} />
        <BalcaoDasCasas
          casas={casas}
          situacaoInicial={lerSituacao(status, SITUACOES_DO_BALCAO)}
        />
      </div>
    </>
  );
}
