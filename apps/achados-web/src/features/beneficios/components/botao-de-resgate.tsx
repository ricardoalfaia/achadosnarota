"use client";

import Link from "next/link";
import { Alerta, Botao, Dialogo } from "@achados/ui";
import { estiloDoBotao } from "@achados/ui/estilos";
import { CalendarCheck, Clock, Crown, QrCode, Ticket } from "lucide-react";

import { codigoEmDuasPartes, relogio } from "../domain/codigo";
import type { SituacaoDoResgate } from "../domain/situacao";
import {
  useCodigoDoBeneficio,
  type EstadoDoCodigo,
} from "../hooks/use-codigo-do-beneficio";
import { useResgate } from "../hooks/use-resgate";

/** O código grande, em duas metades, com o tempo que falta. */
function CodigoNaTela({
  estado,
}: {
  estado: Extract<EstadoDoCodigo, { etapa: "codigo" }>;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-passport px-4 py-6 text-white">
      <p className="text-xs font-bold tracking-[0.16em] text-accent-on-dark uppercase">
        Mostre ao garçom
      </p>
      <p
        aria-label={`Código ${estado.codigo.split("").join(" ")}`}
        className="font-mono text-5xl font-extrabold tracking-[0.18em] tabular-nums"
      >
        {codigoEmDuasPartes(estado.codigo)}
      </p>
      <p
        role="timer"
        aria-live="off"
        className="flex items-center gap-1.5 text-sm text-white/80"
      >
        <Clock aria-hidden="true" className="size-4" />
        Vale por {relogio(estado.segundos)}
      </p>
    </div>
  );
}

/**
 * "Usar" e a janela que se abre. Sem conta: entrar ou criar conta. Sem
 * passaporte: conhecer o passaporte. Com passaporte: as regras, e o código de
 * uso único que o servidor gera (ADR-005 de produto) para o garçom validar no
 * painel do parceiro. O navegador nunca inventa código.
 */
export function BotaoDeResgate({
  beneficioId,
  titulo,
  regras,
  regraDeUso,
  lugar,
  situacao,
}: {
  beneficioId: string;
  titulo: string;
  regras: string;
  /** "1 vez por ano" */
  regraDeUso: string;
  /** "Rancho Português • Pindamonhangaba - SP" */
  lugar: string;
  situacao: SituacaoDoResgate;
}) {
  const { janela, rotas } = useResgate();
  const { estado, gerar, descartar } = useCodigoDoBeneficio(beneficioId);
  const fechar = () => {
    descartar();
    janela.off();
  };

  return (
    <>
      <Botao tamanho="xs" onClick={janela.on} aria-haspopup="dialog">
        {situacao === "usar" ? "Usar" : "Resgatar"}
      </Botao>
      <Dialogo
        aberto={janela.isOpen}
        aoFechar={fechar}
        variante="cartao"
        tamanho="sm"
        icone={situacao === "assinar" ? <Crown /> : <QrCode />}
        titulo={titulo}
        descricao={lugar}
        rodape={
          situacao === "entrar" ? (
            <>
              <Link
                href={rotas.entrar}
                className={estiloDoBotao({ className: "w-full" })}
                data-foco-inicial
              >
                Entrar para usar
              </Link>
              <Link
                href={rotas.criarConta}
                className={estiloDoBotao({ variante: "fantasma" })}
              >
                Criar conta grátis
              </Link>
            </>
          ) : situacao === "assinar" ? (
            <Link
              href={rotas.passaporte}
              className={estiloDoBotao()}
              data-foco-inicial
            >
              Conhecer o Passaporte
            </Link>
          ) : estado.etapa === "pedir" || estado.etapa === "gerando" ? (
            <Botao
              larguraTotal
              onClick={gerar}
              carregando={estado.etapa === "gerando"}
              data-foco-inicial
            >
              Estou na casa: gerar código
            </Botao>
          ) : estado.etapa === "expirou" || estado.etapa === "erro" ? (
            <Botao larguraTotal onClick={gerar}>
              Gerar outro código
            </Botao>
          ) : (
            <Botao variante="contorno" onClick={fechar}>
              Fechar
            </Botao>
          )
        }
      >
        <div className="flex flex-col gap-3 text-left">
          {situacao === "usar" && estado.etapa === "codigo" ? (
            <CodigoNaTela estado={estado} />
          ) : (
            <p className="flex items-start gap-2 rounded-2xl border border-border bg-surface-raised p-3 text-sm leading-relaxed text-foreground">
              <Ticket
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-brand"
              />
              <span>
                <strong className="font-bold">Regras:</strong> {regras}{" "}
                <strong className="font-bold">{regraDeUso}.</strong>
              </span>
            </p>
          )}
          {situacao === "entrar" && (
            <p className="text-center text-sm text-foreground-muted">
              Os benefícios são exclusivos de quem tem o Passaporte Achados na
              Rota. Entre na sua conta para continuar.
            </p>
          )}
          {situacao === "assinar" && (
            <p className="text-center text-sm text-foreground-muted">
              Este benefício é exclusivo do Passaporte. Veja o que ele inclui e
              as condições antes de assinar.
            </p>
          )}
          {situacao === "usar" && estado.etapa === "pedir" && (
            <p className="text-center text-sm text-foreground-muted">
              Gere o código quando estiver na casa. Ele vale por 10 minutos e o
              garçom confirma o uso no painel do parceiro.
            </p>
          )}
          {situacao === "usar" && estado.etapa === "codigo" && (
            <p className="text-center text-sm text-foreground-muted">
              O uso só conta quando o garçom confirmar o código.
            </p>
          )}
          {situacao === "usar" && estado.etapa === "expirou" && (
            <Alerta intencao="atencao">
              O código expirou sem ser usado. Gere outro quando for pedir.
            </Alerta>
          )}
          {situacao === "usar" && estado.etapa === "usado" && (
            <Alerta intencao="info">
              <span className="flex items-center gap-1.5 font-bold">
                <CalendarCheck aria-hidden="true" className="size-4" />
                Você já usou este benefício
              </span>
              {estado.renovaEm
                ? `Ele volta a valer em ${estado.renovaEm}.`
                : "Ele volta a valer no próximo período."}
            </Alerta>
          )}
          {situacao === "usar" && estado.etapa === "erro" && (
            <Alerta intencao="erro">{estado.mensagem}</Alerta>
          )}
        </div>
      </Dialogo>
    </>
  );
}
