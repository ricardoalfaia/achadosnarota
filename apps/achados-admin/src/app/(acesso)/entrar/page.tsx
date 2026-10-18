import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { unwrapOrThrow } from "@achados/core";
import { Botao } from "@achados/ui";
import { ShieldAlert } from "lucide-react";

import { sair } from "@/features/acesso/actions";
import { ConfiguracaoDoAutenticador } from "@/features/acesso/components/configuracao-do-autenticador";
import { FormularioDeEntrada } from "@/features/acesso/components/formulario-de-entrada";
import { Marca } from "@/shared/casca/marca";
import { ROTAS } from "@/shared/rotas";
import { situacaoDaEquipe } from "@/shared/sessao/sessao.servidor";

export const metadata: Metadata = { title: "Entrar" };

const TITULO = {
  semSessao: "Entrar no painel",
  semAutenticador: "Configure o autenticador",
  foraDaEquipe: "Sem acesso ao painel",
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
    <main className="flex min-h-dvh items-center justify-center bg-surface-hover p-4">
      <div className="w-full max-w-sm rounded-[2rem] bg-surface p-6 shadow-xl ring-1 ring-border/60">
        <Marca className="mb-6" />
        <h1 className="mb-4 text-xl font-extrabold tracking-tight text-foreground">
          {TITULO[situacao.tipo]}
        </h1>
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
      </div>
    </main>
  );
}
