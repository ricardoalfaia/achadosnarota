// Endereços do painel e regras puras sobre eles. Sem React e sem Next.

export const ROTAS = {
  inicio: "/",
  casas: "/casas",
  curadoria: "/curadoria",
  promocoes: "/promocoes",
  parceiros: "/parceiros",
  resgates: "/resgates",
  assinantes: "/assinantes",
  configuracoes: "/configuracoes",
} as const;

/**
 * O registro aberto fica no endereço por identificador opaco (ADR-0021):
 * `?id=<ulid>` edita e `?novo=1` inclui. Nunca nome, CNPJ ou outro dado no
 * endereço; o servidor lê o registro pelo `id` e um `id` desconhecido
 * responde como não encontrado.
 */
export function rotaDoRegistro(
  base: string,
  registro: { id: string } | "novo"
): string {
  return registro === "novo"
    ? `${base}?novo=1`
    : `${base}?id=${encodeURIComponent(registro.id)}`;
}

/**
 * A rota atual está dentro do item? O início ("/") só casa com ele mesmo,
 * porque é prefixo de todas as telas.
 */
export function ehRotaAtual(href: string, caminho: string): boolean {
  if (href === "/") return caminho === "/";
  return caminho === href || caminho.startsWith(`${href}/`);
}
