export const RAIZ: string;
export const PADROES_DEV: {
  DATABASE_URL: string;
  DATABASE_URL_ADMIN: string;
};
export function rotuloBanco(url: string | undefined): string;
export function carregarEnv(opcoes?: { silencioso?: boolean }): {
  arquivo: string | null;
  origem: Record<string, string>;
};
