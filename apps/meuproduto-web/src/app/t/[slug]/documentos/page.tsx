import {
  metadataDoItem,
  PaginaEmConstrucao,
} from "@/shared/casca/pagina-em-construcao";

export const generateMetadata = () => metadataDoItem("documentos");

export default async function Pagina({
  params,
}: PageProps<"/t/[slug]/documentos">) {
  const { slug } = await params;
  return <PaginaEmConstrucao id="documentos" slug={slug} />;
}
