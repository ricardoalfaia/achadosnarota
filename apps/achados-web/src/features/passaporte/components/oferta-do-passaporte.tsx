import Link from "next/link";
import { Botao } from "@achados/ui";
import { estiloDoBotao } from "@achados/ui/estilos";
import { BadgeCheck, Crown, MapPinned, Ticket } from "lucide-react";

import { rotaDeCriarConta } from "@/shared/rotas";
import { formatarPreco, type Plano } from "../domain/passaporte";

const INCLUI = [
  {
    icone: Ticket,
    texto: "Benefícios em restaurantes, cafés e pousadas parceiros",
  },
  {
    icone: BadgeCheck,
    texto: "Lugares avaliados por curadoria, que não vende notas nem selos",
  },
  { icone: MapPinned, texto: "Novos parceiros na rota ao longo do ano" },
];

/**
 * O plano para quem ainda não tem passaporte: o preço vindo do banco, o que
 * inclui e as condições. A assinatura depende do provedor de pagamento (ADR-006
 * de produto), ainda não homologado: o botão fica indisponível e diz isso, sem
 * fingir uma compra.
 */
export function OfertaDoPassaporte({
  plano,
  logado,
}: {
  plano: Plano | null;
  logado: boolean;
}) {
  return (
    <section
      aria-labelledby="titulo-do-plano"
      className="rounded-3xl border-2 border-primary-solid bg-primary-subtle p-4 text-center"
    >
      <span className="text-[10px] font-extrabold tracking-wide text-primary uppercase">
        <Crown aria-hidden="true" className="mr-1 inline size-3 text-star" />
        Passaporte anual
      </span>
      <h2 id="titulo-do-plano" className="sr-only">
        {plano?.nome ?? "Passaporte anual"}
      </h2>
      {plano && (
        <p className="mt-1 text-2xl font-extrabold text-foreground">
          {formatarPreco(plano.precoEmCentavos, plano.moeda)}
          <span className="text-xs font-normal text-foreground-muted">
            {" "}
            /ano
          </span>
        </p>
      )}
      <ul className="mt-3 flex flex-col gap-2 text-left">
        {INCLUI.map(({ icone: Icone, texto }) => (
          <li
            key={texto}
            className="flex items-start gap-2 text-xs text-foreground"
          >
            <Icone
              aria-hidden="true"
              className="mt-px size-4 shrink-0 text-brand"
            />
            {texto}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] leading-relaxed text-foreground-muted">
        A assinatura não garante economia: cada benefício tem regras, limites e
        validade, mostrados antes do resgate.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Botao larguraTotal desabilitado aria-describedby="aviso-do-plano">
          Assinar
        </Botao>
        <p id="aviso-do-plano" className="text-[11px] text-foreground-muted">
          A assinatura abre em breve, com pagamento por provedor homologado.
        </p>
        {!logado && (
          <Link
            href={rotaDeCriarConta("/passaporte")}
            className={estiloDoBotao({
              variante: "contorno",
              className: "w-full",
            })}
          >
            Criar conta grátis
          </Link>
        )}
      </div>
    </section>
  );
}
