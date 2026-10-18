import type { Metadata } from "next";
import Link from "next/link";
import { unwrapOrThrow } from "@achados/core";
import { Avatar } from "@achados/ui";
import { cn } from "@achados/ui/estilos";
import {
  ChevronRight,
  Crown,
  FileText,
  Heart,
  LogOut,
  ShieldCheck,
  Store,
} from "lucide-react";

import { casasDoOperador } from "@/features/balcao/servidor";
import { dataCurta } from "@/features/passaporte";
import { lerPassaporte } from "@/features/passaporte/servidor";
import { CabecalhoDoApp } from "@/shared/casca/cabecalho-do-app";
import { EscolhaDeTema } from "@/shared/casca/escolha-de-tema";
import { InstalarApp } from "@/shared/casca/instalar-app";
import {
  GrupoDeAjustes,
  LINHA_DE_AJUSTE,
  RotuloDaLinha,
} from "@/shared/casca/linha-de-ajuste";
import { ROTAS } from "@/shared/rotas";
import { sair } from "@/shared/sessao/sair";
import { pessoaDaSessao } from "@/shared/sessao/sessao";
import { exigirSessao } from "@/shared/sessao/sessao.servidor";

export const metadata: Metadata = {
  title: "Meu perfil",
  robots: { index: false },
};

const LINK_DA_LINHA = cn(
  LINHA_DE_AJUSTE,
  "outline-none focus-visible:outline-2 focus-visible:outline-ring"
);

/**
 * Perfil (protótipo, tela 5): o cartão de quem entrou, com o avatar em anel e
 * a situação do passaporte, e os ajustes em grupos (conta, app, sobre).
 */
export default async function Perfil() {
  const usuario = await exigirSessao(ROTAS.perfil);
  const [passaporte, casasQueOpera] = await Promise.all([
    lerPassaporte(usuario.id).then(unwrapOrThrow),
    casasDoOperador(usuario.id),
  ]);
  const pessoa = pessoaDaSessao(usuario);

  return (
    <>
      <CabecalhoDoApp pessoa={pessoa} />
      <div className="flex flex-col gap-6 p-4 lg:mx-auto lg:w-full lg:max-w-xl lg:py-12">
        <section
          data-theme="dark"
          aria-label="Quem está na rota"
          className="relative flex flex-col items-center overflow-hidden rounded-[2rem] bg-passport px-5 pt-8 pb-6 text-center text-white shadow-xl"
        >
          <div className="relative">
            <Avatar
              nome={pessoa.nome}
              tamanho="2xl"
              anel
              {...(pessoa.fotoUrl ? { fotoUrl: pessoa.fotoUrl } : {})}
            />
            {passaporte.situacao === "ativo" && (
              <span
                title="Passaporte ativo"
                className="absolute right-1 bottom-1 flex size-8 items-center justify-center rounded-full border-[3px] border-[#0a1e2e] bg-accent-on-dark text-[#0a1e2e]"
              >
                <Crown aria-hidden="true" className="size-4" />
              </span>
            )}
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
            {pessoa.nome}
          </h1>
          <p className="mt-0.5 text-sm text-white/70">
            Na rota desde {usuario.criadoEm.getFullYear()}
          </p>
          <Link
            href={ROTAS.passaporte}
            className={cn(
              "mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold outline-none focus-visible:outline-2 focus-visible:outline-white",
              passaporte.situacao === "ativo"
                ? "bg-accent-on-dark/15 text-accent-on-dark"
                : "bg-white text-[#0a1e2e]"
            )}
          >
            <Crown aria-hidden="true" className="size-4" />
            {passaporte.situacao === "ativo"
              ? `Passaporte ativo até ${dataCurta(passaporte.validoAte)}`
              : "Conhecer o Passaporte"}
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        </section>

        <GrupoDeAjustes titulo="Sua conta">
          <Link href={ROTAS.passaporte} className={LINK_DA_LINHA}>
            <RotuloDaLinha icone={<Crown />}>Plano atual</RotuloDaLinha>
            <span className="flex items-center gap-0.5 text-sm font-bold text-primary">
              {passaporte.situacao === "ativo"
                ? "Passaporte anual"
                : "Sem passaporte"}
              <ChevronRight aria-hidden="true" className="size-4" />
            </span>
          </Link>
          {casasQueOpera.length > 0 && (
            <Link href={ROTAS.balcao} className={LINK_DA_LINHA}>
              <RotuloDaLinha icone={<Store />}>Modo balcão</RotuloDaLinha>
              <span className="flex items-center gap-0.5 text-sm font-bold text-primary">
                Validar códigos
                <ChevronRight aria-hidden="true" className="size-4" />
              </span>
            </Link>
          )}
          <Link href={ROTAS.favoritos} className={LINK_DA_LINHA}>
            <RotuloDaLinha icone={<Heart />}>Meus favoritos</RotuloDaLinha>
            <ChevronRight
              aria-hidden="true"
              className="size-4 text-foreground-subtle"
            />
          </Link>
        </GrupoDeAjustes>

        <GrupoDeAjustes titulo="App">
          <EscolhaDeTema />
          <InstalarApp />
        </GrupoDeAjustes>

        <GrupoDeAjustes titulo="Sobre">
          <Link href="/termos" className={LINK_DA_LINHA}>
            <RotuloDaLinha icone={<FileText />}>Termos de uso</RotuloDaLinha>
            <ChevronRight
              aria-hidden="true"
              className="size-4 text-foreground-subtle"
            />
          </Link>
          <Link href="/privacidade" className={LINK_DA_LINHA}>
            <RotuloDaLinha icone={<ShieldCheck />}>Privacidade</RotuloDaLinha>
            <ChevronRight
              aria-hidden="true"
              className="size-4 text-foreground-subtle"
            />
          </Link>
          <form action={sair}>
            <button
              type="submit"
              className={cn(LINK_DA_LINHA, "cursor-pointer text-danger")}
            >
              <RotuloDaLinha icone={<LogOut />} tom="perigo">
                Sair da conta
              </RotuloDaLinha>
            </button>
          </form>
        </GrupoDeAjustes>
      </div>
    </>
  );
}
