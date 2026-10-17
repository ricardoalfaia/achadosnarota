import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Triagem otimista (ADR-0020): sem o cookie de sessão do Better Auth, as telas
// do sistema levam ao login. Ter o cookie não prova sessão válida: quem
// verifica de verdade é `exigirSessao`/`exigirTenant`, no servidor, a cada
// pedido. Com cookie, o login passa: a própria página decide (sessão válida
// vai ao sistema; cookie vencido ou revogado mostra o formulário, sem laço).
// Nenhum header de tenant é injetado aqui.

const ROTA_DE_LOGIN = "/login";

/** O mesmo `advanced.cookiePrefix` de `shared/auth/auth.servidor.ts`. */
const PREFIXO_DOS_COOKIES = "meuproduto";

function ehPublica(caminho: string): boolean {
  return caminho === ROTA_DE_LOGIN || caminho.startsWith(`${ROTA_DE_LOGIN}/`);
}

export function proxy(pedido: NextRequest) {
  if (ehPublica(pedido.nextUrl.pathname)) return NextResponse.next();

  const cookie = getSessionCookie(pedido, {
    cookiePrefix: PREFIXO_DOS_COOKIES,
  });
  if (!cookie) return NextResponse.redirect(new URL(ROTA_DE_LOGIN, pedido.url));
  return NextResponse.next();
}

export const config = {
  // Tudo, menos os endpoints do Better Auth, os arquivos do Next e as imagens
  // de `public/`.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|.*\\.(?:png|svg|ico|jpg|webp)$).*)",
  ],
};
