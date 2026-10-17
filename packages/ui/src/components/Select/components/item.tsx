import type { Opcao } from "../../../hooks/use-select";
import { cn } from "../../../lib/cn";
import { IconeCheck } from "../../Icones";

export function ItemDaLista<T extends string>({
  id,
  opcao,
  ativo,
  selecionada,
  aoDestacar,
  aoEscolher,
}: {
  id: string;
  opcao: Opcao<T>;
  ativo: boolean;
  selecionada: boolean;
  aoDestacar: () => void;
  aoEscolher: () => void;
}) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={selecionada}
      aria-disabled={opcao.desabilitada || undefined}
      data-ativo={ativo}
      // mousedown sem foco: o foco fica no gatilho (ou na busca) e o teclado segue funcionando.
      onMouseDown={(evento) => evento.preventDefault()}
      onMouseEnter={aoDestacar}
      onClick={aoEscolher}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground",
        ativo && "bg-primary-subtle/60",
        selecionada && "text-primary",
        opcao.desabilitada && "cursor-not-allowed text-foreground-subtle"
      )}
    >
      <span className="min-w-0">
        <span className="block truncate">{opcao.label}</span>
        {opcao.descricao && (
          <span className="block truncate text-xs font-normal text-foreground-muted">
            {opcao.descricao}
          </span>
        )}
      </span>
      {selecionada && <IconeCheck />}
    </li>
  );
}
