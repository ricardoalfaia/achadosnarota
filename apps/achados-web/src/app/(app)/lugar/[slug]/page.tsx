import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { unwrapOrThrow } from "@achados/core";
import { EstadoVazio, Etiqueta } from "@achados/ui";
import { HydrationBoundary } from "@tanstack/react-query";
import { Ticket } from "lucide-react";

import {
  BarraDoBeneficio,
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
  CabecalhoDaFicha,
  FaixaDeFotos,
  GaleriaDeFotos,
  ResumoDaCuradoria,
  SobreOLugar,
  textoDaRegraDeUso,
  TopoDaFicha,
} from "@/features/catalogo";
import { lerFichaDoLugar } from "@/features/catalogo/servidor";
import { BotaoDeFavorito } from "@/features/favoritos";
import { prefetchDosFavoritos } from "@/features/favoritos/servidor";
import { lerPassaporte } from "@/features/passaporte/servidor";
import { estadoDesidratado } from "@/shared/consultas/cliente.servidor";
import { rotaDeEntrar, rotaDoLugar } from "@/shared/rotas";
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

/**
 * A ficha pública de um lugar (protótipo, tela 2). No celular, a foto domina
 * com o nome por cima, e o pé fixo leva ao benefício no lugar da barra de
 * navegação; no desktop, foto e texto lado a lado.
 */
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
  const [principal] = ficha.beneficios;

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
        >
          <CabecalhoDaFicha lugar={ficha} variante="foto" />
        </TopoDaFicha>

        <div className="flex flex-col gap-5 px-4 pt-5 lg:gap-4 lg:p-0">
          <CabecalhoDaFicha
            lugar={ficha}
            variante="pagina"
            className="hidden lg:block"
          />

          <FaixaDeFotos
            fotos={ficha.fotos}
            hrefDasFotos={`${caminho}?aba=fotos#abas`}
          />

          {ficha.tags.length > 0 && (
            <ul aria-label="Características" className="flex flex-wrap gap-1.5">
              {ficha.tags.map((tag) => (
                <li key={tag}>
                  <Etiqueta tom="neutro">{tag}</Etiqueta>
                </li>
              ))}
            </ul>
          )}

          <p className="text-[15px] leading-relaxed text-foreground-muted lg:text-sm">
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

          {ficha.avaliacao && (
            <ResumoDaCuradoria
              avaliacao={ficha.avaliacao}
              hrefDaAvaliacao={`${caminho}?aba=avaliacoes#avaliacao`}
            />
          )}

          <AbasDaFicha
            inicial={abaDaFicha(busca.aba)}
            cupons={
              <section
                id="beneficios"
                aria-labelledby="titulo-beneficios"
                className="scroll-mt-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h2
                      id="titulo-beneficios"
                      className="text-lg font-extrabold tracking-tight text-foreground"
                    >
                      Benefícios exclusivos
                    </h2>
                    <p className="text-xs text-foreground-muted">
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
                            beneficioId={beneficio.id}
                            regraDeUso={textoDaRegraDeUso(beneficio)}
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
      {principal && (
        <BarraDoBeneficio
          titulo={principal.titulo}
          total={ficha.beneficios.length}
          situacao={situacao}
          hrefDosBeneficios={`${caminho}?aba=cupons#beneficios`}
          hrefDeEntrar={rotaDeEntrar(caminho)}
        />
      )}
    </HydrationBoundary>
  );
}
