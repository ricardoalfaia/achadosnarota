// Assinantes vistos pela administração: tipos e regras puras da tela (dados
// mínimos, docs/produto/04). Sem React, Next nem banco.

/**
 * A situação do passaporte de uma pessoa, calculada no banco:
 *   - `pago`: assinatura ativa e vigente;
 *   - `cortesia`: sem assinatura vigente, cortesia vigente e não revogada;
 *   - `pendente`: assinatura aguardando pagamento ou atrasada;
 *   - `encerrado`: já teve passaporte (pago ou cortesia), hoje não tem;
 *   - `sem`: nunca teve.
 */
export const SITUACOES_DO_ASSINANTE = [
  "pago",
  "cortesia",
  "pendente",
  "encerrado",
  "sem",
] as const;
export type SituacaoDoAssinante = (typeof SITUACOES_DO_ASSINANTE)[number];

export const TODOS = "todos";
export type FiltroDeSituacao = SituacaoDoAssinante | typeof TODOS;

export const SITUACAO: Record<
  SituacaoDoAssinante,
  {
    rotulo: string;
    plural: string;
    intencao: "sucesso" | "destaque" | "atencao" | "neutro" | "primario";
  }
> = {
  pago: { rotulo: "Passaporte pago", plural: "Pagos", intencao: "sucesso" },
  cortesia: { rotulo: "Cortesia", plural: "Cortesia", intencao: "destaque" },
  pendente: { rotulo: "Pendente", plural: "Pendentes", intencao: "atencao" },
  encerrado: {
    rotulo: "Encerrado",
    plural: "Encerrados",
    intencao: "neutro",
  },
  sem: {
    rotulo: "Sem passaporte",
    plural: "Sem passaporte",
    intencao: "primario",
  },
};

/** Uma linha da listagem. O e-mail já vem mascarado do servidor. */
export type AssinanteDaLista = {
  id: string;
  nome: string;
  emailMascarado: string;
  situacao: SituacaoDoAssinante;
  /** Fim do passaporte vigente (pago ou cortesia), se houver. ISO. */
  validoAte: string | null;
  beneficiosUsados: number;
  /** ISO. */
  desde: string;
};

export type PaginaDeAssinantes = {
  linhas: AssinanteDaLista[];
  /** Para pedir a próxima página; `null` quando acabou. */
  proximo: string | null;
  /** Só na primeira página: quantas pessoas em cada situação, com a busca. */
  contagem: Record<FiltroDeSituacao, number> | null;
};

export type ResumoDosAssinantes = {
  pagos: number;
  cortesias: number;
  pendentes: number;
  /** Passaportes (pagos ou cortesia) que acabam nos próximos 7 dias. */
  vencemEmBreve: number;
};

export type AssinaturaDaFicha = {
  plano: string;
  situacao: string;
  inicio: string | null;
  fim: string | null;
};

export type CortesiaDaFicha = {
  inicio: string;
  fim: string;
  liberadaPor: string;
  revogadaEm: string | null;
  revogadaPor: string | null;
};

export type FichaDoAssinante = {
  id: string;
  nome: string;
  /** Completo só aqui, na ficha aberta pela administração (auditada). */
  email: string;
  desde: string;
  situacao: SituacaoDoAssinante;
  validoAte: string | null;
  assinaturas: AssinaturaDaFicha[];
  cortesia: CortesiaDaFicha | null;
  beneficiosUsados: number;
  ultimoUso: string | null;
};

/** "ana.souza@gmail.com" → "an•••@gmail.com". O domínio ajuda o atendimento. */
export function mascararEmail(email: string): string {
  const arroba = email.lastIndexOf("@");
  if (arroba <= 0) return "•••";
  const usuario = email.slice(0, arroba);
  const visivel =
    usuario.length <= 2 ? usuario.slice(0, 1) : usuario.slice(0, 2);
  return `${visivel}•••${email.slice(arroba)}`;
}

/** O texto da busca como o servidor aceita: sem espaços sobrando, até 80 caracteres. */
export function lerBusca(valor: unknown): string {
  return typeof valor === "string" ? valor.trim().slice(0, 80) : "";
}

export function lerSituacaoDoAssinante(valor: unknown): FiltroDeSituacao {
  return SITUACOES_DO_ASSINANTE.find((s) => s === valor) ?? TODOS;
}

/** `%` e `_` digitados valem como texto, não como curinga do LIKE. */
export function padraoDeBusca(busca: string): string {
  return `%${busca.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export type Cursor = { desde: Date; id: string };

/** O ponto em que a página seguinte começa (mais recentes primeiro). */
export function codificarCursor({ desde, id }: Cursor): string {
  return Buffer.from(`${desde.toISOString()}|${id}`).toString("base64url");
}

export function lerCursor(valor: unknown): Cursor | null {
  if (typeof valor !== "string" || valor.length > 100) return null;
  const texto = Buffer.from(valor, "base64url").toString("utf8");
  const [iso, id] = texto.split("|");
  const desde = new Date(iso ?? "");
  if (
    !id ||
    !/^[0-9A-HJKMNP-TV-Z]{26}$/.test(id) ||
    Number.isNaN(desde.getTime())
  )
    return null;
  return { desde, id };
}

const DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

/** ISO → "16/10/2026", no fuso de Brasília. */
export function dataCurta(iso: string): string {
  return DATA.format(new Date(iso));
}

/** Rótulo das situações de assinatura no histórico da ficha. */
export const SITUACAO_DA_ASSINATURA: Record<string, string> = {
  pending: "Aguardando pagamento",
  active: "Ativa",
  past_due: "Pagamento atrasado",
  canceled: "Cancelada",
  expired: "Vencida",
  refunded: "Reembolsada",
};

/** Por que a cortesia não pode ser liberada agora; `null` quando pode. */
export function impedimentoDaCortesia(
  ficha: Pick<FichaDoAssinante, "situacao" | "cortesia">
): string | null {
  if (ficha.cortesia)
    return "Esta pessoa já recebeu a cortesia (uma por pessoa).";
  if (ficha.situacao === "pago")
    return "Esta pessoa já tem o passaporte pago ativo.";
  return null;
}
