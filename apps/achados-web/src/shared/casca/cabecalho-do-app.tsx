import Link from "next/link";
import { Avatar } from "@achados/ui";
import { estiloDoBotao } from "@achados/ui/estilos";

import { ROTAS } from "@/shared/rotas";
import type { PessoaDaSessao } from "@/shared/sessao/sessao";
import { BotaoDeNotificacoes } from "./botao-de-notificacoes";
import { Marca } from "./marca";

/**
 * O topo fixo das telas de exploração: a marca (que leva ao início), o sino e
 * o avatar de quem entrou, que leva ao perfil. Sem sessão, o avatar dá lugar
 * a "Entrar". Só no celular: a partir de 1024px o layout usa o cabeçalho
 * desktop.
 */
export function CabecalhoDoApp({ pessoa }: { pessoa: PessoaDaSessao | null }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-header px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-md lg:hidden">
      <Link
        href={ROTAS.explorar}
        aria-label="Achados na Rota, início"
        className="group rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&_img]:transition-transform [&_img]:duration-200 hover:[&_img]:scale-105"
      >
        <Marca />
      </Link>
      <div className="flex items-center gap-2.5">
        <BotaoDeNotificacoes />
        {pessoa ? (
          <Link
            href={ROTAS.perfil}
            aria-label="Meu perfil"
            className="rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Avatar
              nome={pessoa.nome}
              tamanho="sm"
              className="size-8"
              {...(pessoa.fotoUrl ? { fotoUrl: pessoa.fotoUrl } : {})}
            />
          </Link>
        ) : (
          <Link
            href={ROTAS.entrar}
            className={estiloDoBotao({ variante: "solido", tamanho: "xs" })}
          >
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
