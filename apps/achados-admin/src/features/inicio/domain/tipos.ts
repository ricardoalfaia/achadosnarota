// O resumo do painel inicial: contagens e a fila de trabalho da equipe. Os
// números saem dos cadastros; nenhum número de economia ou de resgate é
// inventado aqui (README de produto, princípios 3 e 6).

export type Indicadores = {
  casasPublicadas: number;
  casasEmRascunho: number;
  avaliacoesEmRevisao: number;
  promocoesAtivas: number;
};

export type ItemDaFila = {
  id: string;
  titulo: string;
  detalhe: string;
  /** Endereço do registro no painel (`/curadoria?id=...`). */
  href: string;
};

export type FilaDeTrabalho = {
  curadoria: readonly ItemDaFila[];
  promocoes: readonly ItemDaFila[];
  casas: readonly ItemDaFila[];
};

export type ResumoDoPainel = {
  indicadores: Indicadores;
  fila: FilaDeTrabalho;
};
