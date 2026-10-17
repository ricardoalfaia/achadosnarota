"use client";

import { cn, estiloDaPilula } from "@achados/ui/estilos";
import { Mountain } from "lucide-react";

import type { Categoria } from "../domain/tipos";
import { useFiltroDoCatalogo } from "../hooks/use-filtro-do-catalogo";
import { IconeDaCategoria } from "./icones";

/**
 * O carrossel de categorias, com rolagem horizontal. Cada pílula é um link de
 * verdade (funciona sem JavaScript e abre em outra aba); com JavaScript, troca
 * o filtro no lugar. "Todas" limpa a categoria. `hero` é a faixa de vidro
 * escuro sobre a foto do topo desktop, com o ícone num círculo.
 */
export function FiltroDeCategorias({
  categorias,
  variante = "app",
}: {
  categorias: readonly Categoria[];
  variante?: "app" | "hero";
}) {
  const { filtro, propsDoLink } = useFiltroDoCatalogo();
  const estilo = (ativa: boolean) =>
    variante === "hero"
      ? cn(
          "flex h-12 shrink-0 items-center gap-2.5 rounded-2xl border border-white/12 px-4 text-sm font-semibold whitespace-nowrap text-white backdrop-blur-md transition-colors outline-none focus-visible:outline-2 focus-visible:outline-white [&_svg]:size-3.5 [&>span:first-child]:flex [&>span:first-child]:size-7 [&>span:first-child]:items-center [&>span:first-child]:justify-center [&>span:first-child]:rounded-full",
          ativa
            ? "bg-primary-solid [&>span:first-child]:bg-white/20"
            : "bg-[rgb(15_23_42/0.6)] hover:bg-primary-solid [&>span:first-child]:bg-white/10"
        )
      : estiloDaPilula({ ativa });
  return (
    <nav aria-label="Categorias">
      <ul
        className={cn(
          "scrollbar-none flex items-center gap-2 overflow-x-auto py-1",
          variante === "app" && "-mx-4 px-4"
        )}
      >
        <li>
          <a
            {...propsDoLink({ categoria: undefined })}
            className={estilo(!filtro.categoria)}
          >
            <span aria-hidden="true">
              <Mountain />
            </span>
            Todas
          </a>
        </li>
        {categorias.map((categoria) => (
          <li key={categoria.slug}>
            <a
              {...propsDoLink({ categoria: categoria.slug })}
              className={estilo(filtro.categoria === categoria.slug)}
            >
              <span aria-hidden="true">
                <IconeDaCategoria chave={categoria.icone} />
              </span>
              {categoria.nome}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
