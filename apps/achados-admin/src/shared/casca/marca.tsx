import Image from "next/image";
import { cn } from "@achados/ui/estilos";

/**
 * O símbolo e o nome da marca, como no app do assinante: "Achados" no asfalto
 * e "na Rota" com o degradê laranja. Recolhido, fica só o símbolo. O selo
 * "Painel" diz em que aplicação a pessoa está.
 */
export function Marca({
  somenteSimbolo = false,
  className,
}: {
  somenteSimbolo?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 select-none", className)}
    >
      <Image
        src="/marca/simbolo.png"
        alt=""
        width={183}
        height={144}
        priority
        className="h-9 w-auto shrink-0"
      />
      {!somenteSimbolo && (
        <span className="flex items-end gap-2">
          <span className="flex flex-col text-[18px] font-extrabold">
            <span className="block leading-[0.86] tracking-tighter text-foreground-brand">
              Achados
            </span>
            <span className="block leading-[0.86] tracking-[-0.04em]">
              <span className="mr-[0.08em] text-[0.58em] tracking-[-0.02em] text-foreground-brand/80">
                na
              </span>
              <span className="text-brand-gradient">Rota</span>
            </span>
          </span>
          <span className="mb-0.5 rounded-full bg-primary-subtle px-2 py-0.5 text-2xs font-bold tracking-wide text-primary uppercase">
            Painel
          </span>
        </span>
      )}
      {somenteSimbolo && <span className="sr-only">Achados na Rota</span>}
    </span>
  );
}
