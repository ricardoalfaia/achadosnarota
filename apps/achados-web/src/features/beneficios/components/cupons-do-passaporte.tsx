"use client";

import Image from "next/image";
import Link from "next/link";
import { Aba, Abas, EstadoVazio, ListaDeAbas, PainelDaAba } from "@achados/ui";
import { ChevronRight, CircleCheck, History, MapPin } from "lucide-react";

import { IconeDoBeneficio } from "@/features/catalogo";
import { rotaDoLugar } from "@/shared/rotas";
import { dataEHora } from "../domain/codigo";
import type { BeneficioDisponivel, ItemDoHistorico } from "../domain/tipos";

type Filtro = "disponiveis" | "utilizados" | "expirados";

function ItemDisponivel({ beneficio }: { beneficio: BeneficioDisponivel }) {
  return (
    <li>
      <Link
        href={rotaDoLugar(beneficio.lugarSlug)}
        className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm transition-colors outline-none hover:border-primary-border focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-hover">
          {beneficio.foto ? (
            <Image
              src={beneficio.foto.url}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <IconeDoBeneficio
              chave={beneficio.icone}
              className="absolute inset-0 m-auto size-6 text-brand"
            />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-bold text-foreground">
            {beneficio.titulo}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-foreground-muted">
            {beneficio.lugarNome}
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-foreground-muted">
            <MapPin aria-hidden="true" className="size-3 text-brand" />
            {beneficio.local}
          </span>
        </span>
        <ChevronRight
          aria-hidden="true"
          className="size-4 shrink-0 text-brand"
        />
      </Link>
    </li>
  );
}

/** Um uso confirmado pelo garçom, ou um código que expirou sem uso. */
function ItemDoHistoricoDoPassaporte({ item }: { item: ItemDoHistorico }) {
  const usado = item.situacao === "usado";
  const conteudo = (
    <>
      <span
        aria-hidden="true"
        className={
          usado
            ? "flex size-11 shrink-0 items-center justify-center rounded-full bg-success-subtle text-success"
            : "flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-hover text-foreground-muted"
        }
      >
        {usado ? (
          <CircleCheck className="size-5" />
        ) : (
          <History className="size-5" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-foreground">
          {item.titulo}
        </span>
        {item.lugarNome && (
          <span className="block truncate text-xs text-foreground-muted">
            {item.lugarNome}
          </span>
        )}
        <span className="mt-0.5 block text-xs text-foreground-muted">
          {usado ? "Usado em" : "Expirou em"} {dataEHora(item.quando)}
        </span>
      </span>
    </>
  );
  return (
    <li>
      {item.lugarSlug ? (
        <Link
          href={rotaDoLugar(item.lugarSlug)}
          className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-border/60 outline-none focus-visible:outline-2 focus-visible:outline-ring"
        >
          {conteudo}
        </Link>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-border/60">
          {conteudo}
        </div>
      )}
    </li>
  );
}

/**
 * "Meus cupons" do passaporte: os benefícios disponíveis hoje e o histórico
 * real: usos confirmados pelo garçom e códigos que expiraram sem uso.
 */
export function CuponsDoPassaporte({
  disponiveis,
  historico = [],
}: {
  disponiveis: readonly BeneficioDisponivel[];
  /** Vazio para quem não entrou. */
  historico?: readonly ItemDoHistorico[];
}) {
  const utilizados = historico.filter((item) => item.situacao === "usado");
  const expirados = historico.filter((item) => item.situacao === "expirado");
  return (
    <Abas<Filtro> valorInicial="disponiveis" variante="segmentos" manterEstado>
      <ListaDeAbas rotulo="Filtrar cupons">
        <Aba valor="disponiveis">Disponíveis ({disponiveis.length})</Aba>
        <Aba valor="utilizados">Utilizados ({utilizados.length})</Aba>
        <Aba valor="expirados">Expirados ({expirados.length})</Aba>
      </ListaDeAbas>
      <PainelDaAba valor="disponiveis">
        {disponiveis.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {disponiveis.map((beneficio) => (
              <ItemDisponivel key={beneficio.id} beneficio={beneficio} />
            ))}
          </ul>
        ) : (
          <EstadoVazio
            titulo="Nenhum benefício disponível agora"
            descricao="Novos benefícios aparecem aqui assim que os parceiros confirmarem as condições."
            className="py-8"
          />
        )}
      </PainelDaAba>
      <PainelDaAba valor="utilizados">
        {utilizados.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {utilizados.map((item) => (
              <ItemDoHistoricoDoPassaporte key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <EstadoVazio
            icone={<CircleCheck />}
            titulo="Nenhum cupom utilizado"
            descricao="Os cupons que você usar nos estabelecimentos ficam registrados aqui."
            className="py-8"
          />
        )}
      </PainelDaAba>
      <PainelDaAba valor="expirados">
        {expirados.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {expirados.map((item) => (
              <ItemDoHistoricoDoPassaporte key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <EstadoVazio
            icone={<History />}
            titulo="Nenhum cupom expirado"
            descricao="Códigos gerados e não usados em 10 minutos aparecem aqui."
            className="py-8"
          />
        )}
      </PainelDaAba>
    </Abas>
  );
}
