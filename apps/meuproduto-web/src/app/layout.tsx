import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";

import { configuracaoDoApp } from "@/shared/config/configuracao";
import { ConfiguracaoProvider } from "@/shared/config/configuracao-provider";
import { atributoDoTema } from "@/shared/preferencias/preferencias";
import { PreferenciasProvider } from "@/shared/preferencias/preferencias-provider";
import { lerPreferenciasDoPedido } from "@/shared/preferencias/preferencias.servidor";

import "./globals.css";

export const metadata: Metadata = {
  title: configuracaoDoApp.nome,
  description: "Seus documentos ganham vida.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // As preferências vêm dos cookies para o HTML já sair do servidor no tema e
  // no idioma escolhidos, sem piscar no padrão.
  const preferencias = await lerPreferenciasDoPedido();

  return (
    <html
      lang={preferencias.idioma}
      data-ambiente={configuracaoDoApp.ambiente}
      data-theme={atributoDoTema(preferencias.tema)}
      className="h-full antialiased"
    >
      {/* Extensões do navegador (Grammarly e afins) gravam atributos no body
          antes da hidratação; o aviso vale só para os atributos dele. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <NextIntlClientProvider>
          <ConfiguracaoProvider configuracao={configuracaoDoApp}>
            <PreferenciasProvider iniciais={preferencias}>
              {children}
            </PreferenciasProvider>
          </ConfiguracaoProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
