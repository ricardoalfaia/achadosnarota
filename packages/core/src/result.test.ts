import { describe, expect, it } from "vitest";

import {
  andThen,
  AppError,
  Err,
  fromPromise,
  Ok,
  toActionResult,
  toAppError,
  unwrapOrThrow,
} from "./result";

describe("contrato Result/Error", () => {
  it("interrompe o encadeamento em Err", () => {
    const result = Err(
      new AppError({
        category: "domain",
        code: "REFUSED",
        message: "Operação recusada",
      })
    );
    let called = false;
    expect(
      andThen(result, () => {
        called = true;
        return Ok(1);
      })
    ).toBe(result);
    expect(called).toBe(false);
  });
  it("serializa o erro esperado sem cause, stack ou context", () => {
    const error = new AppError({
      category: "domain",
      code: "LIMIT",
      message: "Limite excedido",
      details: { field: "quantidade" },
      context: { tenantId: "internal-only" },
      cause: new Error("internal-only"),
    });
    const payload = JSON.parse(JSON.stringify(toActionResult(Err(error))));
    expect(payload.ok).toBe(false);
    expect(payload.error).not.toHaveProperty("cause");
    expect(payload.error).not.toHaveProperty("stack");
    expect(payload.error).not.toHaveProperty("context");
    expect(payload.error.details).toEqual({ field: "quantidade" });
    expect(toAppError(payload.error)).toBeInstanceOf(AppError);
    expect(toAppError(payload.error).code).toBe("LIMIT");
  });
  it("o adaptador lança AppError em Err serializado e mantém Ok vazio", () => {
    const error = new AppError({
      category: "validation",
      code: "INVALID_FIELD",
      message: "Campo inválido",
    });
    expect(() => unwrapOrThrow(toActionResult(Err(error)))).toThrow(AppError);
    expect(unwrapOrThrow(Ok([]))).toEqual([]);
  });
  it("normaliza uma rejeição do transporte em Err", async () => {
    const result = await fromPromise(
      () => Promise.reject(new Error("Synthetic transport failure")),
      (cause) =>
        new AppError({
          category: "integration",
          code: "TRANSPORT_FAILED",
          message: "Indisponível",
          retryable: true,
          cause,
        })
    );
    expect(result.ok).toBe(false);
    if (result.ok)
      throw new Error("Falha do teste: transporte rejeitado retornou Ok");
    expect(result.error.category).toBe("integration");
    expect(result.error.retryable).toBe(true);
  });
});
