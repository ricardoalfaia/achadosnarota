import { notFound } from "next/navigation";
import { DocsLayout } from "fumadocs-ui/layouts/docs";

import { conteudo } from "@/shared/conteudo";
import { ehIdioma } from "@/shared/idiomas";
import { opcoesDoLayout } from "@/shared/layout";

export default async function Layout({
  params,
  children,
}: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params;
  if (!ehIdioma(lang)) notFound();

  return (
    <DocsLayout tree={conteudo.getPageTree(lang)} {...opcoesDoLayout(lang)}>
      {children}
    </DocsLayout>
  );
}
