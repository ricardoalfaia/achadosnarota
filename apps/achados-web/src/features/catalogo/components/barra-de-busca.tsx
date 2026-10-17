"use client";

import type { MouseEvent } from "react";
import { BotaoDeIcone, Dialogo } from "@achados/ui";
import { cn, estiloDaPilula } from "@achados/ui/estilos";
import { useToggle } from "@achados/ui/hooks";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";

import type { Cidade } from "../domain/tipos";
import { useBuscaDeLugares } from "../hooks/use-busca-de-lugares";
import { useFiltroDoCatalogo } from "../hooks/use-filtro-do-catalogo";

/** A escolha da cidade, no diálogo aberto pelo botão de filtros. */
function EscolhaDaCidade({
  cidades,
  aoEscolher,
}: {
  cidades: readonly Cidade[];
  aoEscolher: () => void;
}) {
  const { filtro, propsDoLink } = useFiltroDoCatalogo();
  const link = (cidade: string | undefined) => {
    const props = propsDoLink({ cidade });
    return {
      ...props,
      onClick: (evento: MouseEvent<HTMLAnchorElement>) => {
        props.onClick(evento);
        aoEscolher();
      },
    };
  };
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      <li>
        <a
          {...link(undefined)}
          className={estiloDaPilula({ ativa: !filtro.cidade })}
        >
          Todas as cidades
        </a>
      </li>
      {cidades.map((cidade) => (
        <li key={cidade.slug}>
          <a
            {...link(cidade.slug)}
            className={estiloDaPilula({ ativa: cidade.slug === filtro.cidade })}
          >
            {cidade.nome} - {cidade.uf}
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * A busca da exploração: o campo, que filtra depois de uma pausa curta, e o
 * botão que abre a escolha da cidade. Sem JavaScript, o formulário envia por
 * GET e o servidor filtra igual.
 */
export function BarraDeBusca({ cidades }: { cidades: readonly Cidade[] }) {
  const { filtro } = useFiltroDoCatalogo();
  const { termo, aoDigitar, aoEnviar } = useBuscaDeLugares();
  const filtros = useToggle();
  const cidadeAtual = cidades.find((c) => c.slug === filtro.cidade);

  return (
    <>
      <form
        role="search"
        action="/"
        onSubmit={aoEnviar}
        className="flex items-center gap-2.5 rounded-2xl border border-border bg-header-control px-3.5 py-2.5 shadow-sm transition-shadow focus-within:border-ring focus-within:shadow-ring-glow"
      >
        <Search
          aria-hidden="true"
          className="size-4 shrink-0 text-foreground-subtle"
        />
        <input
          type="search"
          name="q"
          value={termo}
          onChange={(evento) => aoDigitar(evento.target.value)}
          placeholder="Buscar por cidade, restaurante, tipo..."
          aria-label="Buscar lugares por cidade, nome ou tipo"
          enterKeyHint="search"
          autoComplete="off"
          className="min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-subtle"
        />
        {filtro.categoria && (
          <input type="hidden" name="categoria" value={filtro.categoria} />
        )}
        {filtro.cidade && (
          <input type="hidden" name="cidade" value={filtro.cidade} />
        )}
        <BotaoDeIcone
          rotulo={
            cidadeAtual ? `Filtros: ${cidadeAtual.nome}` : "Filtrar por cidade"
          }
          icone={<SlidersHorizontal />}
          variante="fantasma"
          tamanho="xs"
          onClick={filtros.on}
          className={cn(
            "-my-1 -mr-1.5 size-8 [&_svg]:size-4",
            cidadeAtual && "text-brand"
          )}
        />
      </form>

      <Dialogo
        aberto={filtros.isOpen}
        aoFechar={filtros.off}
        variante="cartao"
        tamanho="sm"
        icone={<MapPin />}
        titulo="Escolha a cidade"
        descricao="Mostramos só os lugares já avaliados pela curadoria."
      >
        <EscolhaDaCidade cidades={cidades} aoEscolher={filtros.off} />
      </Dialogo>
    </>
  );
}
