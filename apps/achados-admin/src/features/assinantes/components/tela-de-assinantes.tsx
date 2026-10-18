"use client";

import { useState } from "react";
import { Dialogo } from "@achados/ui";
import { UserRound } from "lucide-react";

import type { AssinanteDaLista, FiltroDeSituacao } from "../domain/assinantes";
import { FichaDoAssinante } from "./ficha-do-assinante";
import { ListagemDeAssinantes } from "./listagem-de-assinantes";

/** A listagem e a ficha da pessoa escolhida, numa janela. */
export function TelaDeAssinantes({
  situacaoInicial,
}: {
  situacaoInicial: FiltroDeSituacao;
}) {
  const [aberto, setAberto] = useState<AssinanteDaLista>();

  return (
    <>
      <ListagemDeAssinantes
        situacaoInicial={situacaoInicial}
        aoAbrir={setAberto}
      />
      <Dialogo
        aberto={Boolean(aberto)}
        aoFechar={() => setAberto(undefined)}
        titulo={aberto?.nome ?? ""}
        descricao="Dados mínimos da conta. A abertura desta ficha fica registrada."
        variante="destaque"
        icone={<UserRound />}
        tamanho="md"
      >
        {aberto && <FichaDoAssinante id={aberto.id} />}
      </Dialogo>
    </>
  );
}
