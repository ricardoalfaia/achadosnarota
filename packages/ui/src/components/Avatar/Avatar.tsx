"use client";

import { useState } from "react";

import { cn } from "../../lib/cn";
import { iniciaisDoNome } from "./iniciais";

/**
 * `sm` 28px (listas), `md` 36px (cabeçalho, o padrão), `lg` 48px e `xl` 80px
 * (topo do perfil).
 */
export type TamanhoDoAvatar = "sm" | "md" | "lg" | "xl";

const TAMANHO: Record<TamanhoDoAvatar, string> = {
  sm: "size-7 text-2xs",
  md: "size-9 text-sm",
  lg: "size-12 text-lg",
  xl: "size-20 text-2xl",
};

/**
 * Foto da pessoa ou, sem ela, as iniciais do nome sobre o laranja suave da marca.
 * Se a foto não carregar, as iniciais entram no lugar. O nome é o nome acessível.
 */
export function Avatar({
  nome,
  fotoUrl,
  tamanho = "md",
  className,
}: {
  nome: string;
  fotoUrl?: string;
  tamanho?: TamanhoDoAvatar;
  className?: string;
}) {
  // A foto que falhou; uma URL nova tenta de novo.
  const [fotoComErro, setFotoComErro] = useState<string>();
  const comFoto = fotoUrl && fotoUrl !== fotoComErro;

  const moldura = cn(
    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-primary-subtle font-bold text-primary shadow-sm select-none",
    TAMANHO[tamanho],
    className
  );

  if (comFoto) {
    return (
      <img
        src={fotoUrl}
        alt={nome}
        onError={() => setFotoComErro(fotoUrl)}
        className={cn(moldura, "object-cover")}
      />
    );
  }

  return (
    <span role="img" aria-label={nome} className={moldura}>
      <span aria-hidden="true">{iniciaisDoNome(nome)}</span>
    </span>
  );
}
