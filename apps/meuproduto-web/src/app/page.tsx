import { redirect } from "next/navigation";
import { Botao, EstadoVazio } from "@meuproduto/ui";
import { Building2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Marca } from "@/shared/marca";
import { baseDoTenant } from "@/shared/rotas";
import { sair } from "@/shared/sessao/sair";
import { exigirSessao } from "@/shared/sessao/sessao.servidor";

/**
 * A raiz: sem sessão, o login (pelo proxy e por `exigirSessao`); com tenants,
 * o primeiro deles (em ordem de nome); sem nenhum, um aviso de que a conta
 * ainda não tem acesso a um escritório, com a saída.
 */
export default async function Raiz() {
  const { vinculos } = await exigirSessao();
  const primeiro = vinculos[0];
  if (primeiro) redirect(baseDoTenant(primeiro.slug));

  const t = await getTranslations("SemAcesso");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-5 py-10">
      <h1 aria-label="Meuproduto">
        <Marca />
      </h1>
      <EstadoVazio
        icone={<Building2 />}
        titulo={t("titulo")}
        descricao={t("descricao")}
        nivelDoTitulo="h2"
        acao={
          <form action={sair}>
            <Botao type="submit" variante="contorno">
              {t("sair")}
            </Botao>
          </form>
        }
        className="w-full max-w-lg"
      />
    </main>
  );
}
