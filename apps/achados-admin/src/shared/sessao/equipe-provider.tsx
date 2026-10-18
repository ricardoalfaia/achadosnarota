"use client";

import { createContext, use, type ReactNode } from "react";

import { podeEscrever, type ESCREVE, type PessoaDaEquipe } from "./sessao";

// Quem está no painel, para a tela orientar o que mostra (esconder "Nova
// casa" de quem não escreve casas). Não é autorização: o servidor e o banco
// conferem de novo a cada comando.

const Equipe = createContext<PessoaDaEquipe | null>(null);

export function EquipeProvider({
  pessoa,
  children,
}: {
  pessoa: PessoaDaEquipe;
  children: ReactNode;
}) {
  return <Equipe value={pessoa}>{children}</Equipe>;
}

export function usePessoaDaEquipe(): PessoaDaEquipe {
  const pessoa = use(Equipe);
  if (!pessoa) throw new Error("usePessoaDaEquipe fora do EquipeProvider.");
  return pessoa;
}

/** O papel da pessoa escreve nesta área? */
export function usePodeEscrever(area: keyof typeof ESCREVE): boolean {
  return podeEscrever(usePessoaDaEquipe(), area);
}
