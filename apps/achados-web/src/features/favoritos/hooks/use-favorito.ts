"use client";

import { usePathname, useRouter } from "next/navigation";

import { rotaDeEntrar } from "@/shared/rotas";
import { useAlternarFavorito } from "./use-alternar-favorito";
import { useFavoritos } from "./use-favoritos";

/**
 * Tudo o que o coração de um lugar precisa: se está salvo, como alternar e se
 * a última tentativa falhou. Sem conta, alternar leva ao login.
 */
export function useFavorito(slug: string) {
  const { logado, escopo, ehFavorito } = useFavoritos();
  const mutacao = useAlternarFavorito(escopo);
  const router = useRouter();
  const caminho = usePathname();
  const favorito = ehFavorito(slug);

  return {
    favorito,
    falhou: mutacao.isError && mutacao.variables?.slug === slug,
    alternar: () => {
      if (!logado) {
        router.push(rotaDeEntrar(caminho));
        return;
      }
      mutacao.mutate({ slug, favoritar: !favorito });
    },
  };
}
