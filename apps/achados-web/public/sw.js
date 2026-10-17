// Service worker do Achados na Rota. Conservador de propósito
// (docs/produto/02): guarda só arquivos estáticos públicos e a página offline.
// Páginas (HTML), /api e qualquer coisa com dado de pessoa, sessão ou código
// de resgate passam direto pela rede e nunca entram no cache.

const VERSAO = "achados-v1";
const ESTATICOS = `${VERSAO}-estaticos`;
const PAGINA_OFFLINE = "/offline";
const PRECACHE = [
  PAGINA_OFFLINE,
  "/marca/simbolo.png",
  "/icones/icone-192.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(ESTATICOS)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(
          chaves
            .filter((chave) => !chave.startsWith(VERSAO))
            .map((chave) => caches.delete(chave))
        )
      )
      .then(() => self.clients.claim())
  );
});

/** Arquivos públicos e imutáveis (ou quase): podem vir do cache. */
function ehEstatico(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/marca/") ||
    url.pathname.startsWith("/icones/") ||
    url.pathname.startsWith("/imagens/") ||
    url.pathname.startsWith("/exemplos/")
  );
}

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Navegação: sempre a rede; sem rede, a página offline.
  if (pedido.mode === "navigate") {
    evento.respondWith(
      fetch(pedido).catch(() =>
        caches.match(PAGINA_OFFLINE).then(
          (resposta) =>
            resposta ??
            new Response("Sem conexão", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
        )
      )
    );
    return;
  }

  if (!ehEstatico(url)) return;

  // Estáticos: do cache, atualizando em segundo plano.
  evento.respondWith(
    caches.open(ESTATICOS).then(async (cache) => {
      const guardada = await cache.match(pedido);
      const daRede = fetch(pedido)
        .then((resposta) => {
          if (resposta.ok && resposta.type === "basic")
            cache.put(pedido, resposta.clone());
          return resposta;
        })
        .catch(() => guardada);
      return guardada ?? daRede;
    })
  );
});
