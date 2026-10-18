import { AppErrors, Err, Ok, type Result } from "@achados/core";
import { z } from "zod";

import type { Pendencia } from "@/shared/cadastro/pendencias";
import { problemasDoHorario } from "./horario";
import type { DadosDaCasa, StatusDaCasa } from "./tipos";

// Regras do cadastro de casa. As mesmas funções servem ao formulário
// (conveniência) e à Action, que valida de novo e é a autoridade.

export const SECOES_DA_CASA = [
  "dados",
  "local",
  "horario",
  "fotos",
  "publicacao",
] as const;
export type SecaoDaCasa = (typeof SECOES_DA_CASA)[number];

export type CampoDaCasa = keyof DadosDaCasa | "fotos";
export type PendenciaDaCasa = Pendencia<CampoDaCasa, SecaoDaCasa>;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_DO_SITE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

/**
 * O que falta ou está errado. `fotos` é a quantidade de fotos: publicar exige
 * pelo menos uma, porque a ficha pública abre pela foto.
 */
export function pendenciasDaCasa(
  dados: DadosDaCasa,
  fotos: number
): PendenciaDaCasa[] {
  const pendencias: PendenciaDaCasa[] = [];
  const falta = (campo: CampoDaCasa, secao: SecaoDaCasa, motivo: string) =>
    pendencias.push({ campo, secao, motivo });

  const nome = dados.nome.trim();
  if (!nome) falta("nome", "dados", "Informe o nome da casa");
  else if (nome.length > 80) falta("nome", "dados", "Use até 80 caracteres");

  if (!dados.slug) falta("slug", "dados", "Informe o endereço da ficha");
  else if (!SLUG.test(dados.slug))
    falta("slug", "dados", "Só letras minúsculas, números e hífen");

  if (!dados.categoriaId) falta("categoriaId", "dados", "Escolha a categoria");
  if (!dados.especialidade.trim())
    falta("especialidade", "dados", "Informe a especialidade");
  else if (dados.especialidade.length > 60)
    falta("especialidade", "dados", "Use até 60 caracteres");

  const resumo = dados.resumo.trim();
  if (!resumo) falta("resumo", "dados", "Escreva o resumo do cartão");
  else if (resumo.length > 200)
    falta("resumo", "dados", "Use até 200 caracteres");

  if (!dados.cidadeId) falta("cidadeId", "local", "Escolha a cidade");
  if (dados.telefone && !/^\d{10,13}$/.test(dados.telefone))
    falta("telefone", "local", "Telefone com DDD, só números");
  if (dados.site && !URL_DO_SITE.test(dados.site))
    falta("site", "local", "Endereço começando com https://");

  for (const { motivo } of problemasDoHorario(dados.horarios))
    falta("horarios", "horario", motivo);
  if (dados.observacaoDoHorario.length > 200)
    falta("observacaoDoHorario", "horario", "Use até 200 caracteres");

  if (dados.status === "published" && fotos === 0)
    falta("fotos", "fotos", "Publicar exige pelo menos uma foto");

  return pendencias;
}

/** Os padrões da inclusão: rascunho, sem nada preenchido. */
export function novaCasa(): DadosDaCasa {
  return {
    nome: "",
    slug: "",
    categoriaId: "",
    cidadeId: "",
    especialidade: "",
    resumo: "",
    descricao: "",
    tags: [],
    endereco: "",
    telefone: "",
    site: "",
    horarios: [],
    observacaoDoHorario: "",
    status: "draft",
  };
}

const texto = z.string().trim();
const STATUS: readonly [StatusDaCasa, ...StatusDaCasa[]] = [
  "draft",
  "published",
  "archived",
];

const esquema = z.object({
  nome: texto.max(200),
  slug: texto.max(120),
  categoriaId: texto.max(40),
  cidadeId: texto.max(40),
  especialidade: texto.max(200),
  resumo: texto.max(1000),
  descricao: texto.max(10_000),
  tags: z.array(texto.min(1).max(40)).max(12),
  endereco: texto.max(300),
  telefone: texto.max(20),
  site: texto.max(300),
  horarios: z
    .array(
      z.object({
        dia: z.number().int().min(0).max(6),
        abre: z.string().max(5),
        fecha: z.string().max(5),
      })
    )
    .max(14),
  observacaoDoHorario: texto.max(1000),
  status: z.enum(STATUS),
});

export const DADOS_DA_CASA_INVALIDOS = "DADOS_DA_CASA_INVALIDOS";
export const SLUG_EM_USO = "SLUG_EM_USO";

/**
 * Lê o que chegou do navegador: formato (zod) e regras (pendências). A
 * resposta de recusa traz as pendências, sem ecoar os valores enviados.
 */
export function lerDadosDaCasa(
  entrada: unknown,
  fotos: number
): Result<DadosDaCasa> {
  const lido = esquema.safeParse(entrada);
  if (!lido.success)
    return Err(
      AppErrors.validation(DADOS_DA_CASA_INVALIDOS, "Dados da casa inválidos.")
    );
  const dados = {
    ...lido.data,
    telefone: lido.data.telefone.replace(/\D/g, ""),
  };
  const pendencias = pendenciasDaCasa(dados, fotos);
  if (pendencias.length > 0)
    return Err(
      AppErrors.validation(
        DADOS_DA_CASA_INVALIDOS,
        "Há campos para corrigir antes de salvar.",
        { pendencias }
      )
    );
  return Ok(dados);
}
