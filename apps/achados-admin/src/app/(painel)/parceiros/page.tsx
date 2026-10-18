import type { Metadata } from "next";
import { unwrapOrThrow } from "@achados/core";
import { EstadoVazio } from "@achados/ui";
import { ShieldAlert, Store, UserMinus } from "lucide-react";

import { desvincularOperador } from "@/features/operadores/actions";
import { VincularOperador } from "@/features/operadores/components/vincular-operador";
import { casasComOperadores } from "@/features/operadores/consultas.servidor";
import { CabecalhoDaPagina } from "@/shared/casca/cabecalho-da-pagina";
import { podeEscrever } from "@/shared/sessao/sessao";
import { exigirEquipe } from "@/shared/sessao/sessao.servidor";

export const metadata: Metadata = { title: "Parceiros" };

/**
 * Parceiros (Comercial): por enquanto, os operadores do balcão de cada casa,
 * que validam o código de resgate no app. Só a administração vincula; o banco
 * confere de novo (RLS).
 */
export default async function PaginaDeParceiros() {
  const pessoa = await exigirEquipe();
  const cabecalho = (
    <CabecalhoDaPagina
      secao="Comercial"
      titulo="Parceiros"
      descricao="Quem opera o balcão de cada casa e valida o código de resgate do cliente."
    />
  );
  if (!podeEscrever(pessoa, "operadores")) {
    return (
      <>
        {cabecalho}
        <EstadoVazio
          icone={<ShieldAlert />}
          titulo="Só a administração gerencia os operadores"
          className="py-16"
        />
      </>
    );
  }

  const casas = unwrapOrThrow(await casasComOperadores());
  return (
    <>
      {cabecalho}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          aria-label="Operadores por casa"
          className="flex flex-col gap-3"
        >
          {casas.length === 0 && (
            <EstadoVazio icone={<Store />} titulo="Nenhuma casa cadastrada" />
          )}
          {casas.map((casa) => (
            <article
              key={casa.id}
              className="rounded-card bg-surface p-4 ring-1 ring-border/60"
            >
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                <Store aria-hidden="true" className="size-4 text-brand" />
                {casa.nome}
              </h2>
              {casa.operadores.length === 0 ? (
                <p className="mt-2 text-sm text-foreground-muted">
                  Sem operador no balcão.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-border">
                  {casa.operadores.map((operador) => (
                    <li
                      key={operador.usuarioId}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {operador.nome}
                        </span>
                        <span className="block truncate text-xs text-foreground-muted">
                          {operador.email}
                        </span>
                      </span>
                      <form action={desvincularOperador}>
                        <input
                          type="hidden"
                          name="usuarioId"
                          value={operador.usuarioId}
                        />
                        <input type="hidden" name="casaId" value={casa.id} />
                        <button
                          type="submit"
                          className="flex cursor-pointer items-center gap-1 rounded-control px-2 py-1 text-xs font-bold text-danger outline-none hover:bg-danger-subtle focus-visible:outline-2 focus-visible:outline-ring"
                        >
                          <UserMinus aria-hidden="true" className="size-3.5" />
                          Desvincular
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
        <VincularOperador casas={casas} />
      </div>
    </>
  );
}
