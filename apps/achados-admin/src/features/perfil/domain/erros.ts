import { FOTO_INVALIDA } from "./foto";

export const SESSAO_NECESSARIA = "SESSAO_NECESSARIA";

const MENSAGENS: Record<string, string> = {
  [FOTO_INVALIDA]:
    "Não deu para usar essa foto. Tente outra, em JPG, PNG ou WebP.",
  // Código de `shared/armazenamento` (só servidor): o R2 não está configurado.
  ARMAZENAMENTO_INDISPONIVEL: "O envio de fotos está indisponível no momento.",
};

/** O que a tela diz quando a troca da foto falha, sem detalhe técnico. */
export function mensagemDaFalha(codigo: string | undefined): string {
  return (
    (codigo && MENSAGENS[codigo]) ||
    "Não foi possível salvar a foto agora. Tente de novo em instantes."
  );
}
