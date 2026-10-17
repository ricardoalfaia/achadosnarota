import { isValid, monotonicFactory } from "ulid";

// Identificadores de linha (ADR-0024): ULID, 26 caracteres em Crockford
// base32. Os 10 primeiros codificam o milissegundo da criação, então a ordem
// alfabética do id é a ordem de criação: `order by id` lista do mais antigo ao
// mais novo e o índice da chave primária cresce sempre no fim, como um serial.
// A fábrica monotônica garante a ordem também entre ids do mesmo milissegundo
// gerados no mesmo processo.
//
// O id não é segredo nem prova de nada: revela quando a linha nasceu. Código
// de resgate e token continuam aleatórios e guardados em hash (ADR-005 de
// produto), nunca derivados daqui.

const gerar = monotonicFactory();

/** Um ULID novo, em maiúsculas: `01JABCDXYZ...`. */
export function novoId(): string {
  return gerar();
}

/** É um ULID canônico (26 caracteres, maiúsculas, alfabeto Crockford)? */
export function ehUlid(valor: unknown): valor is string {
  return (
    typeof valor === "string" &&
    valor.length === 26 &&
    valor === valor.toUpperCase() &&
    isValid(valor)
  );
}

/** Expressão do Postgres equivalente a `ehUlid`, usada nas constraints de check. */
export const PADRAO_ULID_SQL = "^[0-9A-HJKMNP-TV-Z]{26}$";
