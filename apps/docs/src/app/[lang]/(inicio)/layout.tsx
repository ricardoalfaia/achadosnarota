import { notFound } from "next/navigation";
import { HomeLayout } from "fumadocs-ui/layouts/home";

import { comIdioma, ehIdioma } from "@/shared/idiomas";
import { opcoesDoLayout } from "@/shared/layout";
import { textosDe } from "@/shared/textos";

export default async function Layout({
  params,
  children,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!ehIdioma(lang)) notFound();

  return (
    <HomeLayout
      {...opcoesDoLayout(lang)}
      links={[
        {
          text: textosDe(lang).documentacao,
          url: comIdioma(lang, "/docs"),
          active: "nested-url",
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
