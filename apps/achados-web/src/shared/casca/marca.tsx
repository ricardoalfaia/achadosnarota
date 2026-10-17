import Image from "next/image";
import { cn } from "@achados/ui/estilos";

const TAMANHOS = {
  md: { simbolo: "h-9", nome: "text-[18px]" },
  lg: { simbolo: "h-11", nome: "text-[24px]" },
} as const;

/**
 * O símbolo e o nome em duas linhas bem juntas: "Achados" no asfalto da marca
 * e, embaixo, um "na" pequeno colado ao "Rota" grande no degradê laranja. O
 * contraste de tamanhos segura a leitura sem precisar de espaço entre as
 * linhas. O nome é texto, não imagem, para ficar nítido em qualquer tela.
 */
export function Marca({
  tamanho = "md",
  className,
}: {
  /** `md` no cabeçalho do app, `lg` no desktop e nas telas de acesso. */
  tamanho?: keyof typeof TAMANHOS;
  className?: string;
}) {
  const medidas = TAMANHOS[tamanho];
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
        className={cn("w-auto shrink-0", medidas.simbolo)}
      />
      <span className={cn("flex flex-col font-extrabold", medidas.nome)}>
        <span className="block leading-[0.86] tracking-tighter text-foreground-brand">
          Achados
        </span>
        <span className="block leading-[0.86] tracking-[-0.04em]">
          <span className="mr-[0.08em] align-baseline text-[0.58em] tracking-[-0.02em] text-foreground-brand/80">
            na
          </span>
          <span className="text-brand-gradient">Rota</span>
        </span>
      </span>
    </span>
  );
}
