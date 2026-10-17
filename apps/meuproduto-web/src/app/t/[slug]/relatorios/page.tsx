import {
  metadataDoItem,
  PaginaEmConstrucao,
} from "@/shared/casca/pagina-em-construcao";

export const generateMetadata = () => metadataDoItem("relatorios");

export default async function Pagina({
  params,
}: PageProps<"/t/[slug]/relatorios">) {
  const { slug } = await params;
  return <PaginaEmConstrucao id="relatorios" slug={slug} />;
}
