"use client";

import { BotaoDeIcone } from "@achados/ui";
import { cn } from "@achados/ui/estilos";
import { Heart } from "lucide-react";

import { useFavorito } from "../hooks/use-favorito";

/**
 * O coração de favoritar. Estado, otimismo, login e falha vêm de
 * `useFavorito`; aqui só a aparência.
 */
export function BotaoDeFavorito({
  slug,
  nome,
  tamanho = "sm",
}: {
  slug: string;
  nome: string;
  /** `sm` nos cartões (28px), `md` sobre a foto da ficha (36px). */
  tamanho?: "sm" | "md";
}) {
  const { favorito, falhou, alternar } = useFavorito(slug);
  return (
    <>
      <BotaoDeIcone
        rotulo={
          favorito
            ? `Tirar ${nome} dos favoritos`
            : `Salvar ${nome} nos favoritos`
        }
        aria-pressed={favorito}
        icone={
          <Heart
            key={String(favorito)}
            className={cn(
              favorito && "animate-pop fill-favorite text-favorite"
            )}
          />
        }
        variante="flutuante"
        tamanho="xs"
        onClick={alternar}
        className={cn(
          tamanho === "sm"
            ? "size-7 [&_svg]:size-3.5"
            : "size-9 [&_svg]:size-4",
          favorito && "bg-favorite-subtle"
        )}
      />
      <span role="status" className="sr-only">
        {falhou ? "Não foi possível salvar agora. Tente de novo." : ""}
      </span>
    </>
  );
}
