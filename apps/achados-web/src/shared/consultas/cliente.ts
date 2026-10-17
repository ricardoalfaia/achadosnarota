import { AppError } from "@achados/core";
import { QueryClient } from "@tanstack/react-query";

// O cliente do TanStack Query com as políticas comuns (ADR-0006, seção 5).
// Cada recurso declara o próprio staleTime/gcTime nas suas opções; aqui fica
// só o que vale para todos.

/** Falha que não melhora tentando de novo: entrada, acesso, inexistente, conflito. */
function semNovaTentativa(erro: unknown): boolean {
  return (
    erro instanceof AppError &&
    ["validation", "security", "not_found", "conflict", "domain"].includes(
      erro.category
    )
  );
}

export function criarClienteDeConsultas(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Sem refetch imediato depois da hidratação.
        staleTime: 60_000,
        retry: (tentativas, erro) => !semNovaTentativa(erro) && tentativas < 2,
        retryDelay: (tentativa) => Math.min(1000 * 2 ** tentativa, 8000),
      },
      mutations: {
        // Comando não é repetido sozinho (ADR-0006, seção 7).
        retry: false,
      },
    },
  });
}
