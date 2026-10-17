import { ambientePublico } from "./ambiente.publico";
import { configuracaoPara } from "./app.config";

/** Configuração do ambiente em execução, para Server Components e para o provider. */
export const configuracaoDoApp = configuracaoPara(ambientePublico.ambiente);
