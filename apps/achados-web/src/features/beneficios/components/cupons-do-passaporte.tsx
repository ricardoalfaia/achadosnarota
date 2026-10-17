"use client";

import Image from "next/image";
import Link from "next/link";
import { Aba, Abas, EstadoVazio, ListaDeAbas, PainelDaAba } from "@achados/ui";
import { ChevronRight, CircleCheck, History, MapPin } from "lucide-react";

import { IconeDoBeneficio } from "@/features/catalogo";
import { rotaDoLugar } from "@/shared/rotas";
import type { BeneficioDisponivel } from "../domain/tipos";

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

/**
 * "Meus cupons" do passaporte: os benefícios disponíveis hoje e o histórico
 * de usados e expirados. O histórico nasce com o resgate (F4); até lá, as
 * duas abas dizem que ainda não há nada, sem números de exemplo.
 */
export function CuponsDoPassaporte({
  disponiveis,
}: {
  disponiveis: readonly BeneficioDisponivel[];
}) {
  return (
    <Abas<Filtro> valorInicial="disponiveis" variante="segmentos" manterEstado>
      <ListaDeAbas rotulo="Filtrar cupons">
        <Aba valor="disponiveis">Disponíveis ({disponiveis.length})</Aba>
        <Aba valor="utilizados">Utilizados (0)</Aba>
        <Aba valor="expirados">Expirados (0)</Aba>
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
        <EstadoVazio
          icone={<CircleCheck />}
          titulo="Nenhum cupom utilizado"
          descricao="Os cupons que você usar nos estabelecimentos ficam registrados aqui."
          className="py-8"
        />
      </PainelDaAba>
      <PainelDaAba valor="expirados">
        <EstadoVazio
          icone={<History />}
          titulo="Nenhum cupom expirado"
          className="py-8"
        />
      </PainelDaAba>
    </Abas>
  );
}
