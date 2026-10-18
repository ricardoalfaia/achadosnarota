import { Casca } from "@/shared/casca/casca";
import { exigirEquipe } from "@/shared/sessao/sessao.servidor";

/**
 * Todas as telas do painel ficam dentro da casca, e só para a equipe com o
 * autenticador ligado. A sessão e o papel são conferidos aqui e de novo em
 * cada leitura e comando no servidor; esconder um item do menu não é
 * autorização.
 */
export default async function LayoutDoPainel({ children }: LayoutProps<"/">) {
  const pessoa = await exigirEquipe();
  return <Casca pessoa={pessoa}>{children}</Casca>;
}
