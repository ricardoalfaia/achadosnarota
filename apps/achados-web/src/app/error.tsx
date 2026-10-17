"use client";

import { Botao, EstadoVazio } from "@achados/ui";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Falha inesperada ao montar uma tela (banco fora do ar ao conferir a sessão
 * ou o tenant). Nada do erro aparece: o detalhe fica no log do servidor.
 */
export default function Erro({ retry }: { retry: () => void }) {
  const t = useTranslations("Erro");
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <EstadoVazio
        icone={<TriangleAlert />}
        titulo={t("titulo")}
        descricao={t("descricao")}
        nivelDoTitulo="h2"
        acao={
          <Botao type="button" onClick={() => retry()}>
            {t("tentarDeNovo")}
          </Botao>
        }
        className="w-full max-w-lg"
      />
    </main>
  );
}
