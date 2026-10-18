import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";

import { CadastroDePromocoes } from "@/features/promocoes";
import {
  prefetchDaListaDePromocoes,
  prefetchDaPromocao,
} from "@/features/promocoes/servidor";
import { CabecalhoDaPagina } from "@/shared/casca/cabecalho-da-pagina";
import { estadoDesidratado } from "@/shared/consultas/cliente.servidor";

export const metadata: Metadata = { title: "Promoções" };

/**
 * Promoções (Comercial). O servidor adianta a lista e, com `?id=` ou
 * `?novo=1`, o registro e as casas do campo; o navegador segue pelo Query.
 */
export default async function PaginaDePromocoes({
  searchParams,
}: PageProps<"/promocoes">) {
  const { id, novo } = await searchParams;
  const idAberto = typeof id === "string" ? id : null;

  await Promise.all([
    prefetchDaListaDePromocoes(),
    idAberto || novo === "1" ? prefetchDaPromocao(idAberto) : null,
  ]);

  return (
    <>
      <CabecalhoDaPagina
        secao="Comercial"
        titulo="Promoções"
        descricao="Benefícios que as casas oferecem aos assinantes, com regras explícitas antes do resgate."
      />
      <HydrationBoundary state={estadoDesidratado()}>
        <CadastroDePromocoes />
      </HydrationBoundary>
    </>
  );
}
