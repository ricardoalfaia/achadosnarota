import Image from "next/image";
import { EstadoVazio, Etiqueta, Nota } from "@achados/ui";
import {
  CalendarDays,
  Crown,
  Globe,
  Images,
  MapPin,
  MessageSquareQuote,
  Phone,
  TriangleAlert,
} from "lucide-react";

import {
  hrefDoTelefone,
  mesDaVisita,
  siteParaExibir,
  telefoneParaExibir,
} from "../domain/apresentacao";
import type { Avaliacao, FichaDoLugar, Foto } from "../domain/tipos";

/** Selo âmbar com a coroa: o lugar tem avaliação editorial publicada. */
export function SeloDaCuradoria() {
  return (
    <Etiqueta tom="acento" icone={<Crown className="text-star" />}>
      Curadoria Achados na Rota
    </Etiqueta>
  );
}

/**
 * A aba Avaliações: o parecer da curadoria, a data da visita e as ressalvas
 * (docs/produto/05). Não há avaliações abertas de usuários no MVP; a nota é a
 * da visita editorial, e a tela diz isso.
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
    <section aria-labelledby="titulo-avaliacao" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="titulo-avaliacao" className="text-sm font-extrabold">
          Avaliação da curadoria
        </h2>
        <Nota valor={avaliacao.nota} tamanho="md" />
      </div>
      <blockquote className="rounded-2xl border border-border bg-surface-raised p-4 text-sm leading-relaxed text-foreground">
        {avaliacao.parecer}
      </blockquote>
      {avaliacao.ressalvas && (
        <p className="flex items-start gap-2 rounded-2xl border border-warning-border bg-warning-subtle p-3 text-xs text-warning">
          <TriangleAlert aria-hidden="true" className="mt-px size-4 shrink-0" />
          <span>
            <strong className="font-bold">Bom saber:</strong>{" "}
            {avaliacao.ressalvas}
          </span>
        </p>
      )}
      <p className="flex items-center gap-1.5 text-xs text-foreground-muted">
        <CalendarDays aria-hidden="true" className="size-3.5" />
        Visita da curadoria em {mesDaVisita(avaliacao.visitadoEm)}
      </p>
      <p className="text-[11px] leading-relaxed text-foreground-muted">
        A nota resume critérios públicos avaliados na visita. Estabelecimentos
        não pagam por notas, selos ou posição.
      </p>
    </section>
  );
}

/** A aba Fotos: a galeria em grade, com a primeira foto em destaque. */
export function GaleriaDeFotos({ fotos }: { fotos: readonly Foto[] }) {
  if (fotos.length === 0) {
    return (
      <EstadoVazio
        icone={<Images />}
        titulo="Sem fotos por enquanto"
        className="py-8"
      />
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-2">
      {fotos.map((foto, indice) => (
        <li
          key={foto.url}
          className={
            indice === 0
              ? "relative col-span-2 aspect-[16/10] overflow-hidden rounded-2xl"
              : "relative aspect-square overflow-hidden rounded-2xl"
          }
        >
          <Image
            src={foto.url}
            alt={foto.alt}
            fill
            sizes={indice === 0 ? "480px" : "240px"}
            className="object-cover"
          />
        </li>
      ))}
    </ul>
  );
}

/** A aba Sobre: descrição, endereço, telefone e site, quando houver. */
export function SobreOLugar({
  lugar,
}: {
  lugar: Pick<
    FichaDoLugar,
    "descricao" | "resumo" | "endereco" | "telefone" | "site"
  >;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-foreground">
        {lugar.descricao ?? lugar.resumo}
      </p>
      <dl className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface text-sm">
        {lugar.endereco && (
          <div className="flex items-start gap-3 p-3">
            <dt className="sr-only">Endereço</dt>
            <MapPin
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-brand"
            />
            <dd>{lugar.endereco}</dd>
          </div>
        )}
        {lugar.telefone && (
          <div className="flex items-center gap-3 p-3">
            <dt className="sr-only">Telefone</dt>
            <Phone aria-hidden="true" className="size-4 shrink-0 text-brand" />
            <dd>
              <a
                href={hrefDoTelefone(lugar.telefone)}
                className="text-primary underline-offset-2 hover:underline"
              >
                {telefoneParaExibir(lugar.telefone)}
              </a>
            </dd>
          </div>
        )}
        {lugar.site && (
          <div className="flex items-center gap-3 p-3">
            <dt className="sr-only">Site</dt>
            <Globe aria-hidden="true" className="size-4 shrink-0 text-brand" />
            <dd className="min-w-0">
              <a
                href={lugar.site}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-primary underline-offset-2 hover:underline"
              >
                {siteParaExibir(lugar.site)}
              </a>
            </dd>
          </div>
        )}
      </dl>
      <p className="text-[11px] text-foreground-muted">
        Horários e condições podem mudar. Confirme com o estabelecimento antes
        de ir.
      </p>
    </div>
  );
}
