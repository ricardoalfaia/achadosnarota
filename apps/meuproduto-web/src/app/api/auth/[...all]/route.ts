import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/shared/auth/auth.servidor";

// Os endpoints do Better Auth em /api/auth/*. O rate limit do Better Auth
// (por IP e rota, no banco) vale aqui. As telas do app não dependem deles: as
// Actions chamam `auth().api.*` no servidor.
//
// O handler é montado na primeira requisição, e não no import, porque o
// `next build` importa este módulo sem as variáveis do servidor.
let handlers: ReturnType<typeof toNextJsHandler> | undefined;
const doAuth = () => (handlers ??= toNextJsHandler(auth()));

export const GET = (pedido: Request) => doAuth().GET(pedido);
export const POST = (pedido: Request) => doAuth().POST(pedido);
