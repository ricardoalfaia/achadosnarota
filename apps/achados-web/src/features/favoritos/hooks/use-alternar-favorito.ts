"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppError } from "@achados/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { executarAcao } from "@/shared/consultas/acao";
import { rotaDeEntrar } from "@/shared/rotas";
import { alternarFavorito } from "../actions";
import { chaveDosFavoritos } from "../consultas/favoritos";
import { listaComPedido } from "../domain/lista";
import { SESSAO_NECESSARIA } from "../domain/pedido";

type Pedido = { slug: string; favoritar: boolean };

/**
 * Salvar ou tirar um favorito: o único coordenador da operação (ADR-0006,
 * seção 7). Marca na hora no cache, chama a Action, desfaz se ela recusar e,
 * no fim, pede a lista de novo para conferir com o servidor. Sessão vencida
 * leva ao login e volta para a mesma tela.
 */
export function useAlternarFavorito(escopo: string) {
  const cliente = useQueryClient();
  const router = useRouter();
  const caminho = usePathname();
  const chave = chaveDosFavoritos(escopo);

  return useMutation({
    mutationFn: (pedido: Pedido) =>
      executarAcao(alternarFavorito(pedido.slug, pedido.favoritar)),
    onMutate: async (pedido) => {
      await cliente.cancelQueries({ queryKey: chave });
      const anterior = cliente.getQueryData<string[]>(chave);
      cliente.setQueryData<string[]>(chave, (slugs) =>
        listaComPedido(slugs, pedido)
      );
      return { anterior };
    },
    onError: (erro, _pedido, contexto) => {
      cliente.setQueryData(chave, contexto?.anterior);
      if (erro instanceof AppError && erro.code === SESSAO_NECESSARIA)
        router.push(rotaDeEntrar(caminho));
    },
    onSettled: () => cliente.invalidateQueries({ queryKey: chave }),
  });
}
