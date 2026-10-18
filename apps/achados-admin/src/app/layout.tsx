import type { Metadata, Viewport } from "next";

import { ProvedorDeConsultas } from "@/shared/consultas/provedor-de-consultas";
import { atributoDoTema } from "@/shared/preferencias/preferencias";
import { PreferenciasProvider } from "@/shared/preferencias/preferencias-provider";
import { lerPreferenciasDoPedido } from "@/shared/preferencias/preferencias.servidor";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Painel · Achados na Rota",
    template: "%s · Painel Achados na Rota",
  },
  description:
    "Área administrativa do Achados na Rota: casas, curadoria e promoções.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // O tema e o menu recolhido vêm dos cookies, para o HTML já sair do
  // servidor como a pessoa deixou, sem piscar no padrão.
  const preferencias = await lerPreferenciasDoPedido();

  return (
    <html
      lang="pt-BR"
      data-theme={atributoDoTema(preferencias.tema)}
      className="h-full antialiased"
    >
      <body className="min-h-full bg-background" suppressHydrationWarning>
        <PreferenciasProvider iniciais={preferencias}>
          <ProvedorDeConsultas>{children}</ProvedorDeConsultas>
        </PreferenciasProvider>
      </body>
    </html>
  );
}
