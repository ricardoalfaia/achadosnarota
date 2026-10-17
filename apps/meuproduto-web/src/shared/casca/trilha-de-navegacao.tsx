"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { rotaDoTenant } from "@/shared/rotas";
import { trilhaDoCaminho } from "./trilha";

/** A trilha acima do conteúdo: "Início › Documentos". Some na página inicial. */
export function TrilhaDeNavegacao({ slug }: { slug: string }) {
  const t = useTranslations("Trilha");
  const tNavegacao = useTranslations("Navegacao");
  const trilha = trilhaDoCaminho(slug, usePathname());

  if (trilha.tipo !== "item") return null;

  return (
    <nav
      aria-label={t("rotulo")}
      className="mb-5 flex items-center gap-1.5 text-sm font-medium"
    >
      <Link
        href={rotaDoTenant(slug, "/")}
        className="text-primary hover:underline"
      >
        {tNavegacao("inicio")}
      </Link>
      <ChevronRight
        aria-hidden="true"
        className="size-3.5 text-foreground-subtle"
      />
      <span aria-current="page" className="text-foreground-muted">
        {tNavegacao(trilha.id)}
      </span>
    </nav>
  );
}
