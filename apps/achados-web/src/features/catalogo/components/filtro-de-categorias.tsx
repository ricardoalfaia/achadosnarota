"use client";

import { estiloDaPilula } from "@achados/ui/estilos";
import { Mountain } from "lucide-react";

import type { Categoria } from "../domain/tipos";
import { useFiltroDoCatalogo } from "../hooks/use-filtro-do-catalogo";
import { IconeDaCategoria } from "./icones";

/**
 * O carrossel de categorias, com rolagem horizontal. Cada pílula é um link de
 * verdade (funciona sem JavaScript e abre em outra aba); com JavaScript, troca
 * o filtro no lugar. "Todas" limpa a categoria.
 */
export function FiltroDeCategorias({
  categorias,
}: {
  categorias: readonly Categoria[];
}) {
  const { filtro, propsDoLink } = useFiltroDoCatalogo();
  return (
    <nav aria-label="Categorias">
      <ul className="-mx-4 scrollbar-none flex items-center gap-2 overflow-x-auto px-4 py-1">
        <li>
          <a
            {...propsDoLink({ categoria: undefined })}
            className={estiloDaPilula({ ativa: !filtro.categoria })}
          >
            <Mountain aria-hidden="true" />
            Todas
          </a>
        </li>
        {categorias.map((categoria) => (
          <li key={categoria.slug}>
            <a
              {...propsDoLink({ categoria: categoria.slug })}
              className={estiloDaPilula({
                ativa: filtro.categoria === categoria.slug,
              })}
            >
              <IconeDaCategoria chave={categoria.icone} />
              {categoria.nome}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
