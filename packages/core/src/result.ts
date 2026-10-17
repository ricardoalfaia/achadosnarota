// ─── Result<T, E> — Rust-style error handling ────────────────────────────────
// Based on: docs/exceptions_modelo_rust.md
//
// Rules:
//   - domain/ and application/ always return Result — never throw
//   - infra/ catches exceptions at the boundary and converts to Err(AppError)
//   - api/ maps Result to HTTP response and logs structured error

export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E = AppError> = Ok<T> | Err<E>;

export const Ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const Err = <E>(error: E): Err<E> => ({ ok: false, error });

// ─── Combinators ──────────────────────────────────────────────────────────────

/** Transform the Ok value, pass Err through unchanged */
export function map<T, E, U>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  return result.ok ? Ok(fn(result.value)) : result;
}

/** Transform the Err value, pass Ok through unchanged */
export function mapErr<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> {
  return result.ok ? result : Err(fn(result.error));
}

/** Chain Results — flatMap on Ok. Short-circuits on first Err. */
export function andThen<T, E, U>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}

/** Recover from Err — flatMap on Err. Passes Ok through unchanged. */
export function orElse<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => Result<T, F>
): Result<T, F> {
  return result.ok ? result : fn(result.error);
}

/** Pattern match on both branches */
export function match<T, E, U>(
  result: Result<T, E>,
  handlers: { ok: (value: T) => U; err: (error: E) => U }
): U {
  return result.ok ? handlers.ok(result.value) : handlers.err(result.error);
}

/** Extract Ok value or return fallback */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}

/**
 * Unwrap Ok value or throw the error — use at React Query / throw-based caller boundaries.
 * An error that crossed a Server Action as plain data is rebuilt as AppError,
 * so `instanceof AppError` / `instanceof Error` keep working on the client.
 */
export function unwrapOrThrow<T>(
  result: Result<T, AppError | SerializedAppError>
): T {
  if (!result.ok) throw toAppError(result.error);
  return result.value;
}

// ─── Infrastructure boundary ──────────────────────────────────────────────────
// Use only in infra/ layer to convert exceptions into Err(AppError)

export async function fromPromise<T>(
  promiseFactory: () => Promise<T>,
  onError: (cause: unknown) => AppError
): Promise<Result<T, AppError>> {
  try {
    const value = await promiseFactory();
    return Ok(value);
  } catch (cause) {
    return Err(onError(cause));
  }
}

// ─── AppError ─────────────────────────────────────────────────────────────────

export type ErrorCategory =
  | "validation" // input inválido — 400
  | "domain" // regra de negócio — 422
  | "not_found" // entidade não encontrada — 404
  | "conflict" // estado conflitante — 409
  | "application" // erro de orquestração — 422
  | "infrastructure" // banco, filesystem — 503
  | "integration" // serviço externo — 502
  | "security" // autenticação/autorização — 403
  | "unexpected"; // bug/invariant quebrado — 500

export type ErrorContext = {
  operation?: string;
  entity?: string;
  entityId?: string;
  correlationId?: string;
  module?: string;
  userId?: string;
  tenantId?: string;
  [key: string]: unknown;
};

// Extends Error so instanceof AppError works, stack traces are captured,
// and React Query / Sentry / any error-handling infrastructure recognises it.
export class AppError extends Error {
  readonly category: ErrorCategory;
  readonly code: string;
  readonly details?: Record<string, unknown>;
  readonly context?: ErrorContext;
  readonly retryable?: boolean;

  constructor(params: {
    category: ErrorCategory;
    code: string;
    message: string;
    details?: Record<string, unknown>;
    context?: ErrorContext;
    cause?: unknown;
    retryable?: boolean;
  }) {
    super(params.message, { cause: params.cause });
    this.name = "AppError";
    this.category = params.category;
    this.code = params.code;
    this.details = params.details;
    this.context = params.context;
    this.retryable = params.retryable;
  }
}

// ─── Server Action boundary ───────────────────────────────────────────────────
// React serializes any `Error` instance returned by a Server Action as an
// opaque reference and, in production builds, drops its message. An
// `Err(AppError)` returned as-is reaches the client as "An error occurred in
// the Server Components render…", hiding validation messages meant for the
// user. Actions return `ActionResult` instead: the error crosses as plain data.

/** What of an AppError crosses the server→client boundary. Never the cause or stack. */
export type SerializedAppError = {
  category: ErrorCategory;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable?: boolean;
};

export type ActionResult<T> = Result<T, SerializedAppError>;

export function serializeAppError(error: AppError): SerializedAppError {
  return {
    category: error.category,
    code: error.code,
    message: error.message,
    ...(error.details ? { details: error.details } : {}),
    ...(error.retryable !== undefined ? { retryable: error.retryable } : {}),
  };
}

