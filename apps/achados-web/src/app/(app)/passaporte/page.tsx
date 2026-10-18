import type { Metadata } from "next";
import { unwrapOrThrow } from "@achados/core";
import { Alerta } from "@achados/ui";

import {
  CuponsDoPassaporte,
  estatisticasDoHistorico,
} from "@/features/beneficios";
import {
  historicoDoPassaporte,
  listarBeneficiosDisponiveis,
} from "@/features/beneficios/servidor";
import {
  BotaoDeAssinar,
  CartaoDoPassaporte,
  dataCurta,
  EstatisticasDoPassaporte,
  lerRetorno,
  OfertaDoPassaporte,
  pertoDeVencer,
} from "@/features/passaporte";
import {
  lerPassaporte,
  lerPlanoAtivo,
  situacaoDasCompras,
} from "@/features/passaporte/servidor";
import { BarraDaTela } from "@/shared/casca/barra-da-tela";
import { Inclinavel } from "@/shared/movimento/inclinavel";
import { configuracaoDosPagamentos } from "@/shared/pagamentos/stripe.servidor";
import { sessaoLiberada } from "@/shared/sessao/sessao.servidor";

export const metadata: Metadata = {
  title: "Meu Passaporte",
  description:
    "O passaporte anual do Achados na Rota: benefícios em lugares com curadoria independente.",
};

/**
 * Meu Passaporte (protótipo, tela 3). Com passaporte vigente: o cartão, os
 * números, os cupons e, nos últimos 30 dias, "Renovar". Sem ele (ou sem
 * conta): o cartão apagado, o plano com "Assinar" (Checkout da Stripe, cartão
 * ou Pix) e os benefícios. Na volta do Checkout, o aviso diz se o pagamento
 * já foi confirmado ou se o Pix ainda está compensando: quem ativa é o
 * webhook, nunca a volta do navegador (ADR-006 de produto).
 */
export default async function PaginaDoPassaporte({
  searchParams,
}: PageProps<"/passaporte">) {
  const retorno = lerRetorno((await searchParams).pagamento);
  const usuario = await sessaoLiberada();
  const [passaporte, plano, disponiveis, historico, compras] =
    await Promise.all([
      usuario ? lerPassaporte(usuario.id) : null,
      lerPlanoAtivo(),
      listarBeneficiosDisponiveis(),
      usuario ? historicoDoPassaporte(usuario.id) : [],
      usuario
        ? situacaoDasCompras(usuario.id)
        : { pendente: false, jaTevePassaporte: false },
    ]);
  const meuPassaporte = passaporte
    ? unwrapOrThrow(passaporte)
    : ({ situacao: "inativo" } as const);
  const ativo = meuPassaporte.situacao === "ativo";
  const planoAVenda = unwrapOrThrow(plano);
  const assinaturaDisponivel =
    configuracaoDosPagamentos() !== undefined && planoAVenda !== null;
  const renovar =
    ativo &&
    assinaturaDisponivel &&
    pertoDeVencer(meuPassaporte.validoAte, new Date());

  return (
    <div className="flex flex-col gap-4 p-4 pt-[max(1rem,env(safe-area-inset-top))] lg:mx-auto lg:w-full lg:max-w-2xl lg:py-12">
      <BarraDaTela titulo="Meu Passaporte" />

      {retorno === "retorno" && ativo && (
        <Alerta intencao="sucesso" titulo="Pagamento confirmado">
          Seu passaporte está ativo até {dataCurta(meuPassaporte.validoAte)}.
          Bons achados!
        </Alerta>
      )}
      {!ativo && compras.pendente && (
        <Alerta intencao="info" titulo="Pagamento em análise">
          Assim que o Pix compensar (em geral, alguns minutos), o passaporte
          ativa sozinho. Pode fechar o app.
        </Alerta>
      )}
      {retorno === "retorno" && !ativo && !compras.pendente && (
        <Alerta intencao="info" titulo="Confirmando o pagamento">
          A Stripe ainda está avisando a gente. Atualize a página em instantes.
        </Alerta>
      )}
      {retorno === "cancelado" && !ativo && (
        <Alerta intencao="atencao">
          O pagamento não foi concluído. Nada foi cobrado.
        </Alerta>
      )}

      <Inclinavel>
        <CartaoDoPassaporte
          passaporte={meuPassaporte}
          {...(usuario ? { titular: usuario.nome } : {})}
        />
      </Inclinavel>

      {renovar && (
        <section className="flex flex-col gap-3 rounded-3xl bg-primary-subtle p-4 text-center">
          <p className="text-sm font-bold text-foreground">
            Seu passaporte vence em {dataCurta(meuPassaporte.validoAte)}.
          </p>
          <p className="text-xs text-foreground-muted">
            Renovando agora, o novo ano começa quando o atual terminar: você não
            perde nenhum dia.
          </p>
          <BotaoDeAssinar rotulo="Renovar o passaporte" />
        </section>
      )}

      {ativo ? (
        <EstatisticasDoPassaporte {...estatisticasDoHistorico(historico)} />
      ) : (
        <OfertaDoPassaporte
          plano={planoAVenda}
          logado={usuario !== null}
          assinaturaDisponivel={assinaturaDisponivel}
          jaFoiAssinante={compras.jaTevePassaporte}
        />
      )}

      <section aria-labelledby="titulo-cupons">
        <h2
          id="titulo-cupons"
          className="mb-2 text-xs font-extrabold text-foreground"
        >
          {ativo ? "Meus cupons" : "Benefícios do passaporte"}
        </h2>
        <CuponsDoPassaporte
          disponiveis={unwrapOrThrow(disponiveis)}
          historico={historico}
        />
      </section>
    </div>
  );
}
