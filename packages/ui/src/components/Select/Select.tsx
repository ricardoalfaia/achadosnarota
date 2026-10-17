"use client";

import { use } from "react";

import type { Opcao, UseSelectOpcoes } from "../../hooks/use-select";
import type { PropsDeCampo } from "../tipos";
import { CampoSelect } from "./components/campo";

export type SelectProps<T extends string> = Omit<UseSelectOpcoes<T>, "opcoes"> &
  PropsDeCampo & {
    /**
     * Lista pronta ou a `Promise` dela. Com `Promise`, o campo suspende até
     * resolver: envolva em `<Suspense fallback={<CampoSkeleton />}>`. A promise
     * precisa ser estável — criada no Server Component, não no render do client.
     */
    opcoes: readonly Opcao<T>[] | Promise<readonly Opcao<T>[]>;
    placeholderDaBusca?: string;
    /** Texto quando a busca não encontra nada. */
    textoVazio?: string;
  };

function ehPromise<V>(valor: V | Promise<V>): valor is Promise<V> {
  return typeof (valor as Promise<V>).then === "function";
}

/** Select no visual dos campos, com busca interna opcional (`pesquisavel`). */
export function Select<T extends string>({ opcoes, ...props }: SelectProps<T>) {
  const lista = ehPromise(opcoes) ? use(opcoes) : opcoes;
  return <CampoSelect opcoes={lista} {...props} />;
}
