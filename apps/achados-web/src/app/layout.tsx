import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";

import { RegistroDoServiceWorker } from "@/shared/casca/registro-do-service-worker";
import { configuracaoDoApp } from "@/shared/config/configuracao";
import { ConfiguracaoProvider } from "@/shared/config/configuracao-provider";
import { escopoDaPessoa } from "@/shared/consultas/escopo.servidor";
import { ProvedorDeConsultas } from "@/shared/consultas/provedor-de-consultas";
import { atributoDoTema, corDaBarra } from "@/shared/preferencias/preferencias";
import { PreferenciasProvider } from "@/shared/preferencias/preferencias-provider";
import { lerPreferenciasDoPedido } from "@/shared/preferencias/preferencias.servidor";
import { pessoaDoPedido } from "@/shared/sessao/sessao.servidor";

import "./globals.css";

const DESCRICAO =
  "Descubra lugares que valem a pena: restaurantes, cafés e pousadas com curadoria independente e benefícios para assinantes do passaporte.";

export const metadata: Metadata = {
  title: {
    default: `${configuracaoDoApp.nome} · Descubra lugares que valem a pena`,
    template: `%s · ${configuracaoDoApp.nome}`,
  },
  description: DESCRICAO,
  applicationName: configuracaoDoApp.nome,
  appleWebApp: {
    capable: true,
    title: "Achados",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icones/apple-touch-icon.png",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: configuracaoDoApp.nome,
    description: DESCRICAO,
  },
};

export async function generateViewport(): Promise<Viewport> {
  const { tema } = await lerPreferenciasDoPedido();
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    // Barra de status do celular na cor do tema do app.
    themeColor: corDaBarra(tema),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // As preferências vêm dos cookies para o HTML já sair do servidor no tema e
  // no idioma escolhidos, sem piscar no padrão.
  const [preferencias, usuario] = await Promise.all([
    lerPreferenciasDoPedido(),
    pessoaDoPedido(),
  ]);
  const escopo = escopoDaPessoa(usuario);

  return (
    <html
      lang={preferencias.idioma}
      data-ambiente={configuracaoDoApp.ambiente}
      data-theme={atributoDoTema(preferencias.tema)}
      className="h-full antialiased"
    >
      {/* Extensões do navegador (Grammarly e afins) gravam atributos no body
          antes da hidratação; o aviso vale só para os atributos dele. */}
      <body
        className="flex min-h-full flex-col overscroll-y-contain bg-surface-hover"
        suppressHydrationWarning
      >
        <NextIntlClientProvider>
          <ConfiguracaoProvider configuracao={configuracaoDoApp}>
            <PreferenciasProvider iniciais={preferencias}>
              <ProvedorDeConsultas
                key={escopo}
                pessoa={{ logado: usuario !== null, escopo }}
              >
                {children}
              </ProvedorDeConsultas>
            </PreferenciasProvider>
          </ConfiguracaoProvider>
        </NextIntlClientProvider>
        <RegistroDoServiceWorker />
      </body>
    </html>
  );
}