/** Categories that mean "something broke", not "the user was refused". */
/**
 * Quem quer guardar as falhas além do log (ex.: o web grava em app_error para
 * o painel da plataforma). O core não sabe de banco: só avisa quem se
 * registrou. Registre uma vez, na inicialização do servidor.
 */
type FailureReporter = (error: AppError) => void;

// No processo, não no módulo: no Next, a inicialização do servidor e as
// actions podem ser empacotadas separadamente, cada uma com a sua cópia deste
// pacote — uma variável de módulo registrada numa não seria vista pela outra.
const REPORTER_KEY = Symbol.for("meuproduto.actionFailureReporter");
type ReporterHolder = { [REPORTER_KEY]?: FailureReporter | null };

export function setActionFailureReporter(
  reporter: FailureReporter | null
): void {
  (globalThis as ReporterHolder)[REPORTER_KEY] = reporter;
}

function currentFailureReporter(): FailureReporter | null {
  return (globalThis as ReporterHolder)[REPORTER_KEY] ?? null;
}

const FAILURE_CATEGORIES: ReadonlySet<ErrorCategory> = new Set([
  "infrastructure",
  "integration",
  "unexpected",
]);

/**
 * Convert at the end of a Server Action: `return toActionResult(await work())`.
 *
 * The cause never reaches the client, so failures are logged here — the one
 * place every action passes through. Without it, "Não foi possível…" in the
 * UI had no trace anywhere. Refusals (validation, domain, security…) are
 * expected outcomes and stay out of the log.
 */
export function toActionResult<T>(
  result: Result<T, AppError>
): ActionResult<T> {
  if (result.ok) return result;
  const error = result.error;
  if (FAILURE_CATEGORIES.has(error.category)) {
    console.error(
      `[action] ${error.code}: ${error.message}`,
      error.cause ?? error
    );
    // Quem registrou um avisador (o app web grava em app_error) recebe a falha.
    // Nunca derruba a action: o avisador falhar é problema dele, não do usuário.
    try {
      currentFailureReporter()?.(error);
    } catch {
      /* ignorado de propósito */
    }
  }
  return Err(serializeAppError(error));
}

/** Rebuild an AppError from its serialized form (no-op for a real AppError). */
export function toAppError(error: AppError | SerializedAppError): AppError {
  return error instanceof AppError ? error : new AppError(error);
}

// ─── HTTP mapping ─────────────────────────────────────────────────────────────

const CATEGORY_STATUS: Record<ErrorCategory, number> = {
  validation: 400,
  domain: 422,
  not_found: 404,
  conflict: 409,
  application: 422,
  infrastructure: 503,
  integration: 502,
  security: 403,
  unexpected: 500,
};

export function errorStatusCode(error: AppError): number {
  return CATEGORY_STATUS[error.category];
}

// ─── AppError factories ───────────────────────────────────────────────────────

export const AppErrors = {
  validation: (
    code: string,
    message: string,
    details?: Record<string, unknown>
  ): AppError =>
    new AppError({ category: "validation", code, message, details }),

  domain: (
    code: string,
    message: string,
    details?: Record<string, unknown>
  ): AppError => new AppError({ category: "domain", code, message, details }),

  notFound: (entity: string, id: string): AppError =>
    new AppError({
      category: "not_found",
      code: `${entity.toUpperCase()}_NOT_FOUND`,
      message: `${entity} '${id}' not found`,
      details: { [`${entity.toLowerCase()}Id`]: id },
    }),

  conflict: (
    code: string,
    message: string,
    details?: Record<string, unknown>
  ): AppError => new AppError({ category: "conflict", code, message, details }),

  security: (code: string, message: string): AppError =>
    new AppError({ category: "security", code, message }),

  infrastructure: (code: string, message: string, cause?: unknown): AppError =>
    new AppError({
      category: "infrastructure",
      code,
      message,
      cause,
      retryable: true,
    }),

  integration: (code: string, message: string, cause?: unknown): AppError =>
    new AppError({
      category: "integration",
      code,
      message,
      cause,
      retryable: true,
    }),

  unexpected: (message: string, cause?: unknown): AppError =>
    new AppError({
      category: "unexpected",
      code: "UNEXPECTED_ERROR",
      message,
      cause,
    }),

  withContext: (error: AppError, context: ErrorContext): AppError =>
    new AppError({
      category: error.category,
      code: error.code,
      message: error.message,
      details: error.details,
      context: { ...error.context, ...context },
      cause: error.cause,
      retryable: error.retryable,
    }),
};
