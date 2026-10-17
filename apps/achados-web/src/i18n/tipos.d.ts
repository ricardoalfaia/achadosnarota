import type mensagens from "../../messages/pt-BR.json";
import type { Idioma } from "../shared/preferencias/preferencias";

// Com isto o TypeScript confere as chaves de tradução: `t("Inicio.titulo")`
// compila, e uma chave que não existe em pt-BR.json é erro.
declare module "next-intl" {
  interface AppConfig {
    Locale: Idioma;
    Messages: typeof mensagens;
  }
}
