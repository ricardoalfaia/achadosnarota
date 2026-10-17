import type { ReactNode } from "react";

import { cn } from "../../lib/cn";
import { BotaoDeIcone } from "../Botao";
import { IconeFechar } from "../Icones";

export type IntencaoDoAlerta = "info" | "sucesso" | "atencao" | "erro";

const APARENCIA: Record<IntencaoDoAlerta, string> = {
  info: "border-info-border bg-info-subtle",
  sucesso: "border-success-border bg-success-subtle",
  atencao: "border-warning-border bg-warning-subtle",
  erro: "border-danger-border bg-danger-subtle",
};

const DESTAQUE: Record<IntencaoDoAlerta, string> = {
  info: "text-info",
  sucesso: "text-success",
  atencao: "text-warning",
  erro: "text-danger",
};

const DESENHO: Record<IntencaoDoAlerta, string> = {
  info: "M12 11v5m0-8v.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
  sucesso: "m8 12 3 3 5-6m-4-6a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
  atencao:
    "M12 9v4m0 4v.01M10.3 4 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0Z",
  erro: "m9 9 6 6m0-6-6 6m3-12a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
};

/**
 * Mensagem em destaque dentro da página. `erro` e `atencao` interrompem o leitor
 * de tela (`role="alert"`); `info` e `sucesso` são anunciados sem interromper.
 */
export function Alerta({
  intencao = "info",
  titulo,
  acoes,
  aoFechar,
  className,
  children,
}: {
  intencao?: IntencaoDoAlerta;
  titulo?: ReactNode;
  /** Botões da mensagem: "Tentar de novo", "Ver detalhes". */
  acoes?: ReactNode;
  /** Com ele, aparece o botão de fechar. */
  aoFechar?: () => void;
  className?: string;
  children?: ReactNode;
}) {
  const urgente = intencao === "erro" || intencao === "atencao";

  return (
    <div
      role={urgente ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-control border p-3.5 text-foreground",
        APARENCIA[intencao],
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={cn("mt-px size-5 shrink-0", DESTAQUE[intencao])}
      >
        <path d={DESENHO[intencao]} />
      </svg>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {titulo && (
          <p className={cn("font-bold", DESTAQUE[intencao])}>{titulo}</p>
        )}
        {children && <div className="text-foreground">{children}</div>}
        {acoes && <div className="mt-2 flex flex-wrap gap-2">{acoes}</div>}
      </div>
      {aoFechar && (
        <BotaoDeIcone
          rotulo="Fechar aviso"
          icone={<IconeFechar />}
          variante="fantasma"
          tamanho="xs"
          onClick={aoFechar}
          className="-mt-1 -mr-1"
        />
      )}
    </div>
  );
}
