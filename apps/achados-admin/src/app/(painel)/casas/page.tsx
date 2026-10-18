import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";

import { CadastroDeCasas } from "@/features/casas";
import {
  prefetchDaCasa,
  prefetchDaListaDeCasas,
  prefetchDoCatalogo,
} from "@/features/casas/servidor";
import { CabecalhoDaPagina } from "@/shared/casca/cabecalho-da-pagina";
import { estadoDesidratado } from "@/shared/consultas/cliente.servidor";

export const metadata: Metadata = { title: "Casas" };

/**
 * Casas (Editorial). O servidor adianta a lista e, com `?id=` ou `?novo=1`,
 * o registro e as opções do formulário; o navegador continua pelo Query
 * hidratado. O id da URL não é autorização: a leitura confere no servidor.
 */
export default async function PaginaDeCasas({
  searchParams,
}: PageProps<"/casas">) {
  const { id, novo } = await searchParams;
  const idAberto = typeof id === "string" ? id : undefined;

  await Promise.all([
    prefetchDaListaDeCasas(),
    idAberto ? prefetchDaCasa(idAberto) : null,
    novo === "1" ? prefetchDoCatalogo() : null,
  ]);

  return (
    <>
      <CabecalhoDaPagina
        secao="Editorial"
        titulo="Casas"
        descricao="Restaurantes, cafés, bares e pousadas do catálogo: dados de descoberta, fotos e publicação."
      />
      <HydrationBoundary state={estadoDesidratado()}>
        <CadastroDeCasas />
      </HydrationBoundary>
    </>
  );
}
