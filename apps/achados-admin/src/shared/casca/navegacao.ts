import { ehRotaAtual, ROTAS } from "@/shared/rotas";

// O menu do painel como dado: o que aparece, em que ordem e para onde leva.
// Sem React: os ícones ficam em `icones-da-navegacao.tsx`. As seções separam
// o editorial do comercial também na tela (ADR-004 de produto): casa e
// curadoria de um lado; promoção, parceiro e resgate do outro.

export type IdDeNavegacao = keyof typeof ROTAS;

export type ItemDeNavegacao = {
  id: IdDeNavegacao;
  rotulo: string;
  href: string;
  /** Ainda sem tela: abre a página "em construção", sem fingir que existe. */
  emConstrucao?: boolean;
};

export type SecaoDeNavegacao = {
  id: string;
  /** Ausente: os itens ficam soltos no topo (o início). */
  titulo?: string;
  itens: readonly ItemDeNavegacao[];
};

export const NAVEGACAO: readonly SecaoDeNavegacao[] = [
  {
    id: "geral",
    itens: [{ id: "inicio", rotulo: "Início", href: ROTAS.inicio }],
  },
  {
    id: "editorial",
    titulo: "Editorial",
    itens: [
      { id: "casas", rotulo: "Casas", href: ROTAS.casas },
      { id: "curadoria", rotulo: "Curadoria", href: ROTAS.curadoria },
    ],
  },
  {
    id: "comercial",
    titulo: "Comercial",
    itens: [
      { id: "promocoes", rotulo: "Promoções", href: ROTAS.promocoes },
      {
        id: "parceiros",
        rotulo: "Parceiros",
        href: ROTAS.parceiros,
      },
      {
        id: "resgates",
        rotulo: "Resgates",
        href: ROTAS.resgates,
        emConstrucao: true,
      },
    ],
  },
  {
    id: "gestao",
    titulo: "Gestão",
    itens: [
      {
        id: "assinantes",
        rotulo: "Assinantes",
        href: ROTAS.assinantes,
        emConstrucao: true,
      },
      {
        id: "configuracoes",
        rotulo: "Configurações",
        href: ROTAS.configuracoes,
        emConstrucao: true,
      },
    ],
  },
];

const ITENS = NAVEGACAO.flatMap((secao) => secao.itens);

/** O item do menu em que a rota atual está, ou `undefined` fora do menu. */
export function itemDaRota(caminho: string): ItemDeNavegacao | undefined {
  return ITENS.find((item) => ehRotaAtual(item.href, caminho));
}

/** O item pelo id, para as páginas montarem título e trilha. */
export function itemDeNavegacao(id: IdDeNavegacao): ItemDeNavegacao {
  const item = ITENS.find((candidato) => candidato.id === id);
  if (!item) throw new Error(`Item de navegação desconhecido: ${id}`);
  return item;
}
