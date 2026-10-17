import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { unwrapOrThrow } from "@achados/core";
import { EstadoVazio, Nota } from "@achados/ui";
import { estiloDoBotao } from "@achados/ui/estilos";
import { HydrationBoundary } from "@tanstack/react-query";
import { Heart } from "lucide-react";

import { IconeDoBeneficio, type Lugar } from "@/features/catalogo";
import { BotaoDeFavorito } from "@/features/favoritos";
import {
  listarFavoritos,
  prefetchDosFavoritos,
} from "@/features/favoritos/servidor";
import { CabecalhoDoApp } from "@/shared/casca/cabecalho-do-app";
import { estadoDesidratado } from "@/shared/consultas/cliente.servidor";
import { rotaDeEntrar, rotaDoLugar, ROTAS } from "@/shared/rotas";
import { pessoaDaSessao } from "@/shared/sessao/sessao";
import { sessaoLiberada } from "@/shared/sessao/sessao.servidor";

export const metadata: Metadata = {
  title: "Meus favoritos",
  robots: { index: false },
};

function ItemFavorito({ lugar }: { lugar: Lugar }) {
  return (
    <li className="relative flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm transition-colors hover:border-primary-border">
      <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-surface-hover">
        {lugar.foto && (
          <Image
            src={lugar.foto.url}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="truncate text-xs font-bold text-foreground">
            <Link
              href={rotaDoLugar(lugar.slug)}
              className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-ring"
            >
              {lugar.nome}
            </Link>
          </h2>
          {lugar.nota !== undefined && <Nota valor={lugar.nota} tamanho="xs" />}
        </div>
        <p className="mt-0.5 truncate text-[11px] text-foreground-muted">
          {lugar.local}
        </p>
        {lugar.beneficio && (
          <p className="mt-1 flex items-center gap-1 truncate text-[10px] font-bold text-primary">
            <IconeDoBeneficio
              chave={lugar.beneficio.icone}
              className="size-3 shrink-0 text-brand"
            />
            <span className="truncate">{lugar.beneficio.titulo}</span>
          </p>
        )}
      </div>
      <div className="relative z-10">
        <BotaoDeFavorito slug={lugar.slug} nome={lugar.nome} />
      </div>
    </li>
  );
}

/** Meus favoritos (protótipo, tela 4): os lugares salvos por quem entrou. */
export default async function Favoritos() {
  const usuario = await sessaoLiberada();
  const [lista] = await Promise.all([
    usuario ? listarFavoritos(usuario.id) : null,
    prefetchDosFavoritos(),
  ]);
  const favoritos = lista ? unwrapOrThrow(lista) : [];

  return (
    <>
      <CabecalhoDoApp pessoa={usuario ? pessoaDaSessao(usuario) : null} />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-extrabold text-foreground">
            Meus Favoritos
          </h1>
          {usuario && favoritos.length > 0 && (
            <span className="text-xs font-bold text-foreground-muted">
              {favoritos.length}{" "}
              {favoritos.length === 1 ? "lugar salvo" : "lugares salvos"}
            </span>
          )}
        </div>

        {!usuario ? (
          <EstadoVazio
            icone={<Heart />}
            titulo="Salve os lugares que você quer conhecer"
            descricao="Entre na sua conta para guardar seus favoritos e encontrá-los em qualquer aparelho."
            acao={
              <Link
                href={rotaDeEntrar(ROTAS.favoritos)}
                className={estiloDoBotao()}
              >
                Entrar
              </Link>
            }
          />
        ) : favoritos.length === 0 ? (
          <EstadoVazio
            icone={<Heart />}
            titulo="Nenhum favorito salvo ainda"
            descricao="Toque no coração dos estabelecimentos para salvá-los aqui."
            acao={
              <Link href={ROTAS.explorar} className={estiloDoBotao()}>
                Explorar lugares
              </Link>
            }
          />
        ) : (
          <HydrationBoundary state={estadoDesidratado()}>
            <ul className="flex flex-col gap-3">
              {favoritos.map((lugar) => (
                <ItemFavorito key={lugar.slug} lugar={lugar} />
              ))}
            </ul>
          </HydrationBoundary>
        )}
      </div>
    </>
  );
}
