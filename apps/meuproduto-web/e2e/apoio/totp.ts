import { createHmac } from "node:crypto";

// TOTP mínimo (RFC 6238: HMAC-SHA1, 6 dígitos, 30 s) para o teste fazer o
// papel do aplicativo autenticador a partir da chave base32 que a tela mostra.

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function decodificarBase32(texto: string): Buffer {
  let bits = "";
  for (const letra of texto.replace(/=+$/, "").toUpperCase()) {
    const valor = BASE32.indexOf(letra);
    if (valor < 0) throw new Error("chave base32 inválida");
    bits += valor.toString(2).padStart(5, "0");
  }
  const bytes = bits.match(/.{8}/g) ?? [];
  return Buffer.from(bytes.map((byte) => parseInt(byte, 2)));
}

export function codigoTotp(chave: string, agora = Date.now()): string {
  const contador = Buffer.alloc(8);
  contador.writeBigUInt64BE(BigInt(Math.floor(agora / 30_000)));
  const hmac = createHmac("sha1", decodificarBase32(chave))
    .update(contador)
    .digest();
  const deslocamento = hmac[hmac.length - 1]! & 0x0f;
  const numero = hmac.readUInt32BE(deslocamento) & 0x7fffffff;
  return String(numero % 1_000_000).padStart(6, "0");
}
