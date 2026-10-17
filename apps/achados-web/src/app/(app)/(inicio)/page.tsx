import { unwrapOrThrow } from "@achados/core";
import { HydrationBoundary } from "@tanstack/react-query";

import { lerFiltro } from "@/features/catalogo";
import {
  lerVitrine,
  listarCategorias,
  listarCidades,
  prefetchDosLugares,
} from "@/features/catalogo/servidor";
import { prefetchDosFavoritos } from "@/features/favoritos/servidor";
import { CartaoPromocionalDoPassaporte } from "@/features/passaporte";
import { lerPlanoAtivo } from "@/features/passaporte/servidor";
import { ChamadaDoPassaporte, PorQueUsar } from "@/features/vitrine";
import { CabecalhoDoApp } from "@/shared/casca/cabecalho-do-app";
import { estadoDesidratado } from "@/shared/consultas/cliente.servidor";
import { pessoaDaSessao } from "@/shared/sessao/sessao";
import { sessaoLiberada } from "@/shared/sessao/sessao.servidor";
import { Exploracao } from "./exploracao";

/**
 * Explorar: a tela inicial. O servidor lê categorias, cidades, a vitrine do
 * topo desktop e o plano, e já busca os lugares do filtro da URL e os
 * favoritos de quem entrou, em paralelo; o navegador recebe tudo hidratado e
 * segue pelo cache do Query.
 */
export default async function Explorar({ searchParams }: PageProps<"/">) {
  const filtro = lerFiltro(await searchParams);
  const [usuario, categorias, cidades, vitrine, plano] = await Promise.all([
    sessaoLiberada(),
    listarCategorias(),
    listarCidades(),
    lerVitrine(),
    lerPlanoAtivo(),
    prefetchDosLugares(filtro),
    prefetchDosFavoritos(),
  ]);

  return (
    <>
      <CabecalhoDoApp pessoa={usuario ? pessoaDaSessao(usuario) : null} />
      <HydrationBoundary state={estadoDesidratado()}>
        <Exploracao
          categorias={unwrapOrThrow(categorias)}
          cidades={unwrapOrThrow(cidades)}
          vitrine={unwrapOrThrow(vitrine)}
          plano={unwrapOrThrow(plano)}
        />
      </HydrationBoundary>
      <div className="hidden lg:block">
        <PorQueUsar />
        <ChamadaDoPassaporte
          cartao={<CartaoPromocionalDoPassaporte inclinacao="forte" />}
        />
      </div>
    </>
  );
}
