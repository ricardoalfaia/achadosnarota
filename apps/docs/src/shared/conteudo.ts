import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { defineDocs } from "fumadocs-mdx/macro";

import { i18n } from "./idiomas";

// As páginas ficam em content/docs. `pagina.mdx` é a versão em português e
// `pagina.en.mdx`, a tradução; sem tradução, o inglês mostra a página em português.
const docs = defineDocs({
  dir: "content/docs",
  docs: { schema: pageSchema },
  meta: { schema: metaSchema },
});

export const conteudo = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  i18n,
  plugins: [lucideIconsPlugin()],
});
