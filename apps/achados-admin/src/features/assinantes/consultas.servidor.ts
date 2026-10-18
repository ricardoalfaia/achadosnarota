import "server-only";

import { AppErrors, Err, Ok, type AppError, type Result } from "@achados/core";
import { ehUlid, type Tx } from "@achados/db";
import { sql, type SQL } from "drizzle-orm";

import { auditar, naEquipe } from "@/shared/db/equipe.servidor";
import type { PessoaDaEquipe } from "@/shared/sessao/sessao";
import {
  codificarCursor,
  mascararEmail,
  padraoDeBusca,
  SITUACOES_DO_ASSINANTE,
  TODOS,
  type Cursor,
  type FichaDoAssinante,
  type FiltroDeSituacao,
  type PaginaDeAssinantes,
  type ResumoDosAssinantes,
  type SituacaoDoAssinante,
} from "./domain/assinantes";

// Assinantes: só a administração lê (RLS em subscription e courtesy; a tela
// confere antes, para responder com a recusa certa). A busca, a situação e a
// paginação acontecem no banco: a lista nunca vem inteira. O e-mail sai
// mascarado na listagem; completo, só na ficha, e a abertura dela fica na
// auditoria (sem dado pessoal no registro).

export const TAMANHO_DA_PAGINA = 50;

export const SO_ADMINISTRACAO = "ASSINANTES_SO_ADMINISTRACAO";

function soAdministracao(pessoa: PessoaDaEquipe): Result<null, AppError> {
  return pessoa.papel === "administrador"
    ? Ok(null)
    : Err(
        AppErrors.security(
          SO_ADMINISTRACAO,
          "Só a administração consulta os assinantes."
        )
      );
}

/** A situação de cada pessoa, a mesma regra do app ao emitir o código. */
const SITUACAO_SQL = sql`case
  when exists (select 1 from subscription s where s.user_id = u.id and s.status = 'active' and s.starts_at <= now() and s.ends_at > now()) then 'pago'
  when exists (select 1 from courtesy c where c.user_id = u.id and c.revoked_at is null and c.starts_at <= now() and c.ends_at > now()) then 'cortesia'
  when exists (select 1 from subscription s where s.user_id = u.id and s.status in ('pending', 'past_due')) then 'pendente'
  when exists (select 1 from subscription s where s.user_id = u.id) or exists (select 1 from courtesy c where c.user_id = u.id) then 'encerrado'
  else 'sem'
end`;

/** O fim do passaporte vigente, pago ou cortesia. */
const VALIDO_ATE_SQL = sql`greatest(
  (select max(s.ends_at) from subscription s where s.user_id = u.id and s.status = 'active' and s.starts_at <= now() and s.ends_at > now()),
  (select max(c.ends_at) from courtesy c where c.user_id = u.id and c.revoked_at is null and c.starts_at <= now() and c.ends_at > now())
)`;

const USOS_SQL = sql`(select count(*)::int from redemption r where r.user_id = u.id and r.status = 'redeemed')`;

/** As pessoas com a situação calculada, já filtradas pela busca. */
function base(busca: string): SQL {
  const filtro = busca
    ? sql`where u.name ilike ${padraoDeBusca(busca)} or u.email ilike ${padraoDeBusca(busca)}`
    : sql``;
  return sql`select u.id, u.name, u.email, u.created_at, ${SITUACAO_SQL} as situacao from "user" u ${filtro}`;
}

type LinhaDaBase = {
  id: string;
  name: string;
  email: string;
  created_at: Date | string;
  situacao: SituacaoDoAssinante;
  valido_ate: Date | string | null;
  usos: number;
};

const iso = (data: Date | string) => new Date(data).toISOString();

export async function listarAssinantes({
  busca,
  situacao,
  cursor,
}: {
  busca: string;
  situacao: FiltroDeSituacao;
  cursor: Cursor | null;
}): Promise<Result<PaginaDeAssinantes>> {
  return naEquipe(async (tx, pessoa) => {
    const permitido = soAdministracao(pessoa);
    if (!permitido.ok) return permitido;

    const condicoes: SQL[] = [];
    if (situacao !== TODOS) condicoes.push(sql`b.situacao = ${situacao}`);
    if (cursor)
      condicoes.push(
        sql`(b.created_at, b.id) < (${cursor.desde.toISOString()}::timestamptz, ${cursor.id})`
      );
    const onde = condicoes.length
      ? sql`where ${sql.join(condicoes, sql` and `)}`
      : sql``;

    const linhas = (await tx.execute(sql`
      with b as (${base(busca)})
      select b.id, b.name, b.email, b.created_at, b.situacao,
        (select ${VALIDO_ATE_SQL} from "user" u where u.id = b.id) as valido_ate,
        (select ${USOS_SQL} from "user" u where u.id = b.id) as usos
      from b ${onde}
      order by b.created_at desc, b.id desc
      limit ${TAMANHO_DA_PAGINA + 1}
    `)) as unknown as LinhaDaBase[];

    const pagina = linhas.slice(0, TAMANHO_DA_PAGINA);
    const ultima = pagina.at(-1);
    return Ok({
      linhas: pagina.map((l) => ({
        id: l.id,
        nome: l.name,
        emailMascarado: mascararEmail(l.email),
        situacao: l.situacao,
        validoAte: l.valido_ate ? iso(l.valido_ate) : null,
        beneficiosUsados: Number(l.usos),
        desde: iso(l.created_at),
      })),
      proximo:
        linhas.length > TAMANHO_DA_PAGINA && ultima
          ? codificarCursor({
              desde: new Date(ultima.created_at),
              id: ultima.id,
            })
          : null,
      contagem: cursor ? null : await contagem(tx, busca),
    });
  });
}

