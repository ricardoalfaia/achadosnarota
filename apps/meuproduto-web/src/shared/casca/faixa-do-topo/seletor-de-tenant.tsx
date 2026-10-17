"use client";

import { usePathname, useRouter } from "next/navigation";
import { BotaoDeMenu, ItemDeMenu, RotuloDeMenu } from "@meuproduto/ui";
import { Building2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { mesmaTelaEmOutroTenant } from "@/shared/rotas";
import type { TenantDaLista } from "@/shared/sessao/sessao";

/**
 * O tenant ativo na faixa do topo. Com mais de um, vira um menu: escolher
 * outro navega para a mesma tela em `/t/<outro>`, onde o servidor confere o
 * vínculo de novo. Não há estado global: o tenant ativo é o da URL.
 */
export function SeletorDeTenant({
  ativo,
  tenants,
}: {
  ativo: TenantDaLista;
  tenants: readonly TenantDaLista[];
}) {
  const t = useTranslations("Faixa");
  const caminho = usePathname();
  const router = useRouter();
  const outros = tenants.filter((tenant) => tenant.slug !== ativo.slug);

  if (outros.length === 0) {
    return (
      <span
        title={t("tenantAtivo", { tenant: ativo.nome })}
        className="flex max-w-56 items-center gap-2 rounded-control border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-foreground max-md:hidden"
      >
        <Building2
          aria-hidden="true"
          className="size-4 shrink-0 text-foreground-muted"
        />
        <span className="sr-only">{t("tenant")}</span>
        <span className="truncate">{ativo.nome}</span>
      </span>
    );
  }

  return (
    <div
      className="max-md:hidden"
      title={t("tenantAtivo", { tenant: ativo.nome })}
    >
      <BotaoDeMenu
        rotulo={ativo.nome}
        icone={<Building2 aria-hidden="true" />}
        alinhamento="fim"
        tamanho="sm"
      >
        <RotuloDeMenu>{t("trocarTenant")}</RotuloDeMenu>
        {outros.map((tenant) => (
          <ItemDeMenu
            key={tenant.slug}
            icone={<Building2 aria-hidden="true" />}
            aoEscolher={() =>
              router.push(
                mesmaTelaEmOutroTenant(caminho, ativo.slug, tenant.slug)
              )
            }
          >
            {tenant.nome}
          </ItemDeMenu>
        ))}
      </BotaoDeMenu>
    </div>
  );
}
