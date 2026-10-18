"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppError } from "@achados/core";
import { useNow } from "@achados/ui/hooks";
import { useMutation } from "@tanstack/react-query";

import { executarAcao } from "@/shared/consultas/acao";
import { rotaDeEntrar } from "@/shared/rotas";
import { gerarCodigoDoBeneficio } from "../actions";
import {
  dataDaRenovacao,
  segundosRestantes,
  SESSAO_NECESSARIA_PARA_USAR,
} from "../domain/codigo";

/** O que a janela mostra depois de pedir o código. */
export type EstadoDoCodigo =
  | { etapa: "pedir" }
  | { etapa: "gerando" }
  | { etapa: "codigo"; codigo: string; segundos: number }
  | { etapa: "expirou" }
  | { etapa: "usado"; renovaEm?: string }
  | { etapa: "erro"; mensagem: string };

/**
 * Pede o código de um benefício e acompanha a validade dele (um comando, não
 * dado em cache: useMutation sem cache de leitura). O código só existe na
 * memória desta tela. Sessão vencida leva ao login e volta para a ficha.
 */
export function useCodigoDoBeneficio(beneficioId: string) {
  const router = useRouter();
  const caminho = usePathname();
  const pedido = useMutation({
    mutationFn: () => executarAcao(gerarCodigoDoBeneficio(beneficioId)),
    onError: (erro) => {
      if (erro instanceof AppError && erro.code === SESSAO_NECESSARIA_PARA_USAR)
        router.push(rotaDeEntrar(caminho));
    },
  });
  // O relógio começa no primeiro desenho e anda de segundo em segundo.
  const [inicio] = useState(() => Date.now());
  const agora = useNow(inicio, 1000);

  let estado: EstadoDoCodigo = { etapa: "pedir" };
  if (pedido.isPending) estado = { etapa: "gerando" };
  else if (pedido.data) {
    const segundos = segundosRestantes(pedido.data.expiraEm, agora);
    estado =
      segundos > 0
        ? { etapa: "codigo", codigo: pedido.data.codigo, segundos }
        : { etapa: "expirou" };
  } else if (pedido.error) {
    const erro = pedido.error;
    if (erro instanceof AppError && erro.code === "RESGATE_LIMITE_ATINGIDO") {
      const renova = erro.details?.renovaEm;
      estado = {
        etapa: "usado",
        ...(typeof renova === "string"
          ? { renovaEm: dataDaRenovacao(renova) }
          : {}),
      };
    } else {
      estado = {
        etapa: "erro",
        mensagem:
          erro instanceof AppError
            ? erro.message
            : "Não foi possível gerar o código agora.",
      };
    }
  }

  return {
    estado,
    gerar: () => pedido.mutate(),
    /** Ao fechar a janela: o código some da memória. */
    descartar: () => pedido.reset(),
  };
}
