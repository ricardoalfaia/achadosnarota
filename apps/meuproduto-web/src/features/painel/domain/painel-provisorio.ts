import { Ok, type AppError, type Result } from "@meuproduto/core";

import type { Painel } from "./painel";

// PROVISÓRIO: dados SINTÉTICOS do painel, até existir a API do Meuproduto. Nada
// aqui é de cliente real: os nomes são tipos de documento e de modelo, sem
// pessoas, e os números são de exemplo. A leitura devolve `Result` como fará a
// API, então trocar a fonte não muda quem consome.

export const PAINEL_PROVISORIO: Painel = {
  indicadores: [
    {
      id: "documentos",
      valor: 24,
      variacao: { percentual: 12, tendencia: "alta" },
    },
    {
      id: "assinaturas",
      valor: 18,
      variacao: { percentual: 8, tendencia: "alta" },
    },
    {
      id: "clientes",
      valor: 12,
      variacao: { percentual: 3, tendencia: "alta" },
    },
    {
      id: "pendentes",
      valor: 6,
      variacao: { percentual: 2, tendencia: "baixa" },
    },
  ],
  documentosRecentes: [
    {
      id: "doc-1",
      nome: "Contrato de prestação de serviços",
      status: "assinado",
      atualizadoEm: "2026-10-16T14:32:00-03:00",
    },
    {
      id: "doc-2",
      nome: "Procuração",
      status: "emAndamento",
      atualizadoEm: "2026-10-14T10:21:00-03:00",
    },
    {
      id: "doc-3",
      nome: "Proposta comercial",
      status: "aguardando",
      atualizadoEm: "2026-10-12T16:45:00-03:00",
    },
    {
      id: "doc-4",
      nome: "Termo de confidencialidade",
      status: "assinado",
      atualizadoEm: "2026-10-10T09:18:00-03:00",
    },
    {
      id: "doc-5",
      nome: "Contrato de locação",
      status: "rascunho",
      atualizadoEm: "2026-10-09T11:03:00-03:00",
    },
  ],
  modelosMaisUsados: [
    { id: "mod-1", nome: "Procuração", usos: 12, icone: "documento" },
    { id: "mod-2", nome: "Contrato de serviços", usos: 8, icone: "documento" },
    {
      id: "mod-3",
      nome: "Termo de confidencialidade",
      usos: 6,
      icone: "cadeado",
    },
    { id: "mod-4", nome: "Proposta comercial", usos: 5, icone: "documento" },
  ],
};

/** A leitura provisória do painel: sempre `Ok`, com os dados sintéticos. */
export async function lerPainelProvisorio(): Promise<Result<Painel, AppError>> {
  return Ok(PAINEL_PROVISORIO);
}
