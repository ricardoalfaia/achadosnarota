"use client";

import Link from "next/link";
import {
  Aba,
  Abas,
  Cartao,
  CorpoDoCartao,
  Esqueleto,
  EstadoVazio,
  ListaDeAbas,
  PainelDaAba,
} from "@achados/ui";
import { ChevronRight, PartyPopper } from "lucide-react";

import type { ItemDaFila } from "../domain/tipos";
import {
  useFilaDeTrabalho,
  type AbaDaFila,
} from "../hooks/use-resumo-do-painel";

const ABAS: { valor: AbaDaFila; rotulo: string; vazio: string }[] = [
  {
    valor: "curadoria",
    rotulo: "Curadoria",
    vazio: "Nenhuma avaliação esperando revisão.",
  },
  {
    valor: "promocoes",
    rotulo: "Promoções",
    vazio: "Nenhuma promoção esperando revisão.",
  },
  {
    valor: "casas",
    rotulo: "Casas",
    vazio: "Todas as casas estão publicadas e com fotos.",
  },
];

/**
 * O que a equipe tem a fazer, por área. As abas mantêm o estado com
 * `Activity` (`manterEstado`): voltar a uma aba encontra a lista como estava.
 */
export function FilaDeTrabalho() {
  const { fila, aba, mudarAba } = useFilaDeTrabalho();

  return (
    <Cartao className="h-full">
      <CorpoDoCartao className="flex h-full flex-col gap-2">
        <h2 className="text-lg font-bold text-foreground">Fila de trabalho</h2>
        <Abas<AbaDaFila>
          valor={aba}
          aoMudar={mudarAba}
          variante="segmentos"
          manterEstado
          className="flex min-h-0 flex-1 flex-col"
        >
          <ListaDeAbas rotulo="Áreas da fila">
            {ABAS.map((a) => (
              <Aba
                key={a.valor}
                valor={a.valor}
                contador={fila[a.valor].length}
              >
                {a.rotulo}
              </Aba>
            ))}
          </ListaDeAbas>
          {ABAS.map((a) => (
            <PainelDaAba key={a.valor} valor={a.valor}>
              <ListaDaFila itens={fila[a.valor]} vazio={a.vazio} />
            </PainelDaAba>
          ))}
        </Abas>
      </CorpoDoCartao>
    </Cartao>
  );
}

function ListaDaFila({
  itens,
  vazio,
}: {
  itens: readonly ItemDaFila[];
  vazio: string;
}) {
  if (itens.length === 0)
    return (
      <EstadoVazio
        icone={<PartyPopper />}
        titulo="Tudo em dia"
        descricao={vazio}
        className="border-none py-8"
      />
    );
  return (
    <ul className="flex max-h-80 flex-col divide-y divide-border overflow-y-auto">
      {itens.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className="group flex items-center gap-3 rounded-control px-2 py-3 outline-none hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-foreground">
                {item.titulo}
              </span>
              <span className="block truncate text-sm text-foreground-muted">
                {item.detalhe}
              </span>
            </span>
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-foreground-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function EsqueletoDaFila() {
  return (
    // A moldura do cartão final, com a mesma altura (ADR-0016).
    <Cartao className="h-full">
      <CorpoDoCartao className="flex flex-col gap-4">
        <Esqueleto className="h-6 w-40 rounded" />
        <Esqueleto className="h-10 w-full rounded-full" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-1.5 py-1">
            <Esqueleto className="h-4 w-1/2 rounded" />
            <Esqueleto className="h-3.5 w-1/3 rounded" />
          </div>
        ))}
      </CorpoDoCartao>
    </Cartao>
  );
}
