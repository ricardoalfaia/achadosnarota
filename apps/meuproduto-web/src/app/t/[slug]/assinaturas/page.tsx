import {
  metadataDoItem,
  PaginaEmConstrucao,
} from "@/shared/casca/pagina-em-construcao";

export const generateMetadata = () => metadataDoItem("assinaturas");

export default async function Pagina({
  params,
}: PageProps<"/t/[slug]/assinaturas">) {
  const { slug } = await params;
  return <PaginaEmConstrucao id="assinaturas" slug={slug} />;
}
