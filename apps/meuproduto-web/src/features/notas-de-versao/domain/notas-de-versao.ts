// As notas de versão mostradas na janela de notas de versão. Os textos vêm das
// traduções (`NotasDeVersao.destaques.<id>`).

export type IdDeDestaque = "painel" | "acesso" | "preferencias";

export type NotasDeVersao = {
  /** A versão curta mostrada no selo do menu do usuário ("0.1.0"). */
  versaoCurta: string;
  atual: { versao: string; data: string; destaques: readonly IdDeDestaque[] };
};

/** PROVISÓRIO: as notas da fundação, até virem da configuração de release. */
export const notasDeVersaoProvisorias: NotasDeVersao = {
  versaoCurta: "0.1.0",
  atual: {
    versao: "0.1.0",
    data: "16/10/2026",
    destaques: ["painel", "acesso", "preferencias"],
  },
};
