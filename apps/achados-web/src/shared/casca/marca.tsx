import Image from "next/image";
import { cn } from "@achados/ui/estilos";

/**
 * O símbolo e o nome em duas linhas: "Achados" no asfalto da marca e "na
 * Rota" no degradê laranja, como no protótipo. O nome é texto, não imagem,
 * para ficar nítido em qualquer tela; o símbolo é decorativo ao lado dele.
 */
export function Marca({
  tamanho = "md",
  className,
}: {
  /** `md` no cabeçalho, `lg` nas telas de acesso. */
  tamanho?: "md" | "lg";
  className?: string;
}) {
  const grande = tamanho === "lg";
  return (
    <span
      className={cn("inline-flex items-center gap-2.5 select-none", className)}
    >
      <Image
        src="/marca/simbolo.png"
        alt=""
        width={183}
        height={144}
        priority
        className={cn("w-auto shrink-0", grande ? "h-12" : "h-9")}
      />
      <span
        className={cn(
          "flex flex-col leading-[0.9] font-extrabold",
          grande ? "text-2xl" : "text-[17px]"
        )}
      >
        <span className="tracking-[-0.045em] text-foreground-brand">
          Achados
        </span>
        <span className="mt-px text-brand-gradient tracking-[-0.035em]">
          na Rota
        </span>
      </span>
    </span>
  );
}
