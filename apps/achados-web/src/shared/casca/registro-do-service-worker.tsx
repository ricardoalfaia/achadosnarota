"use client";

import { useEffect } from "react";

/**
 * Registra o service worker (public/sw.js) em produção. Em desenvolvimento ele
 * atrapalharia o recarregamento do Next, então fica de fora. O worker é
 * conservador (docs/produto/02): guarda só arquivos estáticos e a página
 * offline; nada de dado pessoal, sessão ou código de resgate.
 */
export function RegistroDoServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Sem service worker o app funciona igual, só sem a página offline.
      });
  }, []);
  return null;
}
