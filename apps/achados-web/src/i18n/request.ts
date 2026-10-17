import { getRequestConfig } from "next-intl/server";

import { lerPreferenciasDoPedido } from "@/shared/preferencias/preferencias.servidor";

/**
 * O idioma de cada pedido vem da preferência de quem usa o sistema, e não do
 * endereço: as rotas não têm prefixo de idioma.
 */
export default getRequestConfig(async () => {
  const { idioma } = await lerPreferenciasDoPedido();

  return {
    locale: idioma,
    messages: (await import(`../../messages/${idioma}.json`)).default,
    // Datas e horas do sistema seguem o horário de Brasília, não o do navegador.
    timeZone: "America/Sao_Paulo",
  };
});
