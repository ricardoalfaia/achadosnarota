import { useRef, useState } from "react";

import { cn } from "../../../lib/cn";
import type { Seguir } from "../hooks/use-edicao-de-celula";

/**
 * O campo que ocupa a célula durante a edição. Enter e sair do campo confirmam,
 * Esc desiste e Tab confirma e segue para a célula vizinha. Um valor recusado
 * mantém o campo aberto, com o contorno de erro.
 */
export function EditorDeCelula({
  rotulo,
  inicial,
  alinhamento,
  aoConcluir,
  aoCancelar,
}: {
  rotulo: string;
  inicial: string;
  alinhamento: string;
  /** Devolve o motivo quando o valor é recusado. */
  aoConcluir: (texto: string, seguir: Seguir) => string | undefined;
  aoCancelar: () => void;
}) {
  const [texto, setTexto] = useState(inicial);
  const [recusado, setRecusado] = useState(false);
  // Enter confirma e desmonta o campo, o que dispara um `blur`: sem esta marca,
  // a mesma edição seria confirmada duas vezes.
  const encerrado = useRef(false);

  function concluir(seguir: Seguir) {
    if (encerrado.current) return;
    const motivo = aoConcluir(texto, seguir);
    setRecusado(Boolean(motivo));
    if (!motivo) encerrado.current = true;
  }

  return (
    <input
      aria-label={rotulo}
      aria-invalid={recusado || undefined}
      value={texto}
      autoFocus
      onFocus={(evento) => evento.target.select()}
      onChange={(evento) => setTexto(evento.target.value)}
      onBlur={() => concluir("ficar")}
      onKeyDown={(evento) => {
        if (evento.key === "Enter") concluir("ficar");
        else if (evento.key === "Tab") {
          evento.preventDefault();
          concluir(evento.shiftKey ? "anterior" : "proxima");
        } else if (evento.key === "Escape") {
          encerrado.current = true;
          aoCancelar();
        }
      }}
      className={cn(
        "h-full w-full min-w-0 bg-surface px-3 text-foreground outline-2 -outline-offset-2 outline-ring aria-invalid:outline-danger",
        alinhamento
      )}
    />
  );
}
