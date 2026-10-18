// Quem está usando o painel, no formato que a casca mostra. Sem React e sem
// Next.
//
// PROVISÓRIO: o painel ainda não tem login. A sessão da equipe (curador,
// administrador, com MFA) entra com o ADR-0020 e o ADR-003 de produto, e a
// autorização será decidida no servidor a cada pedido. Até lá a casca mostra
// um papel genérico, sem nome nem e-mail de pessoa real.

export type PapelDaEquipe = "administrador" | "curador";

export type PessoaDaEquipe = {
  nome: string;
  papel: PapelDaEquipe;
};

export const ROTULO_DO_PAPEL: Record<PapelDaEquipe, string> = {
  administrador: "Administração",
  curador: "Curadoria",
};

export const PESSOA_PROVISORIA: PessoaDaEquipe = {
  nome: "Equipe Achados",
  papel: "administrador",
};
