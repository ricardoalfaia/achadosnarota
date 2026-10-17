import { unwrapOrThrow } from "@meuproduto/core";

import { lerAmbientePublico } from "./ambiente";

// O Next só embute NEXT_PUBLIC_* no bundle quando a variável é lida pelo nome literal.
// Configuração inválida interrompe build e boot: não há recuperação para o usuário.
export const ambientePublico = unwrapOrThrow(
  lerAmbientePublico({ NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV })
);
