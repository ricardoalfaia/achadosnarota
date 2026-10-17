"use client";

import { createContext, use, type ReactNode } from "react";

import type { ConfiguracaoDoApp } from "./app.config";

const ConfiguracaoContext = createContext<ConfiguracaoDoApp | null>(null);

export function ConfiguracaoProvider({
  configuracao,
  children,
}: {
  configuracao: ConfiguracaoDoApp;
  children: ReactNode;
}) {
  return (
    <ConfiguracaoContext value={configuracao}>{children}</ConfiguracaoContext>
  );
}

/** Configuração pública do app em componentes cliente. */
export function useConfiguracao(): ConfiguracaoDoApp {
  const configuracao = use(ConfiguracaoContext);
  if (!configuracao)
    throw new Error(
      "useConfiguracao precisa do ConfiguracaoProvider do layout raiz."
    );
  return configuracao;
}
