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
