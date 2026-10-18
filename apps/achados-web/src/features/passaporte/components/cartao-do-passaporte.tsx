import Image from "next/image";
import { cn } from "@achados/ui/estilos";
import { Crown } from "lucide-react";

import { dataCurta, type Passaporte } from "../domain/passaporte";

/**
 * O cartão digital do passaporte: asfalto em degradê com brilhos laranja e
 * âmbar, o símbolo, a situação ("Ativo" com a coroa) e, embaixo, o titular e
 * o código do membro. Sem passaporte vigente, o cartão aparece apagado, com
 * "Inativo", para mostrar o que se ganha ao assinar.
 */
export function CartaoDoPassaporte({
  passaporte,
  titular,
}: {
  passaporte: Passaporte;
  /** Nome de quem está logado; sem conta, o cartão não mostra titular. */
  titular?: string;
}) {
  const ativo = passaporte.situacao === "ativo";
  return (
    <section
      aria-label="Cartão do passaporte"
      className="relative overflow-hidden rounded-3xl bg-passport p-5 text-white shadow-xl"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <Image
            src="/marca/simbolo.png"
            alt=""
            width={183}
            height={144}
            className="h-9 w-auto"
          />
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
              ativo
                ? "border-accent-on-dark/30 bg-accent-on-dark/20 text-accent-on-dark"
                : "border-passport-border bg-white/10 text-passport-muted"
            )}
          >
            <Crown aria-hidden="true" className="size-3" />
            {!ativo
              ? "Inativo"
              : passaporte.origem === "cortesia"
                ? "Cortesia"
                : "Passaporte ativo"}
          </span>
        </div>

        <div className="mt-6">
          <span className="text-[10px] font-semibold tracking-widest text-passport-muted uppercase">
            Passaporte
          </span>
          <p className="text-xl leading-tight font-extrabold text-white">
            Achados na Rota
          </p>
          <p className="mt-0.5 text-xs font-medium text-accent-on-dark">
            Benefícios exclusivos para quem está na rota
          </p>
        </div>

        <dl className="mt-6 flex items-center justify-between border-t border-passport-border pt-3 text-[10px]">
          <div>
            <dt className="text-[9px] text-passport-muted uppercase">
              Titular
            </dt>
            <dd className="font-bold text-white">
              {titular ?? "Seu nome aqui"}
            </dd>
          </div>
          {ativo ? (
            <>
              <div className="text-center">
                <dt className="text-[9px] text-passport-muted uppercase">
                  Válido até
                </dt>
                <dd className="font-bold text-white">
                  {dataCurta(passaporte.validoAte)}
                </dd>
              </div>
              <div className="text-right">
                <dt className="text-[9px] text-passport-muted uppercase">
                  ID membro
                </dt>
                <dd className="font-mono font-bold text-white">
                  {passaporte.codigoDoMembro}
                </dd>
              </div>
            </>
          ) : (
            <div className="text-right">
              <dt className="text-[9px] text-passport-muted uppercase">
                Situação
              </dt>
              <dd className="font-bold text-white">Sem assinatura</dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}
