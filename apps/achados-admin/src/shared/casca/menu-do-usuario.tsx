"use client";

import { Avatar, SeletorDeTema } from "@achados/ui";
import { cn } from "@achados/ui/estilos";
import { ChevronDown } from "lucide-react";

import { usePreferencias } from "@/shared/preferencias/preferencias-provider";
import { ROTULO_DO_PAPEL, type PessoaDaEquipe } from "@/shared/sessao/sessao";
import { useMenuDoUsuario } from "./use-menu-do-usuario";

/**
 * O avatar da faixa do topo e o painel com quem está na sessão e o tema. Sair
 * entra junto com o login da equipe (ADR-0020).
 */
export function MenuDoUsuario({ pessoa }: { pessoa: PessoaDaEquipe }) {
  const { aberto, alternar, raiz, gatilho, presenca } = useMenuDoUsuario();
  const { preferencias, mudar } = usePreferencias();
  const papel = ROTULO_DO_PAPEL[pessoa.papel];

  return (
    <div ref={raiz} className="relative">
      <button
        ref={gatilho}
        type="button"
        aria-expanded={aberto}
        aria-controls="menu-do-usuario"
        onClick={alternar}
        className="flex cursor-pointer items-center gap-2.5 rounded-full p-1 pr-2 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Avatar nome={pessoa.nome} tamanho="sm" />
        <span className="flex flex-col text-left leading-tight max-md:hidden">
          <span className="text-sm font-bold text-foreground">
            {pessoa.nome}
          </span>
          <span className="text-xs text-foreground-muted">{papel}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 text-foreground-muted transition-transform duration-200",
            aberto && "rotate-180"
          )}
        />
        <span className="sr-only">Menu de {pessoa.nome}</span>
      </button>

      {presenca.montado && (
        <div
          id="menu-do-usuario"
          className={cn(
            "absolute top-full right-0 z-50 mt-2 w-72 origin-top-right rounded-card border border-border bg-surface-raised p-4 shadow-popover",
            presenca.saindo ? "animate-popover-out" : "animate-popover-in"
          )}
        >
          <div className="flex items-center gap-3">
            <Avatar nome={pessoa.nome} tamanho="md" />
            <div className="min-w-0">
              <p className="truncate font-bold text-foreground">
                {pessoa.nome}
              </p>
              <p className="text-sm text-foreground-muted">{papel}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 text-xs font-bold tracking-wide text-foreground-subtle uppercase">
              Tema
            </p>
            <SeletorDeTema
              valor={preferencias.tema}
              aoMudar={(tema) => mudar("tema", tema)}
            />
          </div>
          <p className="mt-4 rounded-control bg-warning-subtle px-3 py-2 text-xs text-warning">
            Painel sem login nesta fase: os dados são provisórios e só existem
            no desenvolvimento.
          </p>
        </div>
      )}
    </div>
  );
}
