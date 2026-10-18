import type { IntencaoDoSeloDeStatus, TomDaEtiqueta } from "@achados/ui";

import type { SeloEditorial, StatusDaAvaliacao } from "./tipos";

export const STATUS_DA_AVALIACAO: Record<
  StatusDaAvaliacao,
  { rotulo: string; plural: string; intencao: IntencaoDoSeloDeStatus }
> = {
  draft: { rotulo: "Rascunho", plural: "Rascunhos", intencao: "neutro" },
  in_review: {
    rotulo: "Em revisão",
    plural: "Em revisão",
    intencao: "destaque",
  },
  approved: { rotulo: "Aprovada", plural: "Aprovadas", intencao: "primario" },
  published: { rotulo: "Publicada", plural: "Publicadas", intencao: "sucesso" },
  superseded: {
    rotulo: "Substituída",
    plural: "Substituídas",
    intencao: "neutro",
  },
  withdrawn: { rotulo: "Retirada", plural: "Retiradas", intencao: "perigo" },
};

/** Os selos sobre a foto, com o mesmo tom que o app usa. */
export const SELO_EDITORIAL: Record<
  SeloEditorial,
  { rotulo: string; tom: TomDaEtiqueta; descricao: string }
> = {
  featured: {
    rotulo: "Destaque",
    tom: "marca",
    descricao: "Entre os melhores da rota, escolhido pela curadoria.",
  },
  beloved: {
    rotulo: "Mais querido",
    tom: "info",
    descricao: "Casa que os visitantes recomendam e voltam.",
  },
  verified: {
    rotulo: "Verificado",
    tom: "sucesso",
    descricao: "Informações conferidas na visita.",
  },
  new: {
    rotulo: "Novo na rota",
    tom: "escuro",
    descricao: "Entrou há pouco no catálogo.",
  },
};

/** Nota com vírgula: 4.7 → "4,7". */
export function notaComVirgula(nota: number): string {
  return nota.toFixed(1).replace(".", ",");
}
