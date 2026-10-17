import type { Ref } from "react";

import { cn } from "../../../lib/cn";
import { formatarDataBr, type DataIso } from "../../../lib/datas";
import { CaixaDoCampo, TEXTO_DO_CAMPO } from "../../CaixaDoCampo";
import { IconeCalendario, IconeSeta } from "../../Icones";
import type { Tamanho } from "../../tipos";

/** Um dos dois campos do período. Clicar em qualquer um abre o mesmo calendário. */
export function GatilhoDoPeriodo({
  ref,
  id,
  label,
  tamanho = "lg",
  data,
  aberto,
  ativo,
  invalido,
  desabilitado,
  descricao,
  aoClicar,
  aoSair,
}: {
  ref?: Ref<HTMLButtonElement>;
  id: string;
  label: string;
  tamanho?: Tamanho;
  data: DataIso | null;
  aberto: boolean;
  /** Este é o lado que o próximo clique no calendário vai preencher. */
  ativo: boolean;
  invalido: boolean;
  desabilitado?: boolean;
  descricao?: string;
  aoClicar: () => void;
  aoSair?: () => void;
}) {
  const flutuando = ativo || data !== null;

  return (
    <CaixaDoCampo
      id={id}
      label={label}
      tamanho={tamanho}
      flutuando={flutuando}
      ativo={ativo}
      invalido={invalido}
      desabilitado={desabilitado}
      icone={ativo ? <IconeSeta aberto /> : <IconeCalendario />}
    >
      <button
        ref={ref}
        id={id}
        type="button"
        onClick={aoClicar}
        onBlur={aoSair}
        disabled={desabilitado}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-describedby={descricao}
        aria-labelledby={`${id}-rotulo ${id}`}
        className={cn(
          "w-full text-left text-foreground outline-none disabled:cursor-not-allowed",
          TEXTO_DO_CAMPO[tamanho],
          !flutuando && "sr-only"
        )}
      >
        {data ? (
          formatarDataBr(data)
        ) : (
          <span className="text-foreground-subtle">dd/mm/aaaa</span>
        )}
      </button>
    </CaixaDoCampo>
  );
}
