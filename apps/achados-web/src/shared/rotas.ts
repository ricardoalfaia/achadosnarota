// Endereços do app e regras puras sobre eles. Sem React e sem Next.

export const ROTAS = {
  explorar: "/",
  favoritos: "/favoritos",
  passaporte: "/passaporte",
  perfil: "/perfil",
  balcao: "/balcao",
  entrar: "/login",
  criarConta: "/cadastro",
  recuperarSenha: "/login/esqueci-a-senha",
  offline: "/offline",
} as const;

/** A ficha pública de um lugar: `/lugar/rancho-portugues`. */
export function rotaDoLugar(slug: string): string {
  return `/lugar/${encodeURIComponent(slug)}`;
}

/**
 * O destino de volta depois de entrar só pode ser um caminho deste app:
 * começa com uma barra e não com duas (`//outro.site` é endereço externo),
 * sem barra invertida nem esquema. Qualquer outra coisa vira a página inicial,
 * para o login não servir de redirecionamento aberto.
 */
export function destinoSeguro(valor: string | null | undefined): string {
  if (
    typeof valor !== "string" ||
    valor.length === 0 ||
    valor.length > 512 ||
    !valor.startsWith("/") ||
    valor.startsWith("//") ||
    valor.includes("\\") ||
    /[\u0000-\u001f]/.test(valor)
  )
    return ROTAS.explorar;
  return valor;
}

/** O login, com o caminho para onde voltar depois: `/login?voltar=%2Ffavoritos`. */
export function rotaDeEntrar(voltar?: string): string {
  const destino = destinoSeguro(voltar);
  return destino === ROTAS.explorar
    ? ROTAS.entrar
    : `${ROTAS.entrar}?voltar=${encodeURIComponent(destino)}`;
}

/** O cadastro, levando adiante o mesmo destino de volta. */
export function rotaDeCriarConta(voltar?: string): string {
  const destino = destinoSeguro(voltar);
  return destino === ROTAS.explorar
    ? ROTAS.criarConta
    : `${ROTAS.criarConta}?voltar=${encodeURIComponent(destino)}`;
}

/**
 * A rota atual é este destino ou está dentro dele? A raiz só casa com ela
 * mesma; com `exata`, nenhum destino casa com o que está dentro dele.
 */
export function ehRotaAtual(
  href: string | undefined,
  caminho: string,
  { exata = false }: { exata?: boolean } = {}
): boolean {
  if (!href) return false;
  if (exata || href === "/") return caminho === href;
  return caminho === href || caminho.startsWith(`${href}/`);
}
