/** Um benefício do passaporte com o lugar que o oferece. */
export type BeneficioDisponivel = {
  id: string;
  titulo: string;
  icone: string;
  lugarSlug: string;
  lugarNome: string;
  /** "Pindamonhangaba - SP" */
  local: string;
  foto?: { url: string; alt: string };
};

/** Um uso (ou código que expirou sem uso) no histórico do passaporte. */
export type ItemDoHistorico = {
  id: string;
  titulo: string;
  lugarNome?: string;
  lugarSlug?: string;
  cidade?: string;
  situacao: "usado" | "expirado";
  /** ISO: quando foi usado, ou quando o código expirou. */
  quando: string;
};
