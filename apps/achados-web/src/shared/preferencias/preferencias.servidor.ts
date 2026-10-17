import "server-only";

import { cookies } from "next/headers";

import { lerPreferencias, type Preferencias } from "./preferencias";

/** As preferências de quem fez o pedido, lidas dos cookies. */
export async function lerPreferenciasDoPedido(): Promise<Preferencias> {
  const guardados = await cookies();
  return lerPreferencias((nome) => guardados.get(nome)?.value);
}
