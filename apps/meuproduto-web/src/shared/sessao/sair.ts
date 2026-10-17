"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { toActionResult } from "@meuproduto/core";

import { auth } from "@/shared/auth/auth.servidor";
import { chamarAuth } from "@/shared/auth/chamar.servidor";
import { ROTA_DE_LOGIN } from "./sessao.servidor";

/**
 * Encerra a sessão: o Better Auth apaga o registro no banco (a sessão deixa de
 * valer em qualquer lugar, sem cookieCache) e o `nextCookies` apaga os
 * cookies deste navegador. Depois, o login.
 */
export async function sair(): Promise<void> {
  const pedido = await headers();
  const saida = await chamarAuth("signOut", () =>
    auth().api.signOut({ headers: pedido })
  );
  // Recusa (sessão que já não existia) não importa; falha de banco vai ao log.
  if (!saida.ok && saida.error.category !== "security") toActionResult(saida);
  redirect(ROTA_DE_LOGIN);
}
