// Favoritos: lugares salvos pela pessoa, dado pessoal com RLS por usuário.
// No navegador, um recurso do Query compartilhado por todas as telas; as
// leituras e o prefetch no servidor estão em `servidor.ts`.
export { BotaoDeFavorito } from "./components/botao-de-favorito";
export { SESSAO_NECESSARIA } from "./domain/pedido";
export { useFavorito } from "./hooks/use-favorito";
export { useFavoritos } from "./hooks/use-favoritos";
