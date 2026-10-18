import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { unwrapOrThrow } from "@achados/core";
import { Botao } from "@achados/ui";
import { ShieldAlert } from "lucide-react";

import { sair } from "@/features/acesso/actions";
import { ConfiguracaoDoAutenticador } from "@/features/acesso/components/configuracao-do-autenticador";
import { FormularioDeEntrada } from "@/features/acesso/components/formulario-de-entrada";
import { ROTAS } from "@/shared/rotas";
import { situacaoDaEquipe } from "@/shared/sessao/sessao.servidor";

export const metadata: Metadata = { title: "Entrar" };

const TITULO = {
  semSessao: "Entrar no painel",
  semAutenticador: "Configure o autenticador",
  foraDaEquipe: "Sem acesso ao painel",
} as const;

const APOIO = {
  semSessao: "Use a conta da equipe do Achados na Rota.",
  semAutenticador:
    "O painel pede um código do aplicativo autenticador a cada entrada.",
  foraDaEquipe: "Esta conta entrou, mas não está liberada para o painel.",
} as const;

/**
 * A entrada da equipe. O servidor decide o passo: sem sessão, e-mail e senha
 * (e o código, com o 2FA ligado); sessão sem autenticador, a configuração
 * dele (obrigatória); conta fora da equipe, o aviso; equipe liberada, o
 * painel.
 */
export default async function PaginaDeEntrada() {
  const situacao = unwrapOrThrow(await situacaoDaEquipe());
  if (situacao.tipo === "equipe") redirect(ROTAS.inicio);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
          {TITULO[situacao.tipo]}
        </h1>
        <p className="mt-1.5 text-sm leading-snug text-foreground-muted">
          {APOIO[situacao.tipo]}
        </p>
      </header>
      {situacao.tipo === "semSessao" && <FormularioDeEntrada />}
      {situacao.tipo === "semAutenticador" && <ConfiguracaoDoAutenticador />}
      {situacao.tipo === "foraDaEquipe" && (
        <div className="flex flex-col gap-4">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-foreground-muted">
            <ShieldAlert
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-warning"
            />
            Esta conta não faz parte da equipe do Achados na Rota. Peça à
            administração para liberar o seu acesso.
          </p>
          <form action={sair}>
            <Botao type="submit" variante="contorno" larguraTotal>
              Sair e entrar com outra conta
            </Botao>
          </form>
        </div>
      )}
    </>
  );
}
