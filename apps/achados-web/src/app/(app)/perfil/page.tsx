import type { Metadata } from "next";
import Link from "next/link";
import { unwrapOrThrow } from "@achados/core";
import { Avatar } from "@achados/ui";
import { ChevronRight, Crown, LogOut } from "lucide-react";

import { lerPassaporte } from "@/features/passaporte/servidor";
import { CabecalhoDoApp } from "@/shared/casca/cabecalho-do-app";
import { EscolhaDeTema } from "@/shared/casca/escolha-de-tema";
import { InstalarApp } from "@/shared/casca/instalar-app";
import { ROTAS } from "@/shared/rotas";
import { sair } from "@/shared/sessao/sair";
import { pessoaDaSessao } from "@/shared/sessao/sessao";
import { exigirSessao } from "@/shared/sessao/sessao.servidor";

export const metadata: Metadata = {
  title: "Meu perfil",
  robots: { index: false },
};

/** Perfil (protótipo, tela 5): quem entrou, o plano e as preferências do app. */
export default async function Perfil() {
  const usuario = await exigirSessao(ROTAS.perfil);
  const passaporte = unwrapOrThrow(await lerPassaporte(usuario.id));
  const ativo = passaporte.situacao === "ativo";
  const pessoa = pessoaDaSessao(usuario);

  return (
    <>
      <CabecalhoDoApp pessoa={pessoa} />
      <div className="flex flex-col gap-4 p-4">
        <section className="py-4 text-center">
          <div className="relative mx-auto mb-3 w-fit">
            <Avatar
              nome={pessoa.nome}
              tamanho="xl"
              className="border-4 shadow-md"
              {...(pessoa.fotoUrl ? { fotoUrl: pessoa.fotoUrl } : {})}
            />
            {ativo && (
              <span
                title="Passaporte ativo"
                className="absolute right-0 bottom-0 flex size-6 items-center justify-center rounded-full bg-accent-on-dark text-foreground shadow"
              >
                <Crown aria-hidden="true" className="size-3" />
              </span>
            )}
          </div>
          <h1 className="text-lg font-extrabold text-foreground">
            {pessoa.nome}
          </h1>
          <p className="text-xs text-foreground-muted">
            Na rota desde {usuario.criadoEm.getFullYear()}
          </p>
        </section>

        <div className="divide-y divide-border rounded-2xl border border-border bg-surface px-4 shadow-sm">
          <Link
            href={ROTAS.passaporte}
            className="flex items-center justify-between gap-3 py-3 text-xs font-semibold outline-none focus-visible:outline-2 focus-visible:outline-ring"
          >
            <span className="flex items-center gap-2 text-foreground">
              <Crown aria-hidden="true" className="size-4 text-star" />
              Plano atual
            </span>
            <span className="flex items-center gap-0.5 font-bold text-primary">
              {ativo ? "Passaporte anual" : "Sem passaporte"}
              <ChevronRight aria-hidden="true" className="size-3.5" />
            </span>
          </Link>
          <EscolhaDeTema />
          <InstalarApp />
          <form action={sair}>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-2 py-3 text-left text-xs font-semibold text-danger outline-none focus-visible:outline-2 focus-visible:outline-ring"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Sair da conta
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
