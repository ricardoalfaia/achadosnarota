import "server-only";

import {
  AppErrors,
  Err,
  fromPromise,
  Ok,
  type AppError,
  type Result,
} from "@achados/core";
import { users } from "@achados/db";
import { eq } from "drizzle-orm";
import sharp from "sharp";

import { banco } from "@/shared/db/banco.servidor";
import { FOTO, FOTO_INVALIDA } from "./domain/foto";

/** Formatos que o decodificador aceita, conferidos pelo conteúdo, não pelo tipo declarado. */
const FORMATOS = new Set(["jpeg", "png", "webp"]);

/** Uma foto de 8000 x 8000 já é muito mais do que um avatar precisa. */
const PIXELS_MAXIMOS = 8000 * 8000;

/**
 * Regrava a foto enviada como o quadrado do avatar em WebP. O navegador já
 * recortou, mas aqui nada dele é confiado: a imagem é decodificada de novo,
 * girada pela orientação, cortada ao centro se não vier quadrada e gravada
 * sem metadados (EXIF, GPS, câmera), que o sharp descarta por padrão.
 */
export async function prepararFoto(
  arquivo: Blob
): Promise<Result<Uint8Array<ArrayBuffer>, AppError>> {
  const entrada = Buffer.from(await arquivo.arrayBuffer());
  try {
    const imagem = sharp(entrada, {
      limitInputPixels: PIXELS_MAXIMOS,
      failOn: "error",
      animated: false,
    });
    const { format } = await imagem.metadata();
    if (!format || !FORMATOS.has(format))
      return Err(
        AppErrors.validation(FOTO_INVALIDA, "Formato de foto não aceito.", {
          formato: format ?? "desconhecido",
        })
      );
    const saida = await imagem
      .rotate()
      .resize(FOTO.lado, FOTO.lado, { fit: "cover", position: "centre" })
      .webp({ quality: 86 })
      .toBuffer();
    return Ok(new Uint8Array(saida));
  } catch {
    return Err(
      AppErrors.validation(FOTO_INVALIDA, "Não foi possível ler a foto.")
    );
  }
}

/**
 * Grava a nova foto (ou nenhuma) na conta e devolve a anterior, lida e
 * trocada na mesma transação: dois envios ao mesmo tempo não perdem a
 * referência de qual arquivo apagar. A tabela de usuários é do Better Auth,
 * fora da RLS; o id vem sempre da sessão.
 */
export function trocarFotoDaConta(
  usuarioId: string,
  foto: string | null
): Promise<Result<string | null, AppError>> {
  return fromPromise(
    () =>
      banco().transaction(async (tx) => {
        const [atual] = await tx
          .select({ foto: users.image })
          .from(users)
          .where(eq(users.id, usuarioId))
          .for("update");
        await tx
          .update(users)
          .set({ image: foto })
          .where(eq(users.id, usuarioId));
        return atual?.foto ?? null;
      }),
    (causa) =>
      AppErrors.withContext(
        AppErrors.infrastructure(
          "FOTO_NAO_GRAVADA",
          "Falha ao gravar a foto na conta.",
          causa
        ),
        { module: "perfil", operation: "trocarFotoDaConta" }
      )
  );
}
