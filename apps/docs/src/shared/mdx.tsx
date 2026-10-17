import type { ComponentProps } from "react";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { comIdioma, type Idioma } from "./idiomas";

/** Link interno escrito como `/docs/...` ganha o prefixo do idioma da página. */
function noIdioma(idioma: Idioma, href: string | undefined) {
  return href?.startsWith("/") ? comIdioma(idioma, href as `/${string}`) : href;
}

/**
 * Componentes disponíveis no MDX. O conteúdo escreve os links internos sem
 * idioma (`/docs/modulos`), igual em português e em inglês.
 */
export function getMDXComponents(idioma: Idioma, components?: MDXComponents) {
  const { a: Link, Card } = defaultMdxComponents;

  return {
    ...defaultMdxComponents,
    a: (props: ComponentProps<typeof Link>) => (
      <Link {...props} href={noIdioma(idioma, props.href)} />
    ),
    Card: (props: ComponentProps<typeof Card>) => (
      <Card {...props} href={noIdioma(idioma, props.href)} />
    ),
    ...components,
  } satisfies MDXComponents;
}

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
