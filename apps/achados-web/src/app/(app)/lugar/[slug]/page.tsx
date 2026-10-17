import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { unwrapOrThrow } from "@achados/core";
import { EstadoVazio, Etiqueta, Nota } from "@achados/ui";
import { HydrationBoundary } from "@tanstack/react-query";
import { MapPin, Ticket } from "lucide-react";

import {
  BotaoDeResgate,
  CartaoDeBeneficio,
  situacaoDoResgate,
} from "@/features/beneficios";
import {
  abaDaFicha,
  AbasDaFicha,
  AcoesRapidas,
  AvaliacaoEditorial,
  BotaoDeCompartilhar,
  GaleriaDeFotos,
  SeloDaCuradoria,
  SobreOLugar,
  TopoDaFicha,
} from "@/features/catalogo";
import { lerFichaDoLugar } from "@/features/catalogo/servidor";
import { BotaoDeFavorito } from "@/features/favoritos";
import { prefetchDosFavoritos } from "@/features/favoritos/servidor";
import { lerPassaporte } from "@/features/passaporte/servidor";
import { estadoDesidratado } from "@/shared/consultas/cliente.servidor";
import { rotaDoLugar } from "@/shared/rotas";
import { sessaoLiberada } from "@/shared/sessao/sessao.servidor";

export async function generateMetadata({
  params,
}: PageProps<"/lugar/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const ficha = await lerFichaDoLugar(slug);
  if (!ficha.ok || !ficha.value) return {};
  const lugar = ficha.value;
  return {
    title: `${lugar.nome} · ${lugar.local}`,
    description: lugar.resumo,
    alternates: { canonical: rotaDoLugar(lugar.slug) },
    openGraph: {
      title: lugar.nome,
      description: lugar.resumo,
      ...(lugar.foto
        ? { images: [{ url: lugar.foto.url, alt: lugar.foto.alt }] }
        : {}),
    },
  };
}

/** A ficha pública de um lugar (protótipo, tela 2). */
export default async function PaginaDoLugar({
  params,
  searchParams,
}: PageProps<"/lugar/[slug]">) {
  const [{ slug }, busca] = await Promise.all([params, searchParams]);
  const ficha = unwrapOrThrow(await lerFichaDoLugar(slug));
  if (!ficha) notFound();

  const usuario = await sessaoLiberada();
  const [passaporte] = await Promise.all([
    usuario ? lerPassaporte(usuario.id) : null,
    prefetchDosFavoritos(),
  ]);
  const situacao = situacaoDoResgate({
    logado: usuario !== null,
    passaporteAtivo: passaporte
      ? unwrapOrThrow(passaporte).situacao === "ativo"
      : false,
  });
  const caminho = rotaDoLugar(ficha.slug);

  return (
    <HydrationBoundary state={estadoDesidratado()}>
      <article className="pb-6 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-12 lg:px-8 lg:py-10">
        <TopoDaFicha
          totalDeFotos={ficha.fotos.length}
          hrefDasFotos={`${caminho}?aba=fotos`}
          {...(ficha.foto ? { foto: ficha.foto } : {})}
          acoes={
            <>
              <BotaoDeCompartilhar titulo={ficha.nome} caminho={caminho} />
              <BotaoDeFavorito
                slug={ficha.slug}
                nome={ficha.nome}
                tamanho="md"
              />
            </>
          }
        />

        <div className="flex flex-col gap-4 p-4 lg:p-0">
          <header>
            {ficha.avaliacao && <SeloDaCuradoria />}
            <h1 className="mt-2 text-2xl leading-tight font-extrabold text-foreground lg:text-4xl lg:tracking-tight">
              {ficha.nome}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              {ficha.nota !== undefined && (
                <Nota valor={ficha.nota} complemento="(curadoria)" />
              )}
              {ficha.nota !== undefined && (
                <span aria-hidden="true" className="text-foreground-subtle">
                  •
                </span>
              )}
              <span className="flex items-center gap-1 text-foreground-muted">
                <MapPin aria-hidden="true" className="size-3.5" />
                {ficha.local}
              </span>
            </div>
          </header>

          {ficha.tags.length > 0 && (
            <ul aria-label="Características" className="flex flex-wrap gap-1.5">
              {ficha.tags.map((tag) => (
                <li key={tag}>
                  <Etiqueta tom="neutro">{tag}</Etiqueta>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs leading-relaxed text-foreground-muted">
            {ficha.resumo}
          </p>

          <AcoesRapidas
            lugar={ficha}
            compartilhar={
              <BotaoDeCompartilhar
                titulo={ficha.nome}
                caminho={caminho}
                aparencia="acao"
              />
            }
          />

          <AbasDaFicha
            inicial={abaDaFicha(busca.aba)}
            cupons={
              <section aria-labelledby="titulo-beneficios">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h2
                      id="titulo-beneficios"
                      className="text-sm font-extrabold text-foreground"
                    >
                      Benefícios exclusivos
                    </h2>
                    <p className="text-[11px] text-foreground-muted">
                      Aproveite com seu Passaporte Achados na Rota.
                    </p>
                  </div>
                  {ficha.beneficios.length > 0 && (
                    <Etiqueta tom="sucessoSuave" tamanho="sm">
                      ★ Confirmado pelo parceiro
                    </Etiqueta>
                  )}
                </div>
                {ficha.beneficios.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {ficha.beneficios.map((beneficio) => (
                      <CartaoDeBeneficio
                        key={beneficio.id}
                        beneficio={beneficio}
                        acao={
                          <BotaoDeResgate
                            titulo={beneficio.titulo}
                            regras={beneficio.regras}
                            lugar={`${ficha.nome} • ${ficha.local}`}
                            situacao={situacao}
                          />
                        }
                      />
                    ))}
                  </ul>
                ) : (
                  <EstadoVazio
                    icone={<Ticket />}
                    titulo="Sem benefícios no momento"
                    descricao="Este lugar ainda não tem benefício ativo para assinantes."
                    className="py-8"
                  />
                )}
              </section>
            }
            avaliacoes={<AvaliacaoEditorial avaliacao={ficha.avaliacao} />}
            fotos={<GaleriaDeFotos fotos={ficha.fotos} />}
            sobre={<SobreOLugar lugar={ficha} />}
          />
        </div>
      </article>
    </HydrationBoundary>
  );
}
