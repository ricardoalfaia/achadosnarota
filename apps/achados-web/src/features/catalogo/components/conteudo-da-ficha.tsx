import Image from "next/image";
import Link from "next/link";
import { EstadoVazio, Etiqueta } from "@achados/ui";
import { Crown, Globe, Images, MapPin, Phone } from "lucide-react";

import {
  hrefDoTelefone,
  siteParaExibir,
  telefoneParaExibir,
} from "../domain/apresentacao";
import type { FichaDoLugar, Foto } from "../domain/tipos";

/** Selo âmbar com a coroa: o lugar tem avaliação editorial publicada. */
export function SeloDaCuradoria() {
  return (
    <Etiqueta tom="acento" icone={<Crown className="text-star" />}>
      Curadoria Achados na Rota
    </Etiqueta>
  );
}

/**
 * A faixa de fotos logo abaixo do nome: as primeiras miniaturas à vista e a
 * última com "+N", que leva à aba de fotos. As fotos não ficam escondidas.
 */
export function FaixaDeFotos({
  fotos,
  hrefDasFotos,
}: {
  fotos: readonly Foto[];
  hrefDasFotos: string;
}) {
  if (fotos.length < 2) return null;
  const visiveis = fotos.slice(1, 5);
  const restantes = fotos.length - 1 - visiveis.length;
  return (
    <ul
      aria-label="Fotos do lugar"
      className="-mx-4 scrollbar-none flex gap-2 overflow-x-auto px-4"
    >
      {visiveis.map((foto, indice) => {
        const ultima = indice === visiveis.length - 1 && restantes > 0;
        return (
          <li key={foto.url} className="shrink-0">
            <Link
              href={hrefDasFotos}
              scroll={false}
              className="relative block size-24 overflow-hidden rounded-2xl bg-surface-hover outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Image
                src={foto.url}
                alt={foto.alt}
                fill
                sizes="96px"
                className="object-cover"
              />
              {ultima && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-extrabold text-white">
                  +{restantes}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
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
