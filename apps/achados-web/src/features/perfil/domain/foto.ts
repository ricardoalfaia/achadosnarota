import { AppErrors, Err, Ok, type AppError, type Result } from "@achados/core";

/**
 * A foto do perfil: um quadrado que o avatar mostra em círculo. O navegador
 * recorta no lado de saída; o servidor confere tudo de novo e regrava.
 */
export const FOTO = {
  /** Lado do quadrado gravado: nítido no maior avatar (112px) em tela 3x e além. */
  lado: 512,
  /** Abaixo do limite de 1 MB do corpo das Server Actions. */
  tamanhoMaximoEmBytes: 900_000,
  tiposAceitos: ["image/jpeg", "image/png", "image/webp"] as const,
  /** Pasta das fotos no bucket. */
  pasta: "avatares",
} as const;

export const FOTO_INVALIDA = "FOTO_INVALIDA";

/** O arquivo enviado pelo formulário, antes de decodificar a imagem. */
export function lerArquivoDaFoto(valor: unknown): Result<Blob, AppError> {
  if (!(valor instanceof Blob) || valor.size === 0)
    return Err(
      AppErrors.validation(FOTO_INVALIDA, "Nenhuma foto foi enviada.")
    );
  if (valor.size > FOTO.tamanhoMaximoEmBytes)
    return Err(
      AppErrors.validation(FOTO_INVALIDA, "A foto passou do tamanho aceito.", {
        bytes: valor.size,
      })
    );
  if (!(FOTO.tiposAceitos as readonly string[]).includes(valor.type))
    return Err(
      AppErrors.validation(FOTO_INVALIDA, "Formato de foto não aceito.", {
        tipo: valor.type,
      })
    );
  return Ok(valor);
}

/** `avatares/01J....webp`: o nome é um ULID, sem nada de quem enviou. */
export function chaveDaFoto(id: string): string {
  return `${FOTO.pasta}/${id}.webp`;
}

/** É uma foto de perfil gravada por este app (e pode ser apagada ao trocar)? */
export function ehChaveDeFoto(chave: string | undefined): chave is string {
  return (
    chave !== undefined &&
    new RegExp(`^${FOTO.pasta}/[0-9A-HJKMNP-TV-Z]{26}\\.webp$`).test(chave)
  );
}
