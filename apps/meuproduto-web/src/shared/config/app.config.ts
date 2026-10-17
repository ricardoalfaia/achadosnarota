import type { Ambiente } from "./ambiente";
import { homolog } from "./ambientes/homolog";
import { local } from "./ambientes/local";
import { production } from "./ambientes/production";

/**
 * Configuração pública do app. Chega ao navegador pelo ConfiguracaoProvider:
 * não colocar segredo nem endereço interno aqui. O que é só do servidor fica
 * em `ambiente.servidor.ts`.
 */
export type ConfiguracaoDoApp = {
  nome: string;
  ambiente: Ambiente;
  /** Texto que identifica o ambiente para quem usa; `null` em produção. */
  rotuloDoAmbiente: string | null;
};

/** O que cada arquivo de `ambientes/` define. */
export type ConfiguracaoDoAmbiente = Omit<
  ConfiguracaoDoApp,
  "nome" | "ambiente"
>;

const base = { nome: "Meuproduto" } satisfies Partial<ConfiguracaoDoApp>;

const porAmbiente: Record<Ambiente, ConfiguracaoDoAmbiente> = {
  local,
  homolog,
  production,
};

export function configuracaoPara(ambiente: Ambiente): ConfiguracaoDoApp {
  return { ...base, ...porAmbiente[ambiente], ambiente };
}
