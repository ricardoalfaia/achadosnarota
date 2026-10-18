"use client";

import { useState, type FormEvent } from "react";
import { AppError } from "@achados/core";
import { useMutation } from "@tanstack/react-query";

import { executarAcao } from "@/shared/consultas/acao";
import { validarCodigoNoBalcao } from "../actions";
import { codigoCompleto, limparCodigo } from "../domain/codigo-digitado";

/**
 * O balcão: a casa escolhida, o código digitado (limpo a cada tecla) e a
 * confirmação no servidor. Um comando, sem cache de leitura. Depois de um
 * resultado, digitar de novo recomeça.
 */
export function useBalcao(casas: readonly { id: string }[]) {
  const [casaId, setCasaId] = useState(casas[0]?.id ?? "");
  const [codigo, setCodigo] = useState("");
  const validacao = useMutation({
    mutationFn: (pedido: { codigo: string; casaId: string }) =>
      executarAcao(validarCodigoNoBalcao(pedido.codigo, pedido.casaId)),
  });

  const erro = validacao.error;
  return {
    casaId,
    escolherCasa: (id: string) => {
      setCasaId(id);
      validacao.reset();
    },
    codigo,
    aoDigitar: (valor: string) => {
      setCodigo(limparCodigo(valor));
      if (validacao.isSuccess || validacao.isError) validacao.reset();
    },
    podeValidar: codigoCompleto(codigo) && !validacao.isPending,
    validando: validacao.isPending,
    aoEnviar: (evento: FormEvent<HTMLFormElement>) => {
      evento.preventDefault();
      if (!codigoCompleto(codigo) || validacao.isPending) return;
      validacao.mutate({ codigo, casaId });
    },
    confirmado: validacao.data,
    recusa: erro
      ? erro instanceof AppError
        ? erro.message
        : "Não foi possível validar agora. Tente de novo."
      : undefined,
    proximo: () => {
      setCodigo("");
      validacao.reset();
    },
  };
}
