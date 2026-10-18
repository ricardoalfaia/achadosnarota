import { AppErrors, Err, Ok, type Result } from "@achados/core";
import { z } from "zod";

import type { Pendencia } from "@/shared/cadastro/pendencias";
import type {
  DadosDaPromocao,
  PeriodoDeUso,
  StatusDaPromocao,
  TipoDaPromocao,
} from "./tipos";

// Regras do cadastro de promoção: o formulário usa por conveniência, a Action
// valida de novo. Condições explícitas antes do resgate (README de produto,
// princípio 3): promoção ativa precisa de termos claros.

export const SECOES_DA_PROMOCAO = ["oferta", "regras", "publicacao"] as const;
export type SecaoDaPromocao = (typeof SECOES_DA_PROMOCAO)[number];
export type CampoDaPromocao = keyof DadosDaPromocao;
export type PendenciaDaPromocao = Pendencia<CampoDaPromocao, SecaoDaPromocao>;

/** Situações que a equipe escolhe; "Encerrada" vem do fim da vigência. */
export const SITUACOES_EDITAVEIS: readonly StatusDaPromocao[] = [
  "draft",
  "pending_review",
  "active",
  "paused",
  "archived",
];

export function pendenciasDaPromocao(
  dados: DadosDaPromocao,
  { casaPublicada }: { casaPublicada: boolean }
): PendenciaDaPromocao[] {
  const pendencias: PendenciaDaPromocao[] = [];
  const falta = (
    campo: CampoDaPromocao,
    secao: SecaoDaPromocao,
    motivo: string
  ) => pendencias.push({ campo, secao, motivo });

  if (!dados.casaId) falta("casaId", "oferta", "Escolha a casa");
  const titulo = dados.titulo.trim();
  if (!titulo) falta("titulo", "oferta", "Informe o título da promoção");
  else if (titulo.length > 80)
    falta("titulo", "oferta", "Use até 80 caracteres");

  const termos = dados.termos.trim();
  if (!termos) falta("termos", "regras", "Escreva as condições de uso");
  else if (termos.length > 600)
    falta("termos", "regras", "Use até 600 caracteres");

  if (
    dados.periodoDeUso !== "unlimited" &&
    (!Number.isInteger(dados.limitePorAssinante) ||
      dados.limitePorAssinante < 1 ||
      dados.limitePorAssinante > 99)
  )
    falta("limitePorAssinante", "regras", "De 1 a 99 usos por período");

  if (dados.vigencia && dados.vigencia.fim < dados.vigencia.inicio)
    falta("vigencia", "regras", "O fim vem depois do início");

  if (!SITUACOES_EDITAVEIS.includes(dados.status))
    falta("status", "publicacao", "Escolha uma situação válida");
  else if (dados.status === "active" && dados.casaId && !casaPublicada)
    falta("status", "publicacao", "Só casa publicada pode ter promoção ativa");

  return pendencias;
}

export function novaPromocao(casaId = ""): DadosDaPromocao {
  return {
    casaId,
    titulo: "",
    termos: "",
    tipo: "courtesy",
    icone: "gift",
    limitePorAssinante: 1,
    periodoDeUso: "year",
    vigencia: null,
    status: "draft",
  };
}

export const DADOS_DA_PROMOCAO_INVALIDOS = "DADOS_DA_PROMOCAO_INVALIDOS";

const DATA = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const TIPOS: readonly [TipoDaPromocao, ...TipoDaPromocao[]] = [
  "discount",
  "courtesy",
  "two_for_one",
];
const PERIODOS: readonly [PeriodoDeUso, ...PeriodoDeUso[]] = [
  "day",
  "week",
  "month",
  "year",
  "unlimited",
];
const STATUS: readonly [StatusDaPromocao, ...StatusDaPromocao[]] = [
  "draft",
  "pending_review",
  "active",
  "paused",
  "expired",
  "archived",
];

const esquema = z.object({
  casaId: z.string().trim().max(40),
  titulo: z.string().trim().max(200),
  termos: z.string().trim().max(2000),
  tipo: z.enum(TIPOS),
  icone: z.string().trim().min(1).max(30),
  limitePorAssinante: z.number().int(),
  periodoDeUso: z.enum(PERIODOS),
  vigencia: z.object({ inicio: DATA, fim: DATA }).nullable(),
  status: z.enum(STATUS),
});

/** Formato (zod) e regras (pendências) do que chegou do navegador. */
export function lerDadosDaPromocao(
  entrada: unknown,
  contexto: { casaPublicada: (casaId: string) => boolean }
): Result<DadosDaPromocao> {
  const lido = esquema.safeParse(entrada);
  if (!lido.success)
    return Err(
      AppErrors.validation(
        DADOS_DA_PROMOCAO_INVALIDOS,
        "Dados da promoção inválidos."
      )
    );
  const pendencias = pendenciasDaPromocao(lido.data, {
    casaPublicada: contexto.casaPublicada(lido.data.casaId),
  });
  if (pendencias.length > 0)
    return Err(
      AppErrors.validation(
        DADOS_DA_PROMOCAO_INVALIDOS,
        "Há campos para corrigir antes de salvar.",
        { pendencias }
      )
    );
  return Ok(lido.data);
}
