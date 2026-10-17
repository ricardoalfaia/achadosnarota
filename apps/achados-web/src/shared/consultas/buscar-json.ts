import { AppError, type ErrorCategory } from "@achados/core";

// Adaptador HTTP do navegador para o BFF do app (`/api/...`). É a fronteira em
// que o Query precisa de exceção (ADR-0004): resposta de erro vira AppError
// lançado, com a categoria pelo status, e o Query decide se tenta de novo.

const CATEGORIA_POR_STATUS: Record<number, ErrorCategory> = {
  400: "validation",
  401: "security",
  403: "security",
  404: "not_found",
  409: "conflict",
  422: "domain",
};

type CorpoDeErro = { code?: unknown; message?: unknown };

export async function buscarJson<T>(
  caminho: string,
  { signal }: { signal?: AbortSignal } = {}
): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(caminho, {
      signal: signal ?? null,
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
  } catch (causa) {
    if ((causa as Error).name === "AbortError") throw causa;
    throw new AppError({
      category: "infrastructure",
      code: "SEM_CONEXAO",
      message: "Sem conexão com o servidor.",
      cause: causa,
      retryable: true,
    });
  }

  if (resposta.ok) return (await resposta.json()) as T;

  const corpo = (await resposta.json().catch(() => ({}))) as CorpoDeErro;
  throw new AppError({
    category: CATEGORIA_POR_STATUS[resposta.status] ?? "infrastructure",
    code:
      typeof corpo.code === "string" ? corpo.code : `HTTP_${resposta.status}`,
    message:
      typeof corpo.message === "string"
        ? corpo.message
        : "Não foi possível carregar agora.",
  });
}
