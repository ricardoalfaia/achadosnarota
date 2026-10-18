import Link from "next/link";
import { EstadoVazio } from "@achados/ui";
import { cn, formatarNota } from "@achados/ui/estilos";
import {
  CalendarDays,
  ChevronRight,
  Lightbulb,
  MessageSquareQuote,
  Sparkles,
  Star,
  TriangleAlert,
} from "lucide-react";

import { mesDaVisita } from "../domain/apresentacao";
import {
  CRITERIO_MINIMO_DO_SELO,
  MEDIA_MINIMA_DO_SELO,
  type NotaDoCriterio,
} from "../domain/curadoria";
import type { Avaliacao } from "../domain/tipos";

/**
 * O emblema do Selo Achados na Rota: anel em degradê da marca, centro em
 * asfalto e a estrela. Decorativo; o texto ao lado diz o que ele significa.
 */
export function EmblemaDoSelo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="selo-anel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="0.55" stopColor="#f97316" />
          <stop offset="1" stopColor="#d4440f" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill="url(#selo-anel)" />
      <circle
        cx="32"
        cy="32"
        r="25.5"
        fill="#0a1e2e"
        stroke="#fde68a"
        strokeOpacity="0.5"
        strokeDasharray="2 2.6"
      />
      <path
        d="M32 17.5l4.3 8.8 9.7 1.4-7 6.8 1.7 9.6L32 39.6l-8.7 4.5 1.7-9.6-7-6.8 9.7-1.4z"
        fill="#fbbf24"
      />
      <text
        x="32"
        y="54"
        textAnchor="middle"
        fontSize="5.5"
        fontWeight="800"
        letterSpacing="1.2"
        fill="#fde68a"
      >
        APROVADO
      </text>
    </svg>
  );
}

/** As estrelas da nota geral, cheias até a nota arredondada. */
function Estrelas({ nota }: { nota: number }) {
  const cheias = Math.round(nota);
  return (
    <span aria-hidden="true" className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i <= cheias
              ? "fill-star text-star"
              : "fill-surface-hover text-surface-hover"
          )}
        />
      ))}
    </span>
  );
}

/**
 * O certificado do selo, no alto da ficha: o emblema e a regra pública que a
 * casa cumpriu. Só aparece para quem ganhou o selo.
 */
export function CertificadoDoSelo({ avaliacao }: { avaliacao: Avaliacao }) {
  return (
    <div
      data-theme="dark"
      className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-passport p-4 text-white shadow-lg"
    >
      <EmblemaDoSelo className="size-16 shrink-0 drop-shadow-lg" />
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-[0.16em] text-accent-on-dark uppercase">
          Selo Achados na Rota
        </p>
        <p className="mt-0.5 text-lg leading-tight font-extrabold">
          Aprovado pela curadoria
        </p>
        <p className="mt-1 text-xs leading-snug text-white/75">
          Visitamos em {mesDaVisita(avaliacao.visitadoEm)}: média{" "}
          {formatarNota(avaliacao.nota)} e nenhum critério abaixo de{" "}
          {formatarNota(CRITERIO_MINIMO_DO_SELO)}.
        </p>
      </div>
    </div>
  );
}

/**
 * O resumo da curadoria no corpo da ficha, antes das abas: o selo (se a casa
 * ganhou), a nota geral e o achado imperdível, com o caminho para a avaliação
 * completa. É o diferencial do produto; não fica escondido numa aba.
 */
export function ResumoDaCuradoria({
  avaliacao,
  hrefDaAvaliacao,
}: {
  avaliacao: Avaliacao;
  hrefDaAvaliacao: string;
}) {
  return (
    <section aria-labelledby="titulo-curadoria" className="flex flex-col gap-3">
      <h2 id="titulo-curadoria" className="sr-only">
        A curadoria
      </h2>
      {avaliacao.seloDaCuradoria && <CertificadoDoSelo avaliacao={avaliacao} />}
      <div className="rounded-3xl bg-surface p-4 ring-1 ring-border/60">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-foreground-muted">
              Nota da curadoria
            </p>
            <p className="flex items-center gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                {formatarNota(avaliacao.nota)}
              </span>
              <Estrelas nota={avaliacao.nota} />
            </p>
          </div>
          <Link
            href={hrefDaAvaliacao}
            scroll={false}
            className="flex items-center gap-0.5 text-sm font-bold text-primary"
          >
            Ver avaliação
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        {avaliacao.destaque && (
          <p className="mt-3 flex items-start gap-2.5 rounded-2xl bg-primary-subtle p-3 text-[15px] leading-snug text-foreground">
            <Sparkles
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-brand"
            />
            <span>
              <strong className="block text-xs font-bold tracking-wide text-primary uppercase">
                O achado imperdível
              </strong>
              {avaliacao.destaque}
            </span>
          </p>
        )}
      </div>
    </section>
  );
}

