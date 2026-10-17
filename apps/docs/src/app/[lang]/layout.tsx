import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { i18nProvider } from "fumadocs-ui/i18n";

import { ehIdioma, i18n } from "@/shared/idiomas";
import { traducoes } from "@/shared/layout";
import { Provedores } from "@/shared/provedores";
import { textosDe } from "@/shared/textos";

import "../global.css";

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!ehIdioma(lang)) return {};
  const textos = textosDe(lang);

  return {
    title: {
      default: textos.nomeDoSite,
      template: `%s | ${textos.nomeDoSite}`,
    },
    description: textos.descricaoDoSite,
  };
}

export default async function RootLayout({
  params,
  children,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!ehIdioma(lang)) notFound();

  return (
    // O tema é aplicado no <html> antes da hidratação, por isso o aviso é suprimido.
    <html lang={lang} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Provedores idioma={lang} i18n={i18nProvider(traducoes, lang)}>
          {children}
        </Provedores>
      </body>
    </html>
  );
}
