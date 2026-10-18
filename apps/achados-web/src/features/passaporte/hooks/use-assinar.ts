"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppError } from "@achados/core";
import { useMutation } from "@tanstack/react-query";

import { executarAcao } from "@/shared/consultas/acao";
import { rotaDeEntrar } from "@/shared/rotas";
import { assinarPassaporte } from "../actions";
import { SESSAO_NECESSARIA_PARA_ASSINAR } from "../domain/assinatura";

/**
 * Assinar (ou renovar): pede ao servidor a sessão de checkout e leva ao
 * Checkout da Stripe. Sem conta, vai entrar e volta ao passaporte. Um comando,
 * sem cache de leitura.
 */
export function useAssinar() {
  const router = useRouter();
  const caminho = usePathname();
  const pedido = useMutation({
    mutationFn: () => executarAcao(assinarPassaporte()),
    onSuccess: ({ url }) => window.location.assign(url),
    onError: (erro) => {
      if (
        erro instanceof AppError &&
        erro.code === SESSAO_NECESSARIA_PARA_ASSINAR
      )
        router.push(rotaDeEntrar(caminho));
    },
  });
  return {
    assinar: () => pedido.mutate(),
    // Depois do sucesso, a página está indo para a Stripe: segue carregando.
    abrindo: pedido.isPending || pedido.isSuccess,
    erro:
      pedido.error instanceof AppError &&
      pedido.error.code !== SESSAO_NECESSARIA_PARA_ASSINAR
        ? pedido.error.message
        : undefined,
  };
}
