import Image from "next/image";
import { cn } from "@meuproduto/ui/estilos";

/**
 * O emblema e o nome Meuproduto. O nome é texto, e não a imagem do logo, para
 * ficar legível nos dois temas: "Pape" na cor do texto e "livo" no degradê.
 */
export function Marca({
  tamanho = "md",
  somenteEmblema = false,
  className,
}: {
  tamanho?: "md" | "lg";
  /** Só o emblema, para a faixa recolhida do menu. */
  somenteEmblema?: boolean;
  className?: string;
}) {
  const lado = tamanho === "lg" ? 48 : 36;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/emblema-meuproduto.png"
        alt={somenteEmblema ? "Meuproduto" : ""}
        width={lado}
        height={lado}
        priority
        className="shrink-0 object-contain"
      />
      {!somenteEmblema && (
        <span
          className={cn(
            "leading-none font-bold tracking-tight text-foreground",
            tamanho === "lg" ? "text-3xl" : "text-2xl"
          )}
        >
          Pape<span className="text-brand-gradient">livo</span>
        </span>
      )}
    </span>
  );
}
