import "server-only";

import { criarDb, type Db } from "@achados/db";
import Stripe from "stripe";

import type { ConfiguracaoDosPagamentos } from "@/shared/config/ambiente";
import { ambienteServidor } from "@/shared/config/ambiente.servidor";

// A Stripe do lado do servidor (ADR-006 de produto): o cliente com a chave
// secreta e o banco do webhook (achados_pagamentos). Nada disso vai ao
// navegador. Sem as variáveis, os pagamentos ficam indisponíveis.

let cliente: Stripe | undefined;

export function configuracaoDosPagamentos():
  ConfiguracaoDosPagamentos | undefined {
  return ambienteServidor().pagamentos;
}

export function stripe(): Stripe | undefined {
  const config = configuracaoDosPagamentos();
  if (!config) return undefined;
  cliente ??= new Stripe(config.chaveSecreta, {
    appInfo: { name: "Achados na Rota" },
    maxNetworkRetries: 2,
  });
  return cliente;
}

/** O banco do webhook, como achados_pagamentos: o único que escreve assinaturas. */
export function bancoDosPagamentos(): Db | undefined {
  const config = configuracaoDosPagamentos();
  return config ? criarDb(config.databaseUrl) : undefined;
}
