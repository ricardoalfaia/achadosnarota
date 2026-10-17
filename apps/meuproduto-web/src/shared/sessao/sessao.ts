// Tipos da sessão e o recorte que chega ao navegador. Sem import de servidor:
// a leitura da sessão e do tenant está em `sessao.servidor.ts` e
// `tenant.servidor.ts`.

export type PapelNoTenant = "owner" | "admin" | "member" | "viewer";

/**
 * Quem está usando o sistema, como a casca precisa mostrar. É o que chega ao
 * navegador: sem token, sem id de usuário e sem id de tenant.
 */
export type Sessao = {
  nome: string;
  email: string;
  /** A organização dona do tenant ativo. */
  organizacao: { nome: string };
  /** O tenant (espaço de trabalho) ativo, com o papel de quem entrou nele. */
  tenant: TenantDaSessao;
  /** Foto de quem entrou; sem ela, o avatar mostra as iniciais. */
  fotoUrl?: string;
};

export type TenantDaSessao = {
  nome: string;
  slug: string;
  papel: PapelNoTenant;
};

/** Um tenant da lista do seletor: só o que a tela mostra e o endereço. */
export type TenantDaLista = { nome: string; slug: string };

/** Quem está logado, como o servidor usa. O id nunca vai para a interface. */
export type UsuarioDaSessao = {
  id: string;
  nome: string;
  email: string;
  foto?: string | undefined;
};

/** Um vínculo de quem está logado com um tenant ativo. */
export type Vinculo = {
  tenantId: string;
  slug: string;
  nome: string;
  papel: PapelNoTenant;
  organizacao: { nome: string };
};

/**
 * O contexto autorizado de uma requisição dentro de `/t/[slug]`: a pessoa, o
 * tenant (com o id, para `withTenant`) e o papel dela nele. Só servidor.
 */
export type ContextoDoTenant = {
  usuario: UsuarioDaSessao;
  tenant: { id: string; slug: string; nome: string };
  papel: PapelNoTenant;
  organizacao: { nome: string };
};

/** O recorte seguro para a interface: sem token e sem identificadores internos. */
export function sessaoDoCliente(contexto: ContextoDoTenant): Sessao {
  return {
    nome: contexto.usuario.nome,
    email: contexto.usuario.email,
    organizacao: { nome: contexto.organizacao.nome },
    tenant: {
      nome: contexto.tenant.nome,
      slug: contexto.tenant.slug,
      papel: contexto.papel,
    },
    ...(contexto.usuario.foto ? { fotoUrl: contexto.usuario.foto } : {}),
  };
}

/** Os tenants para o seletor, sem ids. */
export function tenantsDaLista(vinculos: readonly Vinculo[]): TenantDaLista[] {
  return vinculos.map(({ nome, slug }) => ({ nome, slug }));
}

/** "Ana Souza" → "Ana", para a saudação do painel. */
export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? "";
}
