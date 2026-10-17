import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Ok, unwrapOrThrow, type AppError, type Result } from "@achados/core";

import { auth, type SessaoDoAuth } from "@/shared/auth/auth.servidor";
import { chamarAuth } from "@/shared/auth/chamar.servidor";
import { pendenciasDaConta, type Pendencia } from "@/shared/auth/regras";
import { rotaDeEntrar, ROTAS } from "@/shared/rotas";
import type { UsuarioDaSessao } from "./sessao";

// A camada de acesso à sessão (ADR-0020). O app é público: explorar e ver um
// lugar não pedem conta. As telas e Actions que usam dado da pessoa
// (favoritos, passaporte, perfil) chamam `exigirSessao` ou `sessaoLiberada`
// no servidor, a cada pedido.

export const ROTA_DE_LOGIN = ROTAS.entrar;

/**
 * A sessão do Better Auth de quem fez o pedido, lida no banco (sem
 * cookieCache), uma vez por pedido. `Err` só quando o banco falha.
 */
export const lerSessao = cache(
  async (): Promise<Result<SessaoDoAuth | null, AppError>> => {
    const pedido = await headers();
    return chamarAuth("getSession", () =>
      auth().api.getSession({ headers: pedido })
    );
  }
);

export function usuarioDaSessao(sessao: SessaoDoAuth): UsuarioDaSessao {
  return {
    id: sessao.user.id,
    nome: sessao.user.name,
    email: sessao.user.email,
    foto: sessao.user.image ?? undefined,
    criadoEm: sessao.user.createdAt,
  };
}

/** O que ainda falta para a conta usar o app (troca de senha). */
export function pendenciasDe(sessao: SessaoDoAuth): Pendencia[] {
  return pendenciasDaConta({
    mustChangePassword: sessao.user.mustChangePassword === true,
    twoFactorEnabled: sessao.user.twoFactorEnabled === true,
    // Assinante não precisa de segundo fator (docs/produto/04 pede MFA para
    // administradores e curadores, que ainda não existem no app).
    exigeMfa: false,
  });
}

/**
 * Quem está usando o app, se entrou e não tem pendência; senão `null`.
 * Para telas públicas que mudam com a sessão (cabeçalho, ficha do lugar).
 * Falha de banco vira exceção (vai ao error.tsx).
 */
export const sessaoLiberada = cache(
  async (): Promise<UsuarioDaSessao | null> => {
    const sessao = unwrapOrThrow(await lerSessao());
    if (!sessao || pendenciasDe(sessao).length > 0) return null;
    return usuarioDaSessao(sessao);
  }
);

/**
 * Quem está usando o app, para o layout raiz montar o cache do navegador.
 * Diferente de `sessaoLiberada`, falha de banco aqui vira "sem sessão": o
 * layout não derruba o app inteiro; a tela que precisa da sessão trata.
 */
export const pessoaDoPedido = cache(
  async (): Promise<UsuarioDaSessao | null> => {
    const sessao = await lerSessao();
    if (!sessao.ok || !sessao.value || pendenciasDe(sessao.value).length > 0)
      return null;
    return usuarioDaSessao(sessao.value);
  }
);

/**
 * A pessoa logada, para telas e Actions que só existem com conta. Sem sessão
 * (ou com troca de senha pendente), vai ao login e volta para `destino`.
 */
export async function exigirSessao(destino?: string): Promise<UsuarioDaSessao> {
  const usuario = await sessaoLiberada();
  if (!usuario) redirect(rotaDeEntrar(destino));
  return usuario;
}

/** Variante sem redirecionar, para Actions que devolvem Result. */
export async function sessaoDaAcao(): Promise<
  Result<UsuarioDaSessao | null, AppError>
> {
  const sessao = await lerSessao();
  if (!sessao.ok) return sessao;
  if (!sessao.value || pendenciasDe(sessao.value).length > 0) return Ok(null);
  return Ok(usuarioDaSessao(sessao.value));
}
