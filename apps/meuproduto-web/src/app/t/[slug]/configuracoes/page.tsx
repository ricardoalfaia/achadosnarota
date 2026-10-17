import {
  metadataDoItem,
  PaginaEmConstrucao,
} from "@/shared/casca/pagina-em-construcao";

export const generateMetadata = () => metadataDoItem("configuracoes");

export default async function Pagina({
  params,
}: PageProps<"/t/[slug]/configuracoes">) {
  const { slug } = await params;
  return <PaginaEmConstrucao id="configuracoes" slug={slug} />;
}
