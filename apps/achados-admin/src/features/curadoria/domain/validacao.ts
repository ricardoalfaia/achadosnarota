import { AppErrors, Err, Ok, type Result } from "@achados/core";
import type { Criterio, ReviewStatus, Seal } from "@achados/db";
import { z } from "zod";

import type { Pendencia } from "@/shared/cadastro/pendencias";
import {
  CRITERIOS_DA_CURADORIA,
  lerNota,
  notasAvaliadas,
  type NotasDosCriterios,
} from "./criterios";
import type { DadosDaAvaliacao } from "./tipos";

export const SECOES_DA_AVALIACAO = ["visita", "notas", "parecer"] as const;
export type SecaoDaAvaliacao = (typeof SECOES_DA_AVALIACAO)[number];
export type CampoDaAvaliacao =
  Exclude<keyof DadosDaAvaliacao, "notas"> | `nota.${Criterio}` | "notas";
export type PendenciaDaAvaliacao = Pendencia<
  CampoDaAvaliacao,
  SecaoDaAvaliacao
>;

/**
 * Situações que a equipe escolhe. "Substituída" é automática: publicar uma
 * avaliação nova substitui a anterior da mesma casa.
 */
export const SITUACOES_DA_EQUIPE: readonly ReviewStatus[] = [
  "draft",
  "in_review",
  "approved",
  "published",
  "withdrawn",
];

export function pendenciasDaAvaliacao(
  dados: DadosDaAvaliacao,
  hoje: string
): PendenciaDaAvaliacao[] {
  const pendencias: PendenciaDaAvaliacao[] = [];
  const falta = (
    campo: CampoDaAvaliacao,
    secao: SecaoDaAvaliacao,
    motivo: string
  ) => pendencias.push({ campo, secao, motivo });

  if (!dados.casaId) falta("casaId", "visita", "Escolha a casa visitada");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.visitadaEm))
    falta("visitadaEm", "visita", "Informe a data da visita");
  else if (dados.visitadaEm > hoje)
    falta("visitadaEm", "visita", "A visita não pode ser no futuro");
  if (!SITUACOES_DA_EQUIPE.includes(dados.status))
    falta("status", "visita", "Escolha uma situação válida");

  for (const { chave } of CRITERIOS_DA_CURADORIA) {
    const texto = dados.notas[chave];
    if (texto.trim() && lerNota(texto) === null)
      falta(`nota.${chave}`, "notas", "De 0 a 5, com uma casa");
  }
  if (notasAvaliadas(dados.notas).length === 0)
    falta("notas", "notas", "Dê nota a pelo menos um critério");

  const parecer = dados.parecer.trim();
  if (!parecer) falta("parecer", "parecer", "Escreva o parecer");
  else if (parecer.length > 1200)
    falta("parecer", "parecer", "Use até 1.200 caracteres");

  return pendencias;
}

export function novasNotas(): NotasDosCriterios {
  return {
    hygiene: "",
    presentation: "",
    flavor: "",
    sophistication: "",
    service: "",
    ambience: "",
    value: "",
  };
}

export function novaAvaliacao(): DadosDaAvaliacao {
  return {
    casaId: "",
    visitadaEm: "",
    notas: novasNotas(),
    parecer: "",
    ressalvas: "",
    achado: "",
    dicas: "",
    selo: null,
    status: "draft",
  };
}

export const DADOS_DA_AVALIACAO_INVALIDOS = "DADOS_DA_AVALIACAO_INVALIDOS";

const STATUS: readonly [ReviewStatus, ...ReviewStatus[]] = [
  "draft",
  "in_review",
  "approved",
  "published",
  "superseded",
  "withdrawn",
];
const SELOS: readonly [Seal, ...Seal[]] = [
  "featured",
  "beloved",
  "verified",
  "new",
];
const nota = z.string().trim().max(4);

const esquema = z.object({
  casaId: z.string().trim().max(40),
  visitadaEm: z.string().trim().max(10),
  notas: z.object({
    hygiene: nota,
    presentation: nota,
    flavor: nota,
    sophistication: nota,
    service: nota,
    ambience: nota,
    value: nota,
  }),
  parecer: z.string().trim().max(5000),
  ressalvas: z.string().trim().max(2000),
  achado: z.string().trim().max(300),
  dicas: z.string().trim().max(2000),
  selo: z.enum(SELOS).nullable(),
  status: z.enum(STATUS),
});

/** Formato (zod) e regras (pendências) do que chegou do navegador. */
export function lerDadosDaAvaliacao(
  entrada: unknown,
  hoje: string
): Result<DadosDaAvaliacao> {
  const lido = esquema.safeParse(entrada);
  if (!lido.success)
    return Err(
      AppErrors.validation(
        DADOS_DA_AVALIACAO_INVALIDOS,
        "Dados da avaliação inválidos."
      )
    );
  const pendencias = pendenciasDaAvaliacao(lido.data, hoje);
  if (pendencias.length > 0)
    return Err(
      AppErrors.validation(
        DADOS_DA_AVALIACAO_INVALIDOS,
        "Há campos para corrigir antes de salvar.",
        { pendencias }
      )
    );
  return Ok(lido.data);
}