async function contagem(
  tx: Tx,
  busca: string
): Promise<Record<FiltroDeSituacao, number>> {
  const linhas = (await tx.execute(sql`
    with b as (${base(busca)})
    select b.situacao, count(*)::int as total from b group by b.situacao
  `)) as unknown as { situacao: SituacaoDoAssinante; total: number }[];
  const resultado = Object.fromEntries(
    [TODOS, ...SITUACOES_DO_ASSINANTE].map((s) => [s, 0])
  ) as Record<FiltroDeSituacao, number>;
  for (const { situacao, total } of linhas) {
    resultado[situacao] = Number(total);
    resultado[TODOS] += Number(total);
  }
  return resultado;
}

/** Os números do topo da tela. */
export async function resumoDosAssinantes(): Promise<
  Result<ResumoDosAssinantes>
> {
  return naEquipe(async (tx, pessoa) => {
    const permitido = soAdministracao(pessoa);
    if (!permitido.ok) return permitido;
    const [linha] = (await tx.execute(sql`
      with b as (
        select ${SITUACAO_SQL} as situacao, ${VALIDO_ATE_SQL} as valido_ate
        from "user" u
      )
      select
        count(*) filter (where situacao = 'pago')::int as pagos,
        count(*) filter (where situacao = 'cortesia')::int as cortesias,
        count(*) filter (where situacao = 'pendente')::int as pendentes,
        count(*) filter (where valido_ate < now() + interval '7 days')::int as vencem
      from b
    `)) as unknown as {
      pagos: number;
      cortesias: number;
      pendentes: number;
      vencem: number;
    }[];
    return Ok({
      pagos: Number(linha?.pagos ?? 0),
      cortesias: Number(linha?.cortesias ?? 0),
      pendentes: Number(linha?.pendentes ?? 0),
      vencemEmBreve: Number(linha?.vencem ?? 0),
    });
  });
}

/**
 * A ficha de uma pessoa, com o e-mail completo. Abrir a ficha fica
 * registrado (quem viu e quando), sem o dado em si.
 */
export async function lerFichaDoAssinante(
  id: string
): Promise<Result<FichaDoAssinante>> {
  if (!ehUlid(id)) return Err(AppErrors.notFound("Assinante", "inválido"));
  return naEquipe(async (tx, pessoa) => {
    const permitido = soAdministracao(pessoa);
    if (!permitido.ok) return permitido;

    const [pessoaLida] = (await tx.execute(sql`
      select u.id, u.name, u.email, u.created_at,
        ${SITUACAO_SQL} as situacao, ${VALIDO_ATE_SQL} as valido_ate,
        ${USOS_SQL} as usos,
        (select max(r.redeemed_at) from redemption r where r.user_id = u.id and r.status = 'redeemed') as ultimo_uso
      from "user" u where u.id = ${id}
    `)) as unknown as (LinhaDaBase & { ultimo_uso: Date | string | null })[];
    if (!pessoaLida) return Err(AppErrors.notFound("Assinante", "inexistente"));

    const assinaturas = (await tx.execute(sql`
      select p.name as plano, s.status, s.starts_at, s.ends_at
      from subscription s join plan p on p.id = s.plan_id
      where s.user_id = ${id}
      order by s.created_at desc
    `)) as unknown as {
      plano: string;
      status: string;
      starts_at: Date | string | null;
      ends_at: Date | string | null;
    }[];

    const [cortesia] = (await tx.execute(sql`
      select c.starts_at, c.ends_at, c.revoked_at,
        g.name as liberada_por, rv.name as revogada_por
      from courtesy c
      join "user" g on g.id = c.granted_by
      left join "user" rv on rv.id = c.revoked_by
      where c.user_id = ${id}
    `)) as unknown as {
      starts_at: Date | string;
      ends_at: Date | string;
      revoked_at: Date | string | null;
      liberada_por: string;
      revogada_por: string | null;
    }[];

    await auditar(tx, pessoa, {
      acao: "assinante.consultado",
      entidade: "user",
      entidadeId: id,
    });

    return Ok({
      id: pessoaLida.id,
      nome: pessoaLida.name,
      email: pessoaLida.email,
      desde: iso(pessoaLida.created_at),
      situacao: pessoaLida.situacao,
      validoAte: pessoaLida.valido_ate ? iso(pessoaLida.valido_ate) : null,
      assinaturas: assinaturas.map((a) => ({
        plano: a.plano,
        situacao: a.status,
        inicio: a.starts_at ? iso(a.starts_at) : null,
        fim: a.ends_at ? iso(a.ends_at) : null,
      })),
      cortesia: cortesia
        ? {
            inicio: iso(cortesia.starts_at),
            fim: iso(cortesia.ends_at),
            liberadaPor: cortesia.liberada_por,
            revogadaEm: cortesia.revoked_at ? iso(cortesia.revoked_at) : null,
            revogadaPor: cortesia.revogada_por,
          }
        : null,
      beneficiosUsados: Number(pessoaLida.usos),
      ultimoUso: pessoaLida.ultimo_uso ? iso(pessoaLida.ultimo_uso) : null,
    });
  });
}
