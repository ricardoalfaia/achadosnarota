import { getTranslations } from "next-intl/server";

import { versoesProvisorias } from "@/features/notas-de-versao";

/** O pé da coluna do formulário: a versão em uso. */
export async function RodapeDeAcesso() {
  const t = await getTranslations("Acesso.rodape");

  return (
    <footer className="text-sm text-foreground-muted">
      <span className="rounded border border-border bg-surface px-1.5 py-px font-mono text-xs font-bold tracking-wide">
        {t("versao", { versao: versoesProvisorias.sistema })}
      </span>
    </footer>
  );
}
