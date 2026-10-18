import "server-only";

import { AppErrors, Err, Ok, type AppError, type Result } from "@achados/core";
import { AwsClient } from "aws4fetch";

import type { ConfiguracaoDoArmazenamento } from "@/shared/config/ambiente";
import { ambienteServidor } from "@/shared/config/ambiente.servidor";

// O bucket do R2 pela API compatível com S3, com a requisição assinada aqui
// (SigV4). As chaves vêm do ambiente e nunca saem do servidor; a leitura é
// pela URL pública do bucket. Nenhuma mensagem leva chave, segredo ou corpo.

export const ARMAZENAMENTO_INDISPONIVEL = "ARMAZENAMENTO_INDISPONIVEL";

type Bucket = { cliente: AwsClient; config: ConfiguracaoDoArmazenamento };

let bucket: Bucket | undefined;

function abrirBucket(): Result<Bucket, AppError> {
  if (bucket) return Ok(bucket);
  const config = ambienteServidor().armazenamento;
  if (!config)
    return Err(
      AppErrors.infrastructure(
        ARMAZENAMENTO_INDISPONIVEL,
        "O armazenamento de arquivos não está configurado (R2_*)."
      )
    );
  bucket = {
    config,
    cliente: new AwsClient({
      accessKeyId: config.chaveDeAcesso,
      secretAccessKey: config.segredo,
      service: "s3",
      region: "auto",
    }),
  };
  return Ok(bucket);
}

function enderecoDoObjeto({ config }: Bucket, chave: string): string {
  return `https://${config.contaId}.r2.cloudflarestorage.com/${config.bucket}/${chave}`;
}

/** O endereço público de uma chave: `{R2_PUBLIC_URL}/avatares/01J....webp`. */
export function urlPublicaDe(chave: string): Result<string, AppError> {
  const aberto = abrirBucket();
  if (!aberto.ok) return aberto;
  return Ok(`${aberto.value.config.urlPublica}/${chave}`);
}

/** A chave de uma URL pública deste bucket; de outro endereço, nada. */
export function chaveDaUrlPublica(url: string): string | undefined {
  const aberto = abrirBucket();
  if (!aberto.ok) return undefined;
  const base = `${aberto.value.config.urlPublica}/`;
  return url.startsWith(base) ? url.slice(base.length) : undefined;
}

async function pedir(
  operacao: string,
  chave: string,
  init: RequestInit
): Promise<Result<void, AppError>> {
  const aberto = abrirBucket();
  if (!aberto.ok) return aberto;
  try {
    const resposta = await aberto.value.cliente.fetch(
      enderecoDoObjeto(aberto.value, chave),
      init
    );
    if (resposta.ok || (init.method === "DELETE" && resposta.status === 404))
      return Ok(undefined);
    return Err(
      AppErrors.integration(
        "R2_RECUSOU",
        `O R2 recusou ${operacao} (${resposta.status}).`
      )
    );
  } catch (causa) {
    return Err(
      AppErrors.integration("R2_INDISPONIVEL", `Falha ao ${operacao}.`, causa)
    );
  }
}

/** Grava um objeto. A chave é de quem chama; aqui não se gera nome. */
export function guardarObjeto(
  chave: string,
  corpo: Uint8Array<ArrayBuffer>,
  tipo: string,
  cacheControl: string
): Promise<Result<void, AppError>> {
  return pedir("gravar o objeto", chave, {
    method: "PUT",
    body: corpo,
    headers: {
      "Content-Type": tipo,
      "Content-Length": String(corpo.byteLength),
      "Cache-Control": cacheControl,
    },
  });
}

/** Apaga um objeto. Já não existir conta como apagado. */
export function apagarObjeto(chave: string): Promise<Result<void, AppError>> {
  return pedir("apagar o objeto", chave, { method: "DELETE" });
}
