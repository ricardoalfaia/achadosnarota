import { createI18nMiddleware } from "fumadocs-core/i18n/middleware";

import { i18n } from "@/shared/idiomas";

// Endereço sem idioma é redirecionado ao idioma do navegador (português se
// não for um dos disponíveis).
export default createI18nMiddleware(i18n);

export const config = {
  // Fora: API, arquivos internos do Next e arquivos com extensão (imagens, ícones).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
