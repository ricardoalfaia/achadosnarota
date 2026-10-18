import { AppErrors, Err, Ok, type Result } from "@achados/core";

// PROVISÓRIO (fase visual do painel). As telas leem de uma fonte em memória
// com dados sintéticos, atrás de funções que devolvem Result, para a troca
// pelo @achados/db não mudar hooks nem componentes (ADR-0018, ADR-0021).
// Nada de estabelecimento, nota ou promoção fictícios fora do
// desenvolvimento (README de produto, princípio 6): fora do ambiente local
// a fonte recusa.

export const DADOS_PROVISORIOS_RECUSADOS = "DADOS_PROVISORIOS_RECUSADOS";

type Ambiente = { appEnv: string | undefined; nodeEnv: string | undefined };

/**
 * O ambiente pode ver dados sintéticos? Só o desenvolvimento: `APP_ENV=local`
 * ou, sem `APP_ENV`, o `next dev`. Um build de produção sem `APP_ENV` recusa.
 */
export function permiteDadosProvisorios({
  appEnv,
  nodeEnv,
}: Ambiente): boolean {
  if (appEnv !== undefined) return appEnv === "local";
  return nodeEnv !== "production";
}

export function guardaDosDadosProvisorios(
  ambiente: Ambiente = {
    appEnv: process.env.APP_ENV,
    nodeEnv: process.env.NODE_ENV,
  }
): Result<void> {
  return permiteDadosProvisorios(ambiente)
    ? Ok(undefined)
    : Err(
        AppErrors.security(
          DADOS_PROVISORIOS_RECUSADOS,
          "O painel ainda não está ligado ao banco neste ambiente."
        )
      );
}
