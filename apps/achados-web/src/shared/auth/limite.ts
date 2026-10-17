// Limite de tentativas das Actions de acesso (ADR-0020). O rate limit do
// Better Auth só vale para quem chama /api/auth por HTTP; as Actions chamam
// `auth().api.*` direto e passam por este limite, gravado na mesma tabela
// `rate_limit` do banco (vale entre instâncias). Aqui ficam as regras puras;
// a leitura e a gravação estão em `limite.servidor.ts`.

export type Regra = { janelaEmSegundos: number; maximo: number };

/**
 * Falhas contadas por conta (qualquer IP) e por IP (qualquer conta). Por conta
 * segura a força bruta distribuída; por IP, o teste de muitas contas a partir
 * da mesma origem. O IP vem do proxy reverso e pode ser forjado sem um proxy
 * confiável na frente: por isso o limite por conta é o principal.
 */
export const REGRAS = {
  entradaPorConta: { janelaEmSegundos: 15 * 60, maximo: 10 },
  entradaPorIp: { janelaEmSegundos: 15 * 60, maximo: 50 },
  redefinicaoPorConta: { janelaEmSegundos: 15 * 60, maximo: 3 },
  redefinicaoPorIp: { janelaEmSegundos: 15 * 60, maximo: 10 },
  cadastroPorIp: { janelaEmSegundos: 60 * 60, maximo: 10 },
} as const satisfies Record<string, Regra>;

export type ChaveDeLimite = { chave: string; regra: Regra };

/** O registro de uma chave: falhas e o início da janela (ms desde 1970). */
export type Contagem = { count: number; lastRequest: number };

export function janelaAberta(
  contagem: Contagem,
  regra: Regra,
  agora: number
): boolean {
  return agora - contagem.lastRequest < regra.janelaEmSegundos * 1000;
}

/** Bloqueado quando, dentro da janela, as falhas já chegaram ao máximo. */
export function estaBloqueado(
  contagem: Contagem | undefined,
  regra: Regra,
  agora: number
): boolean {
  return (
    contagem !== undefined &&
    janelaAberta(contagem, regra, agora) &&
    contagem.count >= regra.maximo
  );
}

/**
 * As chaves de quem tenta. A conta e o IP chegam já resumidos (HMAC), para a
 * tabela não guardar e-mail nem endereço em claro.
 */
export function chavesDaEntrada(
  conta: string,
  ip: string
): { conta: ChaveDeLimite; ip: ChaveDeLimite } {
  return {
    conta: {
      chave: `achados:entrada:conta:${conta}`,
      regra: REGRAS.entradaPorConta,
    },
    ip: { chave: `achados:entrada:ip:${ip}`, regra: REGRAS.entradaPorIp },
  };
}

export function chavesDaRedefinicao(
  conta: string,
  ip: string
): { conta: ChaveDeLimite; ip: ChaveDeLimite } {
  return {
    conta: {
      chave: `achados:redefinicao:conta:${conta}`,
      regra: REGRAS.redefinicaoPorConta,
    },
    ip: {
      chave: `achados:redefinicao:ip:${ip}`,
      regra: REGRAS.redefinicaoPorIp,
    },
  };
}

/**
 * O cadastro conta por IP: cada tentativa, aceita ou não, entra na conta, para
 * ninguém criar contas em série nem descobrir e-mails cadastrados por tentativa.
 */
export function chaveDoCadastro(ip: string): ChaveDeLimite {
  return { chave: `achados:cadastro:ip:${ip}`, regra: REGRAS.cadastroPorIp };
}
