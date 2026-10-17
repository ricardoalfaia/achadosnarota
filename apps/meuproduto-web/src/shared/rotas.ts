/**
 * A rota atual é este destino ou está dentro dele? Com `exata`, só ele mesmo:
 * é o caso do início de um tenant, que é prefixo de todas as outras telas.
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

/**
 * Regra do slug de tenant (ADR-0020): minúsculas sem acento, dígitos e hífen,
 * de 2 a 63 caracteres, começando e terminando em letra ou dígito. O slug é
 * identificador operacional, não segredo, e vai para a URL: não pode conter
 * nome de cliente nem dado pessoal (quem cria o tenant escolhe o slug do
 * escritório, como "escritorio-demo").
 */
const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])$/;

export function ehSlugValido(slug: string): boolean {
  return SLUG.test(slug) && !slug.includes("--");
}

/** A base das telas de um tenant: `/t/escritorio-demo`. */
export function baseDoTenant(slug: string): string {
  return `/t/${encodeURIComponent(slug)}`;
}

/**
 * O endereço de uma tela dentro do tenant ativo: `rotaDoTenant(slug,
 * "/documentos")` → `/t/<slug>/documentos`; `"/"` é o início do tenant.
 */
export function rotaDoTenant(slug: string, caminho: string): string {
  const relativo = caminho.startsWith("/") ? caminho : `/${caminho}`;
  return relativo === "/"
    ? baseDoTenant(slug)
    : `${baseDoTenant(slug)}${relativo}`;
}

/**
 * O mesmo lugar em outro tenant, para o seletor: de `/t/a/documentos` para
 * `/t/b/documentos`. Fora das telas do tenant `atual`, leva ao início do outro.
 */
export function mesmaTelaEmOutroTenant(
  caminho: string,
  atual: string,
  outro: string
): string {
  const base = baseDoTenant(atual);
  if (caminho === base) return baseDoTenant(outro);
  if (caminho.startsWith(`${base}/`))
    return rotaDoTenant(outro, caminho.slice(base.length));
  return baseDoTenant(outro);
}
