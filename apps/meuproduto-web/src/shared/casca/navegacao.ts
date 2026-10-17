import { ehRotaAtual, rotaDoTenant } from "@/shared/rotas";

// O menu principal do sistema: o que aparece, em que ordem e para onde leva,
// como no mockup do painel (docs/produto/marca/quadro-da-marca.png). Os nomes vêm das traduções
// (`Navegacao.<id>`) e os ícones de `icones-de-navegacao.tsx`; aqui ficam só a
// estrutura e os caminhos, relativos ao tenant ativo. Os itens são planos.

export const IDS_DE_NAVEGACAO = [
  "inicio",
  "documentos",
  "modelos",
  "assinaturas",
  "clientes",
  "equipe",
  "relatorios",
  "integracoes",
  "configuracoes",
] as const;

export type IdDeNavegacao = (typeof IDS_DE_NAVEGACAO)[number];

/** Os itens que ainda não têm tela: abrem a página "Em construção". */
export type IdEmConstrucao = Exclude<IdDeNavegacao, "inicio">;

/** `caminho` é relativo ao tenant: "/" é o início dele. */
export type ItemDeNavegacao = { id: IdDeNavegacao; caminho: string };

export const NAVEGACAO: readonly ItemDeNavegacao[] = IDS_DE_NAVEGACAO.map(
  (id) => ({ id, caminho: id === "inicio" ? "/" : `/${id}` })
);

/** O endereço do item no tenant ativo. */
export function hrefDoItem(slug: string, item: ItemDeNavegacao): string {
  return rotaDoTenant(slug, item.caminho);
}

/** O início do tenant é prefixo de todas as telas: só casa com ele mesmo. */
export function ehItemAtual(
  slug: string,
  item: ItemDeNavegacao,
  caminho: string
): boolean {
  return ehRotaAtual(hrefDoItem(slug, item), caminho, {
    exata: item.caminho === "/",
  });
}

/** O item do menu em que a rota atual está, ou `undefined` fora do menu. */
export function itemDaRota(
  slug: string,
  caminho: string
): ItemDeNavegacao | undefined {
  return NAVEGACAO.find((item) => ehItemAtual(slug, item, caminho));
}
