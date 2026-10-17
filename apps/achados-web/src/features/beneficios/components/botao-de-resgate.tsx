"use client";

import Link from "next/link";
import { Alerta, Botao, Dialogo } from "@achados/ui";
import { estiloDoBotao } from "@achados/ui/estilos";
import { Clock, Crown, QrCode, Ticket } from "lucide-react";

import type { SituacaoDoResgate } from "../domain/situacao";
import { useResgate } from "../hooks/use-resgate";

/**
 * "Resgatar" e a janela que se abre. O que a janela mostra depende da
 * situação decidida no servidor: entrar, conhecer o passaporte, ou, com o
 * passaporte vigente, o aviso de que a emissão do código ainda não está no
 * ar. Nenhum código ou QR é gerado no navegador: ele virá do servidor,
 * aleatório e de uso único (ADR-005 de produto).
 */
export function BotaoDeResgate({
  titulo,
  regras,
  lugar,
  situacao,
}: {
  titulo: string;
  regras: string;
  /** "Rancho Português • Pindamonhangaba - SP" */
  lugar: string;
  situacao: SituacaoDoResgate;
}) {
  const { janela, rotas } = useResgate();

  return (
    <>
      <Botao tamanho="xs" onClick={janela.on} aria-haspopup="dialog">
        Resgatar
      </Botao>
      <Dialogo
        aberto={janela.isOpen}
        aoFechar={janela.off}
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
                Entrar para resgatar
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
          ) : (
            <Botao variante="contorno" onClick={janela.off}>
              Entendi
            </Botao>
          )
        }
      >
        <div className="flex flex-col gap-3 text-left">
          <p className="flex items-start gap-2 rounded-2xl border border-border bg-surface-raised p-3 text-xs leading-relaxed text-foreground">
            <Ticket
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-brand"
            />
            <span>
              <strong className="font-bold">Regras:</strong> {regras}
            </span>
          </p>
          {situacao === "entrar" && (
            <p className="text-center text-xs text-foreground-muted">
              Os benefícios são exclusivos de quem tem o Passaporte Achados na
              Rota. Entre na sua conta para continuar.
            </p>
          )}
          {situacao === "assinar" && (
            <p className="text-center text-xs text-foreground-muted">
              Este benefício é exclusivo do Passaporte. Veja o que ele inclui e
              as condições antes de assinar.
            </p>
          )}
          {situacao === "emissaoIndisponivel" && (
            <Alerta intencao="info">
              <span className="flex items-center gap-1.5 font-bold">
                <Clock aria-hidden="true" className="size-3.5" /> Resgate pelo
                app em breve
              </span>
              Seu passaporte está ativo. O código de uso único, validado pelo
              estabelecimento, chega na próxima etapa do app.
            </Alerta>
          )}
        </div>
      </Dialogo>
    </>
  );
}
