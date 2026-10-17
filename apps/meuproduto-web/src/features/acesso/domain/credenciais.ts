import { Err, Ok, type Result } from "@meuproduto/core";
import { z } from "zod";

import { TAMANHO_MINIMO_DA_SENHA } from "@/shared/auth/regras";

// O que a pessoa digita nas telas de acesso, lido do FormData e validado. Os
// erros são códigos (`MotivoDeCampo`), traduzidos pela interface. O servidor
// (Better Auth) valida de novo: aqui é só para o erro aparecer no campo.

export type MotivoDeCampo =
  | "obrigatorio"
  | "emailInvalido"
  | "codigoInvalido"
  | "codigoDeRecuperacaoInvalido"
  | "senhasDiferentes"
  | "senhaCurta";

/** Um motivo por campo: só o primeiro problema de cada um é mostrado. */
export type ErrosDeCampo<Campo extends string> = Partial<
  Record<Campo, MotivoDeCampo>
>;

const motivo = (codigo: MotivoDeCampo) => codigo;

const obrigatorio = z
  .string({ error: motivo("obrigatorio") })
  .trim()
  .min(1, motivo("obrigatorio"));

// O e-mail é o identificador de quem entra: aparado e em minúsculas.
const email = obrigatorio
  .toLowerCase()
  .pipe(z.email({ error: motivo("emailInvalido") }));

// Senhas não são aparadas: espaço faz parte delas.
const senha = z
  .string({ error: motivo("obrigatorio") })
  .min(1, motivo("obrigatorio"));

const senhaNova = senha.pipe(
  z.string().min(TAMANHO_MINIMO_DA_SENHA, motivo("senhaCurta"))
);

const credenciaisSchema = z.object({ email, senha });

export type Credenciais = z.infer<typeof credenciaisSchema>;
export type CampoDeCredencial = keyof Credenciais;

const codigoDoAutenticador = obrigatorio
  .transform((valor) => valor.replace(/\s+/g, ""))
  .pipe(z.string().regex(/^\d{6}$/, motivo("codigoInvalido")));

// Os códigos de recuperação do Better Auth têm 10 letras e dígitos, mostrados
// como "abcde-12345". Diferenciam maiúsculas: só o hífen e espaços são livres.
const codigoDeRecuperacao = obrigatorio
  .transform((valor) => valor.replace(/[\s-]+/g, ""))
  .pipe(
    z.string().regex(/^[A-Za-z0-9]{10}$/, motivo("codigoDeRecuperacaoInvalido"))
  )
  .transform((valor) => `${valor.slice(0, 5)}-${valor.slice(5)}`);

export type CodigoDeVerificacao = {
  tipo: "autenticador" | "recuperacao";
  codigo: string;
};
export type CampoDeCodigo = "codigo";

const trocaDeSenhaSchema = z
  .object({ senhaAtual: senha, novaSenha: senhaNova, confirmacao: senha })
  .refine((troca) => troca.novaSenha === troca.confirmacao, {
    message: motivo("senhasDiferentes"),
    path: ["confirmacao"],
  });

export type TrocaDeSenha = z.infer<typeof trocaDeSenhaSchema>;
export type CampoDeTroca = keyof TrocaDeSenha;

const confirmacaoDeSenhaSchema = z.object({ senhaDeConfirmacao: senha });
export type CampoDeConfirmacao = "senhaDeConfirmacao";

const pedidoDeRecuperacaoSchema = z.object({ email });

export type PedidoDeRecuperacao = z.infer<typeof pedidoDeRecuperacaoSchema>;
export type CampoDeRecuperacao = keyof PedidoDeRecuperacao;

const redefinicaoSchema = z
  .object({ token: obrigatorio, novaSenha: senhaNova, confirmacao: senha })
  .refine((troca) => troca.novaSenha === troca.confirmacao, {
    message: motivo("senhasDiferentes"),
    path: ["confirmacao"],
  });

export type Redefinicao = z.infer<typeof redefinicaoSchema>;
export type CampoDeRedefinicao = keyof Redefinicao;

type Valores = Record<string, unknown>;

/** O primeiro motivo de cada campo, na forma que o formulário mostra. */
function errosPorCampo<Campo extends string>(
  erro: z.ZodError
): ErrosDeCampo<Campo> {
  return erro.issues.reduce<ErrosDeCampo<Campo>>((erros, issue) => {
    const campo = String(issue.path[0]) as Campo;
    return campo in erros
      ? erros
      : { ...erros, [campo]: issue.message as MotivoDeCampo };
  }, {});
}

function ler<Saida, Campo extends string>(
  schema: z.ZodType<Saida>,
  valores: Valores
): Result<Saida, ErrosDeCampo<Campo>> {
  const lido = schema.safeParse(valores);
  return lido.success ? Ok(lido.data) : Err(errosPorCampo<Campo>(lido.error));
}

/** E-mail e senha do formulário de entrada (`Object.fromEntries(formData)`). */
export function lerCredenciais(
  valores: Valores
): Result<Credenciais, ErrosDeCampo<CampoDeCredencial>> {
  return ler(credenciaisSchema, valores);
}

/**
 * O código do segundo fator: 6 dígitos do autenticador (espaços ignorados) ou,
 * com `tipo=recuperacao`, um código de recuperação.
 */
export function lerCodigo(
  valores: Valores
): Result<CodigoDeVerificacao, ErrosDeCampo<CampoDeCodigo>> {
  const tipo = valores.tipo === "recuperacao" ? "recuperacao" : "autenticador";
  const lido = ler<string, CampoDeCodigo>(
    z
      .object({
        codigo:
          tipo === "recuperacao" ? codigoDeRecuperacao : codigoDoAutenticador,
      })
      .transform((v) => v.codigo),
    valores
  );
  return lido.ok ? Ok({ tipo, codigo: lido.value }) : lido;
}

/** Senha atual, nova (com o tamanho mínimo) e confirmação. */
export function lerTrocaDeSenha(
  valores: Valores
): Result<TrocaDeSenha, ErrosDeCampo<CampoDeTroca>> {
  return ler(trocaDeSenhaSchema, valores);
}

/** A senha pedida de novo antes de gerar o autenticador. */
export function lerConfirmacaoDeSenha(
  valores: Valores
): Result<string, ErrosDeCampo<CampoDeConfirmacao>> {
  const lido = ler<{ senhaDeConfirmacao: string }, CampoDeConfirmacao>(
    confirmacaoDeSenhaSchema,
    valores
  );
  return lido.ok ? Ok(lido.value.senhaDeConfirmacao) : lido;
}

/** O e-mail do pedido de recuperação de senha. */
export function lerPedidoDeRecuperacao(
  valores: Valores
): Result<PedidoDeRecuperacao, ErrosDeCampo<CampoDeRecuperacao>> {
  return ler(pedidoDeRecuperacaoSchema, valores);
}

/** O token do link e a senha nova (com confirmação) da redefinição. */
export function lerRedefinicao(
  valores: Valores
): Result<Redefinicao, ErrosDeCampo<CampoDeRedefinicao>> {
  return ler(redefinicaoSchema, valores);
}
