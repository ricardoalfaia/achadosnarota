import { useEffect, useRef } from "react";

import type { Opcao, SelectEstado } from "../../../hooks/use-select";
import { CaixaSuspensa } from "../../CaixaSuspensa";
import type { Lado } from "../../tipos";
import { CampoDeBusca } from "./busca";
import { ItemDaLista } from "./item";

export function ListaDeOpcoes<T extends string>({
  select,
  id,
  idDoRotulo,
  pesquisavel,
  placeholderDaBusca,
  textoVazio,
  lado,
  saindo,
  aoEscolher,
}: {
  select: SelectEstado<T>;
  id: string;
  idDoRotulo: string;
  pesquisavel: boolean;
  placeholderDaBusca: string;
  textoVazio: string;
  lado?: Lado;
  saindo?: boolean;
  aoEscolher: (opcao: Opcao<T>) => void;
}) {
  const lista = useRef<HTMLUListElement>(null);
  const { filtradas, ativo } = select;

  // A opção ativa pelo teclado continua à vista quando a lista rola.
  useEffect(() => {
    lista.current
      ?.querySelector('[data-ativo="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [ativo]);

  return (
    <CaixaSuspensa
      lado={lado}
      saindo={saindo}
      className="right-0 overflow-hidden rounded-card p-0"
    >
      {pesquisavel && (
        <CampoDeBusca
          select={select}
          idDaLista={id}
          placeholder={placeholderDaBusca}
        />
      )}
      <ul
        ref={lista}
        id={id}
        role="listbox"
        aria-labelledby={idDoRotulo}
        className="max-h-72 overflow-y-auto py-2"
      >
        {filtradas.length === 0 ? (
          <li
            role="presentation"
            className="px-4 py-3 text-sm text-foreground-muted"
          >
            {textoVazio}
          </li>
        ) : (
          filtradas.map((opcao, indice) => (
            <ItemDaLista
              key={opcao.valor}
              id={`${id}-${indice}`}
              opcao={opcao}
              ativo={indice === ativo}
              selecionada={opcao.valor === select.valor}
              aoDestacar={() => select.destacar(indice)}
              aoEscolher={() => aoEscolher(opcao)}
            />
          ))
        )}
      </ul>
    </CaixaSuspensa>
  );
}
