import {
  metadataDoItem,
  PaginaEmConstrucao,
} from "@/shared/casca/pagina-em-construcao";

export const generateMetadata = () => metadataDoItem("modelos");

export default async function Pagina({
  params,
}: PageProps<"/t/[slug]/modelos">) {
  const { slug } = await params;
  return <PaginaEmConstrucao id="modelos" slug={slug} />;
}
