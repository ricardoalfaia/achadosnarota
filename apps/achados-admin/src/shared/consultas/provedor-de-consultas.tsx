"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { criarClienteDeConsultas } from "./cliente";

/**
 * O cliente do Query do navegador. Quando o painel tiver sessão (ADR-0020),
 * quem chama este provedor o remonta com `key={escopo}` da pessoa da equipe,
 * como no app do assinante: ao trocar de conta, o cache anterior é descartado.
 */
export function ProvedorDeConsultas({ children }: { children: ReactNode }) {
  const [cliente] = useState(criarClienteDeConsultas);
  return <QueryClientProvider client={cliente}>{children}</QueryClientProvider>;
}
