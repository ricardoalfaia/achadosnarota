"use client";

import type { ReactNode } from "react";
import { Aba, Abas, ListaDeAbas, PainelDaAba } from "@achados/ui";

import type { AbaDaFicha } from "../domain/abas";

/**
 * As abas da ficha: Cupons, Avaliações, Fotos e Sobre. O conteúdo de cada uma
 * vem pronto do servidor; aqui só se alterna. A aba inicial vem da URL, para o
 * "N fotos" do topo abrir direto nas fotos. `manterEstado` usa o `<Activity>`
 * do React 19.2: a aba já visitada fica viva escondida (a galeria não recarrega
 * as fotos nem perde a rolagem ao voltar).
 */
export function AbasDaFicha({
  inicial,
  cupons,
  avaliacoes,
  fotos,
  sobre,
}: {
  inicial: AbaDaFicha;
  cupons: ReactNode;
  avaliacoes: ReactNode;
  fotos: ReactNode;
  sobre: ReactNode;
}) {
  return (
    <Abas<AbaDaFicha>
      key={inicial}
      valorInicial={inicial}
      variante="linha"
      manterEstado
    >
      <ListaDeAbas rotulo="Informações do lugar">
        <Aba valor="cupons">Cupons</Aba>
        <Aba valor="avaliacoes">Avaliações</Aba>
        <Aba valor="fotos">Fotos</Aba>
        <Aba valor="sobre">Sobre</Aba>
      </ListaDeAbas>
      <PainelDaAba valor="cupons">{cupons}</PainelDaAba>
      <PainelDaAba valor="avaliacoes">{avaliacoes}</PainelDaAba>
      <PainelDaAba valor="fotos">{fotos}</PainelDaAba>
      <PainelDaAba valor="sobre">{sobre}</PainelDaAba>
    </Abas>
  );
}
