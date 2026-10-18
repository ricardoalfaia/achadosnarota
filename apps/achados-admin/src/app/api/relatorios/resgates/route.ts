import type { NextRequest } from "next/server";
import { ehUlid } from "@achados/db";

import { linhasParaExportar } from "@/features/relatorios/consultas.servidor";
import {
  csvDosResgates,
  lerPeriodo,
} from "@/features/relatorios/domain/relatorio";
import { respostaDe } from "@/shared/consultas/resposta.servidor";

/**
 * O CSV do relatório de resgates (`?periodo=30d&casa=<ulid>`). A sessão da
 * equipe e o papel são conferidos no servidor; a RLS só entrega resgates à
 * administração e ao comercial. Sem cache: é dado operacional.
 */
export async function GET(pedido: NextRequest) {
  const parametros = pedido.nextUrl.searchParams;
  const periodo = lerPeriodo(parametros.get("periodo"));
  const casa = parametros.get("casa");
  const linhas = await linhasParaExportar({
    periodo,
    casaId: casa && ehUlid(casa) ? casa : null,
  });
  if (!linhas.ok) return respostaDe(linhas, "no-store");

  // BOM para o Excel abrir os acentos certos.
  const corpo = `﻿${csvDosResgates(linhas.value)}`;
  return new Response(corpo, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="resgates-${periodo}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