/** Uma barra por critério, com a nota ao lado. */
function BarrasDosCriterios({
  criterios,
}: {
  criterios: readonly NotaDoCriterio[];
}) {
  return (
    <ul aria-label="Notas por critério" className="flex flex-col gap-2.5">
      {criterios.map(({ chave, rotulo, nota }) => (
        <li
          key={chave}
          className="grid grid-cols-[10.5rem_1fr_2rem] items-center gap-3"
        >
          <span className="text-sm text-foreground">{rotulo}</span>
          <span
            aria-hidden="true"
            className="h-2 overflow-hidden rounded-full bg-surface-hover"
          >
            <span
              className="block h-full rounded-full bg-brand-gradient"
              style={{ width: `${(nota / 5) * 100}%` }}
            />
          </span>
          <span className="text-right text-sm font-bold text-foreground tabular-nums">
            <span className="sr-only">{rotulo}: </span>
            {formatarNota(nota)}
          </span>
        </li>
      ))}
    </ul>
  );
}

const TITULO_DO_BLOCO =
  "mb-2 flex items-center gap-2 text-base font-extrabold tracking-tight text-foreground [&_svg]:size-5 [&_svg]:text-brand";

/**
 * A aba Avaliação: as notas por critério, o achado imperdível, o que a
 * curadoria provou, as dicas e o que é bom saber, com a data da visita.
 * Sem avaliações abertas de usuários no MVP: tudo vem da visita editorial.
 */
export function AvaliacaoEditorial({
  avaliacao,
}: {
  avaliacao: Avaliacao | undefined;
}) {
  if (!avaliacao) {
    return (
      <EstadoVazio
        icone={<MessageSquareQuote />}
        titulo="Ainda sem avaliação publicada"
        descricao="A curadoria publica o parecer depois da visita e da revisão independente."
        className="py-8"
      />
    );
  }
  return (
    <section
      id="avaliacao"
      aria-labelledby="titulo-avaliacao"
      className="flex scroll-mt-4 flex-col gap-6"
    >
      <div>
        <h2 id="titulo-avaliacao" className={TITULO_DO_BLOCO}>
          Como avaliamos
        </h2>
        {avaliacao.criterios.length > 0 ? (
          <BarrasDosCriterios criterios={avaliacao.criterios} />
        ) : (
          <p className="text-sm text-foreground-muted">
            Nota geral {formatarNota(avaliacao.nota)}; as notas por critério
            entram na próxima visita.
          </p>
        )}
      </div>

      {avaliacao.destaque && (
        <div className="rounded-3xl bg-primary-subtle p-4">
          <h3 className={TITULO_DO_BLOCO}>
            <Sparkles aria-hidden="true" />O achado imperdível
          </h3>
          <p className="text-[15px] leading-relaxed text-foreground">
            {avaliacao.destaque}
          </p>
        </div>
      )}

      <div>
        <h3 className={TITULO_DO_BLOCO}>
          <MessageSquareQuote aria-hidden="true" />O que provamos
        </h3>
        <blockquote className="border-l-4 border-brand pl-4 text-[15px] leading-relaxed text-foreground">
          {avaliacao.parecer}
        </blockquote>
      </div>

      {avaliacao.dicas.length > 0 && (
        <div>
          <h3 className={TITULO_DO_BLOCO}>
            <Lightbulb aria-hidden="true" />
            Dicas da curadoria
          </h3>
          <ul className="flex flex-col gap-2">
            {avaliacao.dicas.map((dica) => (
              <li
                key={dica}
                className="flex items-start gap-3 rounded-2xl bg-surface p-3 text-[15px] leading-snug text-foreground ring-1 ring-border/60"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
                />
                {dica}
              </li>
            ))}
          </ul>
        </div>
      )}

      {avaliacao.ressalvas && (
        <p className="flex items-start gap-2.5 rounded-2xl border border-warning-border bg-warning-subtle p-3.5 text-sm leading-snug text-warning">
          <TriangleAlert aria-hidden="true" className="mt-px size-5 shrink-0" />
          <span>
            <strong className="font-bold">Bom saber:</strong>{" "}
            {avaliacao.ressalvas}
          </span>
        </p>
      )}

      <footer className="flex flex-col gap-1.5 border-t border-border pt-4 text-xs leading-relaxed text-foreground-muted">
        <span className="flex items-center gap-1.5">
          <CalendarDays aria-hidden="true" className="size-4" />
          Visita da curadoria em {mesDaVisita(avaliacao.visitadoEm)}
        </span>
        <span>
          O selo vai para quem tem média {formatarNota(MEDIA_MINIMA_DO_SELO)} ou
          mais e nenhum critério abaixo de{" "}
          {formatarNota(CRITERIO_MINIMO_DO_SELO)}. Estabelecimentos não pagam
          por notas, selos ou posição.
        </span>
      </footer>
    </section>
  );
}
