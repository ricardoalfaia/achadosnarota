import {
  metadataDoItem,
  PaginaEmConstrucao,
} from "@/shared/casca/pagina-em-construcao";

export const generateMetadata = () => metadataDoItem("integracoes");

export default async function Pagina({
  params,
}: PageProps<"/t/[slug]/integracoes">) {
  const { slug } = await params;
  return <PaginaEmConstrucao id="integracoes" slug={slug} />;
}
