import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";

import { CadastroDeAvaliacoes } from "@/features/curadoria";
import {
  prefetchDaAvaliacao,
  prefetchDaListaDeAvaliacoes,
} from "@/features/curadoria/servidor";
import { CabecalhoDaPagina } from "@/shared/casca/cabecalho-da-pagina";
import { estadoDesidratado } from "@/shared/consultas/cliente.servidor";

export const metadata: Metadata = { title: "Curadoria" };

/**
 * Curadoria (Editorial): visitas, notas por critério, parecer e selo. O
 * servidor adianta a lista e, com `?id=` ou `?novo=1`, o registro.
 */
export default async function PaginaDaCuradoria({
  searchParams,
}: PageProps<"/curadoria">) {
  const { id, novo } = await searchParams;
  const idAberto = typeof id === "string" ? id : null;

  await Promise.all([
    prefetchDaListaDeAvaliacoes(),
    idAberto || novo === "1" ? prefetchDaAvaliacao(idAberto) : null,
  ]);

  return (
    <>
      <CabecalhoDaPagina
        secao="Editorial"
        titulo="Curadoria"
        descricao="Avaliações independentes: notas por critério, parecer e selo. Nada aqui se compra."
      />
      <HydrationBoundary state={estadoDesidratado()}>
        <CadastroDeAvaliacoes />
      </HydrationBoundary>
    </>
  );
}
