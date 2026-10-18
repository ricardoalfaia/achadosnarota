import { Casca } from "@/shared/casca/casca";
import { PESSOA_PROVISORIA } from "@/shared/sessao/sessao";

/**
 * Todas as telas do painel ficam dentro da casca. Quando houver login da
 * equipe (ADR-0020), a sessão é conferida aqui e de novo em cada leitura e
 * comando no servidor: esconder um item do menu não é autorização.
 */
export default function LayoutDoPainel({ children }: LayoutProps<"/">) {
  return <Casca pessoa={PESSOA_PROVISORIA}>{children}</Casca>;
}
