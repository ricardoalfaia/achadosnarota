import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";

import { conteudo } from "@/shared/conteudo";
import { ehIdioma } from "@/shared/idiomas";
import { getMDXComponents } from "@/shared/mdx";

type Props = PageProps<"/[lang]/docs/[[...slug]]">;

export default async function Pagina({ params }: Props) {
  const { lang, slug } = await params;
  const pagina = conteudo.getPage(slug, lang);
  if (!pagina || !ehIdioma(lang)) notFound();

  const MDX = pagina.data.body;

  return (
    <DocsPage toc={pagina.data.toc} full={pagina.data.full}>
      <DocsTitle>{pagina.data.title}</DocsTitle>
      <DocsDescription>{pagina.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents(lang)} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return conteudo.generateParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const pagina = conteudo.getPage(slug, lang);
  if (!pagina) notFound();

  return {
    title: pagina.data.title,
    description: pagina.data.description,
  };
}
