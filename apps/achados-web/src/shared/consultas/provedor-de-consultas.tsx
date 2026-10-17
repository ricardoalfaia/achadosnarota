"use client";

import { createContext, use, useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { criarClienteDeConsultas } from "./cliente";

type Pessoa = {
  /** Há sessão liberada neste navegador. */
  logado: boolean;
  /**
   * Identificador não secreto da pessoa, para particionar as chaves de cache
   * (ADR-0006, seção 6). É um resumo do id, nunca token nem e-mail.
   */
  escopo: string;
};

const ContextoDaPessoa = createContext<Pessoa | null>(null);

/**
 * O cliente do Query do navegador e quem está usando o app. Quem chama este
 * provedor o remonta com `key={escopo}`: ao entrar, sair ou trocar de conta, o
 * cache anterior é descartado inteiro e nenhuma resposta atrasada da pessoa
 * anterior repovoa o da nova.
 */
export function ProvedorDeConsultas({
  pessoa,
  children,
}: {
  pessoa: Pessoa;
  children: ReactNode;
}) {
  const [cliente] = useState(criarClienteDeConsultas);
  return (
    <QueryClientProvider client={cliente}>
      <ContextoDaPessoa value={pessoa}>{children}</ContextoDaPessoa>
    </QueryClientProvider>
  );
}

/** Quem está usando o app, para hooks que dependem da sessão. */
export function usePessoa(): Pessoa {
  const pessoa = use(ContextoDaPessoa);
  if (!pessoa)
    throw new Error("usePessoa precisa do ProvedorDeConsultas do layout raiz.");
  return pessoa;
}
