import "server-only";

import { unwrapOrThrow } from "@achados/core";

import { lerAmbienteServidor, type AmbienteServidor } from "./ambiente";

let lido: AmbienteServidor | undefined;

/**
 * As variáveis do servidor, validadas na primeira leitura. Configuração
 * inválida interrompe a subida (`src/instrumentation.ts` chama esta função
 * antes da primeira requisição): não há recuperação para o usuário.
 *
 * É uma função, e não uma constante do módulo, porque o `next build` importa
 * os módulos das rotas ao coletar dados das páginas. Com a leitura no import,
 * o build da CI (sem segredos) quebraria sem que nenhuma requisição existisse.
 */
export function ambienteServidor(): AmbienteServidor {
  lido ??= unwrapOrThrow(lerAmbienteServidor(process.env));
  return lido;
}
