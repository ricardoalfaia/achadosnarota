import {
  metadataDoItem,
  PaginaEmConstrucao,
} from "@/shared/casca/pagina-em-construcao";

export const generateMetadata = () => metadataDoItem("equipe");

export default async function Pagina({
  params,
}: PageProps<"/t/[slug]/equipe">) {
  const { slug } = await params;
  return <PaginaEmConstrucao id="equipe" slug={slug} />;
}
