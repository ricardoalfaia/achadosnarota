import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ChartColumn,
  ChevronRight,
  FileText,
  LayoutGrid,
  LayoutTemplate,
  PenLine,
  Plug,
  Rocket,
  Settings,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { conteudo } from "@/shared/conteudo";
import { comIdioma, ehIdioma } from "@/shared/idiomas";
import { Logotipo } from "@/shared/layout";
import { MODULOS, type Modulo } from "@/shared/modulos";
import { textosDe } from "@/shared/textos";
import { BuscaDoInicio } from "./busca";

// As seções em destaque. Título e descrição vêm da própria página de cada
// seção, em content/docs.
const SECOES: { slug: string[]; icone: LucideIcon }[] = [
  { slug: ["primeiros-passos"], icone: Rocket },
  { slug: ["modulos"], icone: LayoutGrid },
];

// Os mesmos ícones de cada área no menu lateral do sistema.
const ICONE_DO_MODULO: Record<Modulo, LucideIcon> = {
  documentos: FileText,
  modelos: LayoutTemplate,
  assinaturas: PenLine,
  clientes: Users,
  equipe: UsersRound,
  relatorios: ChartColumn,
  integracoes: Plug,
  configuracoes: Settings,
};

/** Quantas páginas aparecem no painel de acesso rápido. */
const PAGINAS_NO_ACESSO_RAPIDO = 4;

export default async function PaginaInicial({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!ehIdioma(lang)) notFound();

  const textos = textosDe(lang);
  const { inicio } = textos;
  const secoes = SECOES.flatMap(({ slug, icone }) => {
    const pagina = conteudo.getPage(slug, lang);
    return pagina ? [{ pagina, Icone: icone }] : [];
  });
  const acessoRapido = conteudo
    .getPages(lang)
    .slice(0, PAGINAS_NO_ACESSO_RAPIDO);
  const enderecoDosModulos = comIdioma(lang, "/docs/modulos");

  return (
    <main className="flex flex-1 flex-col">
      <section className="fundo-de-destaque relative overflow-hidden border-b border-border">
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:py-28">
          <div className="flex min-w-0 flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold tracking-widest text-primary uppercase">
              <span
                className="size-1.5 rounded-full bg-brand-gradient"
                aria-hidden
              />
              {inicio.selo}
            </span>
            <h1 className="md:text-5xl text-4xl leading-tight font-extrabold tracking-tight text-balance text-foreground">
              {inicio.titulo}{" "}
              <span className="text-brand-gradient">
                {inicio.tituloDestaque}
              </span>
            </h1>
            <p className="max-w-xl text-lg text-foreground-muted">
              {inicio.descricao}
            </p>
            <BuscaDoInicio rotulo={inicio.buscar} />
            <Link
              href={comIdioma(lang, "/docs")}
              className="inline-flex items-center gap-2 rounded-control bg-brand-gradient-action px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            >
              {inicio.comecar}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <nav
            aria-label={inicio.acessoRapido}
            className="min-w-0 rounded-overlay border border-border bg-surface p-2 shadow-xl"
          >
            <p className="flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-widest text-foreground-muted uppercase">
              {inicio.acessoRapido}
            </p>
            <ul>
              {acessoRapido.map((pagina) => (
                <li key={pagina.url}>
                  <Link
                    href={pagina.url}
                    className="group flex items-center gap-3 rounded-card px-4 py-3 transition-colors hover:bg-surface-hover"
                  >
                    <FileText
                      className="size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-semibold">{pagina.data.title}</span>
                      <span className="truncate text-sm text-foreground-muted">
                        {pagina.data.description}
                      </span>
                    </span>
                    <ChevronRight
                      className="size-4 shrink-0 text-foreground-subtle transition-transform group-hover:translate-x-1 group-hover:text-primary"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pt-16">
        <h2 className="text-2xl font-bold tracking-tight">{inicio.secoes}</h2>
        <p className="mt-1 text-foreground-muted">{inicio.secoesDescricao}</p>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {secoes.map(({ pagina, Icone }) => (
            <li key={pagina.url}>
              <Link
                href={pagina.url}
                className="group flex h-full items-start gap-4 rounded-card border border-border bg-surface p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lg"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-card bg-primary-subtle text-primary">
                  <Icone className="size-6" aria-hidden />
                </span>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="text-lg font-semibold">
                    {pagina.data.title}
                  </span>
                  <span className="text-sm text-foreground-muted">
                    {pagina.data.description}
                  </span>
                </span>
                <ArrowRight
                  className="mt-1 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {inicio.modulos}
            </h2>
            <p className="mt-1 text-foreground-muted">
              {inicio.modulosDescricao}
            </p>
          </div>
          <Link
            href={enderecoDosModulos}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            {inicio.verTodos}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {MODULOS.map((modulo) => {
            const Icone = ICONE_DO_MODULO[modulo];
            return (
              <li key={modulo}>
                <Link
                  href={enderecoDosModulos}
                  className="group flex items-center gap-3 rounded-card border border-border bg-surface p-4 transition-all hover:border-border-strong hover:shadow-md"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-subtle text-primary">
                    <Icone className="size-5" aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold">
                      {textos.modulos[modulo]}
                    </span>
                    <span className="truncate text-xs text-foreground-muted">
                      {inicio.emConstrucao}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="mt-auto border-t border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-foreground-muted">
          <Logotipo altura={32} />
          <span>
            © {new Date().getFullYear()} Meuproduto. {textos.rodape.direitos}
          </span>
        </div>
      </footer>
    </main>
  );
}
