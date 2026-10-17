// Regras puras da autenticação: limites, papéis que exigem MFA e a tradução
// das recusas do Better Auth para os códigos que a interface mostra. Sem
// import de servidor: testadas sem banco.

import type { PapelNoTenant } from "@/shared/sessao/sessao";

/** Sessão de 12h; renovada (mais 12h) quando usada depois de 1h. */
export const SESSAO = {
  expiraEmSegundos: 12 * 60 * 60,
  renovaDepoisDeSegundos: 60 * 60,
} as const;

export const TAMANHO_MINIMO_DA_SENHA = 10;
export const VALIDADE_DO_LINK_DE_REDEFINICAO_EM_SEGUNDOS = 60 * 60;

/**
 * Rate limit do Better Auth por IP e rota, gravado no banco (vale entre
 * instâncias). Só alcança quem chama `/api/auth/*` por HTTP: as Actions do
 * app chamam `auth.api.*` direto, sem passar pelo roteador, e por isso têm o
 * limite próprio de `limite.servidor.ts`, por conta e por IP.
 */
export const LIMITES_DO_AUTH = {
  "/sign-in/email": { window: 15 * 60, max: 10 },
  "/sign-up/email": { window: 60 * 60, max: 5 },
  "/two-factor/*": { window: 5 * 60, max: 15 },
  "/request-password-reset": { window: 15 * 60, max: 5 },
  "/reset-password": { window: 15 * 60, max: 10 },
  "/change-password": { window: 15 * 60, max: 10 },
} as const;

/** Papéis que precisam de segundo fator ativo para usar o sistema (documento 04). */
export const PAPEIS_QUE_EXIGEM_MFA: ReadonlySet<PapelNoTenant> = new Set([
  "owner",
  "admin",
]);

export function exigeMfa(papeis: readonly PapelNoTenant[]): boolean {
  return papeis.some((papel) => PAPEIS_QUE_EXIGEM_MFA.has(papel));
}

/** O que falta para a conta usar o sistema, na ordem em que é pedido. */
export type Pendencia = "trocaDeSenha" | "configurarDoisFatores";

export type EstadoDaConta = {
  mustChangePassword: boolean;
  twoFactorEnabled: boolean;
  /** Os papéis da pessoa em todos os tenants a que tem acesso. */
  papeis: readonly PapelNoTenant[];
};

/**
 * A troca obrigatória vem antes do autenticador: configurar o 2FA pede a
 * senha, e ela deve ser a definitiva.
 */
export function pendenciasDaConta(conta: EstadoDaConta): Pendencia[] {
  return [
    ...(conta.mustChangePassword ? (["trocaDeSenha"] as const) : []),
    ...(!conta.twoFactorEnabled && exigeMfa(conta.papeis)
      ? (["configurarDoisFatores"] as const)
      : []),
  ];
}

/** Como uma recusa do Better Auth chega aqui: status HTTP e o código do corpo. */
export type RecusaDoAuth = { status: number; codigo?: string | undefined };

export type MotivoDaRecusa =
  | "credenciaisInvalidas"
  | "codigoIncorreto"
  | "muitasTentativas"
  | "etapaExpirada"
  | "senhaIncorreta"
  | "senhaCurta"
  | "senhaLonga"
  | "linkInvalido"
  | "cadastroFechado"
  | "recusado";

const POR_CODIGO: Record<string, MotivoDaRecusa> = {
  INVALID_EMAIL_OR_PASSWORD: "credenciaisInvalidas",
  INVALID_EMAIL: "credenciaisInvalidas",
  INVALID_CODE: "codigoIncorreto",
  INVALID_BACKUP_CODE: "codigoIncorreto",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "muitasTentativas",
  ACCOUNT_TEMPORARILY_LOCKED: "muitasTentativas",
  INVALID_TWO_FACTOR_COOKIE: "etapaExpirada",
  TOTP_NOT_ENABLED: "etapaExpirada",
  INVALID_PASSWORD: "senhaIncorreta",
  PASSWORD_TOO_SHORT: "senhaCurta",
  PASSWORD_TOO_LONG: "senhaLonga",
  INVALID_TOKEN: "linkInvalido",
  TOKEN_EXPIRED: "linkInvalido",
  CADASTRO_FECHADO: "cadastroFechado",
};

/** A recusa como motivo que a tela traduz. Sem detalhes do Better Auth na tela. */
export function motivoDaRecusa(recusa: RecusaDoAuth): MotivoDaRecusa {
  if (recusa.status === 429) return "muitasTentativas";
  return (recusa.codigo && POR_CODIGO[recusa.codigo]) || "recusado";
}
