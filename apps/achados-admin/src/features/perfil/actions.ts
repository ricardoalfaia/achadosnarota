"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import {
  AppErrors,
  Err,
  Ok,
  toActionResult,
  type ActionResult,
  type AppError,
  type Result,
} from "@achados/core";
import { novoId } from "@achados/db";

import {
  apagarObjeto,
  chaveDaUrlPublica,
  guardarObjeto,
  urlPublicaDe,
} from "@/shared/armazenamento/r2.servidor";
import { equipeDoPedido } from "@/shared/sessao/sessao.servidor";
import { SESSAO_NECESSARIA } from "./domain/erros";
import { chaveDaFoto, ehChaveDeFoto, lerArquivoDaFoto } from "./domain/foto";
import { prepararFoto, trocarFotoDaConta } from "./foto.servidor";

/** Um ano: cada foto tem nome novo, então o arquivo de um endereço nunca muda. */
const CACHE_DA_FOTO = "public, max-age=31536000, immutable";

/** Só a equipe logada (com 2FA e papel) troca a própria foto no painel. */
async function idDaSessao(): Promise<Result<string, AppError>> {
  const pessoa = await equipeDoPedido();
  if (!pessoa.ok)
    return Err(
      AppErrors.security(SESSAO_NECESSARIA, "Entre para mudar a foto.")
    );
  return Ok(pessoa.value.id);
}

/** Depois da resposta, apaga do bucket a foto que saiu da conta, se for nossa. */
function apagarDepois(anterior: string | null) {
  const chave = anterior ? chaveDaUrlPublica(anterior) : undefined;
  if (!ehChaveDeFoto(chave)) return;
  after(async () => {
    const apagado = await apagarObjeto(chave);
    if (!apagado.ok)
      console.error(`[perfil] foto antiga não apagada: ${apagado.error.code}`);
  });
}

/**
 * Troca a foto do perfil (ADR-0006: comando por Action). Quem é a pessoa vem
 * da sessão; o arquivo é conferido e regravado no servidor antes de ir ao
 * bucket, com um nome novo que não diz nada sobre ela.
 */
export async function trocarFoto(
  dados: FormData
): Promise<ActionResult<{ fotoUrl: string }>> {
  const arquivo = lerArquivoDaFoto(dados.get("foto"));
  if (!arquivo.ok) return toActionResult(arquivo);

  const usuarioId = await idDaSessao();
  if (!usuarioId.ok) return toActionResult(usuarioId);

  const chave = chaveDaFoto(novoId());
  const url = urlPublicaDe(chave);
  if (!url.ok) return toActionResult(url);

  const foto = await prepararFoto(arquivo.value);
  if (!foto.ok) return toActionResult(foto);

  const enviado = await guardarObjeto(
    chave,
    foto.value,
    "image/webp",
    CACHE_DA_FOTO
  );
  if (!enviado.ok) return toActionResult(enviado);

  const trocada = await trocarFotoDaConta(usuarioId.value, url.value);
  if (!trocada.ok) {
    // A conta não aponta para o arquivo novo: ele não fica órfão no bucket.
    after(() => apagarObjeto(chave));
    return toActionResult(trocada);
  }

  apagarDepois(trocada.value);
  revalidatePath("/", "layout");
  return toActionResult(Ok({ fotoUrl: url.value }));
}

/** Tira a foto do perfil: o avatar volta às iniciais. */
export async function removerFoto(): Promise<ActionResult<null>> {
  const usuarioId = await idDaSessao();
  if (!usuarioId.ok) return toActionResult(usuarioId);

  const trocada = await trocarFotoDaConta(usuarioId.value, null);
  if (!trocada.ok) return toActionResult(trocada);

  apagarDepois(trocada.value);
  revalidatePath("/", "layout");
  return toActionResult(Ok(null));
}
