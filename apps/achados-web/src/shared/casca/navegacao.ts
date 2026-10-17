import { ehRotaAtual, ROTAS } from "@/shared/rotas";

// Os itens da barra inferior e qual está ativo. Puro: testado sem render.

export type ItemDaNavegacao = {
  chave: "explorar" | "favoritos" | "passaporte" | "perfil";
  rotulo: string;
  href: string;
};

/** Na ordem da barra; o leitor fica no meio, entre Favoritos e Passaporte. */
export const ITENS_DA_NAVEGACAO: readonly ItemDaNavegacao[] = [
  { chave: "explorar", rotulo: "Explorar", href: ROTAS.explorar },
  { chave: "favoritos", rotulo: "Favoritos", href: ROTAS.favoritos },
  { chave: "passaporte", rotulo: "Passaporte", href: ROTAS.passaporte },
  { chave: "perfil", rotulo: "Perfil", href: ROTAS.perfil },
];

/**
 * O item ativo para o caminho atual. A ficha de um lugar pertence a Explorar:
 * é de lá que se chega a ela.
 */
export function itemAtivo(caminho: string): ItemDaNavegacao["chave"] | null {
  if (caminho.startsWith("/lugar/")) return "explorar";
  return (
    ITENS_DA_NAVEGACAO.find((item) => ehRotaAtual(item.href, caminho))?.chave ??
    null
  );
}
