"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@achados/ui";
import { cn } from "@achados/ui/estilos";

import { ROTAS } from "@/shared/rotas";

const TODAS = "todas";

/**
 * A casa do relatório de resgates, com busca dentro da lista (são muitas
 * casas). Escolher já leva à URL nova, que o servidor lê de novo; o período
 * escolhido continua.
 */
export function FiltroDeCasa({
  periodo,
  casa,
  casas,
}: {
  periodo: string;
  casa: string | null;
  casas: readonly { id: string; nome: string }[];
}) {
  const router = useRouter();
  const [carregando, iniciar] = useTransition();

  const escolher = (valor: string) => {
    const busca = new URLSearchParams({ periodo });
    if (valor !== TODAS) busca.set("casa", valor);
    iniciar(() => router.push(`${ROTAS.resgates}?${busca}`));
  };

  return (
    <Select
      label="Casa"
      tamanho="sm"
      pesquisavel
      placeholderDaBusca="Buscar casa"
      opcoes={[
        { valor: TODAS, label: "Todas as casas" },
        ...casas.map((c) => ({ valor: c.id, label: c.nome })),
      ]}
      valor={casa ?? TODAS}
      aoMudar={escolher}
      className={cn("w-64", carregando && "opacity-70")}
    />
  );
}
