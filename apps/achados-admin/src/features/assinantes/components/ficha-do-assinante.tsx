"use client";

import { useState, type ReactNode } from "react";
import { Alerta, Avatar, Botao, Esqueleto, SeloDeStatus } from "@achados/ui";
import { Gift, History, Ticket } from "lucide-react";

import {
  dataCurta,
  impedimentoDaCortesia,
  SITUACAO,
  SITUACAO_DA_ASSINATURA,
  type FichaDoAssinante as Ficha,
} from "../domain/assinantes";
import { useFichaDoAssinante } from "../hooks/use-ficha-do-assinante";

/**
 * A ficha de uma pessoa (dentro da janela): quem é, o passaporte de hoje, a
 * cortesia e o histórico. Só leitura, menos a cortesia: assinatura paga muda
 * só pelo provedor de pagamento (ADR-006 de produto).
 */
export function FichaDoAssinante({ id }: { id: string }) {
  const tela = useFichaDoAssinante(id);

  if (tela.carregando)
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <Esqueleto className="h-16 w-full rounded-card" />
        <Esqueleto className="h-28 w-full rounded-card" />
        <Esqueleto className="h-20 w-full rounded-card" />
      </div>
    );
  if (!tela.ficha)
    return (
      <div className="flex flex-col items-start gap-3">
        <Alerta intencao="erro">
          {tela.erroDaLeitura?.message ?? "Não foi possível abrir a ficha."}
        </Alerta>
        <Botao variante="contorno" tamanho="xs" onClick={tela.tentarDeNovo}>
          Tentar de novo
        </Botao>
      </div>
    );

  const ficha = tela.ficha;
  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <Avatar nome={ficha.nome} tamanho="lg" />
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold text-foreground">
            {ficha.nome}
          </p>
          <p className="truncate text-sm text-foreground-muted">
            {ficha.email}
          </p>
          <p className="text-xs text-foreground-muted">
            Na rota desde {dataCurta(ficha.desde)}
          </p>
        </div>
      </header>

      <Secao titulo="Passaporte hoje" icone={<Ticket />}>
        <div className="flex flex-wrap items-center gap-3">
          <SeloDeStatus intencao={SITUACAO[ficha.situacao].intencao}>
            {SITUACAO[ficha.situacao].rotulo}
          </SeloDeStatus>
          {ficha.validoAte && (
            <span className="text-sm text-foreground">
              até <strong>{dataCurta(ficha.validoAte)}</strong>
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-foreground-muted">
          {ficha.beneficiosUsados === 0
            ? "Ainda não usou nenhum benefício."
            : `${ficha.beneficiosUsados} ${ficha.beneficiosUsados === 1 ? "benefício usado" : "benefícios usados"}${ficha.ultimoUso ? `, o último em ${dataCurta(ficha.ultimoUso)}` : ""}.`}
        </p>
      </Secao>

      <Cortesia
        ficha={ficha}
        liberar={tela.liberar}
        liberando={tela.liberando}
        revogar={tela.revogar}
        revogando={tela.revogando}
        erro={tela.erroDoComando}
      />

      <Secao titulo="Histórico de assinaturas" icone={<History />}>
        {ficha.assinaturas.length === 0 ? (
          <p className="text-sm text-foreground-muted">
            Nenhuma assinatura paga.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {ficha.assinaturas.map((a, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
              >
                <span className="font-semibold text-foreground">{a.plano}</span>
                <span className="text-foreground-muted">
                  {SITUACAO_DA_ASSINATURA[a.situacao] ?? a.situacao}
                  {a.inicio &&
                    a.fim &&
                    ` · ${dataCurta(a.inicio)} a ${dataCurta(a.fim)}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Secao>
    </div>
  );
}

function Secao({
  titulo,
  icone,
  children,
}: {
  titulo: string;
  icone: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card border border-border p-4">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wide text-foreground-muted uppercase [&_svg]:size-4 [&_svg]:text-brand">
        {icone}
        {titulo}
      </h3>
      {children}
    </section>
  );
}

/**
 * A cortesia de 7 dias: liberar (com confirmação), a vigente com quem
 * liberou e o revogar em duas etapas, ou o aviso de que já foi usada.
 */
function Cortesia({
  ficha,
  liberar,
  liberando,
  revogar,
  revogando,
  erro,
}: {
  ficha: Ficha;
  liberar: () => void;
  liberando: boolean;
  revogar: () => void;
  revogando: boolean;
  erro: string | undefined;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const cortesia = ficha.cortesia;
  // A situação vem calculada pelo banco: "cortesia" é a vigente e não revogada.
  const vigente = Boolean(cortesia) && ficha.situacao === "cortesia";
  const impedimento = impedimentoDaCortesia(ficha);

  return (
    <Secao titulo="Cortesia de 7 dias" icone={<Gift />}>
      {cortesia ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-foreground">
            {vigente ? "Vale" : "Valeu"} de{" "}
            <strong>{dataCurta(cortesia.inicio)}</strong> a{" "}
            <strong>{dataCurta(cortesia.fim)}</strong>, liberada por{" "}
            {cortesia.liberadaPor}.
          </p>
          {cortesia.revogadaEm && (
            <p className="text-sm text-foreground-muted">
              Revogada em {dataCurta(cortesia.revogadaEm)}
              {cortesia.revogadaPor && ` por ${cortesia.revogadaPor}`}.
            </p>
          )}
          {vigente &&
            (confirmando ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-foreground">
                  Revogar agora? A pessoa perde o acesso na hora.
                </span>
                <Botao
                  variante="fantasma"
                  tamanho="xs"
                  onClick={() => setConfirmando(false)}
                  desabilitado={revogando}
                >
                  Manter
                </Botao>
                <Botao
                  tamanho="xs"
                  intencao="perigo"
                  carregando={revogando}
                  onClick={revogar}
                >
                  Revogar cortesia
                </Botao>
              </div>
            ) : (
              <Botao
                variante="contorno"
                intencao="perigo"
                tamanho="xs"
                onClick={() => setConfirmando(true)}
                className="self-start"
              >
                Revogar
              </Botao>
            ))}
          {!vigente && (
            <p className="text-xs text-foreground-muted">
              A cortesia é uma por pessoa.
            </p>
          )}
        </div>
      ) : impedimento ? (
        <p className="text-sm text-foreground-muted">{impedimento}</p>
      ) : confirmando ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-foreground">
            Liberar o passaporte para {ficha.nome} por 7 dias, a partir de
            agora, com os benefícios nas casas parceiras? Cada pessoa recebe a
            cortesia uma vez só.
          </p>
          <div className="flex gap-2">
            <Botao
              variante="fantasma"
              tamanho="sm"
              onClick={() => setConfirmando(false)}
              desabilitado={liberando}
            >
              Cancelar
            </Botao>
            <Botao
              tamanho="sm"
              icone={<Gift />}
              carregando={liberando}
              onClick={liberar}
            >
              Liberar 7 dias
            </Botao>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-foreground-muted">
            Para alguém experimentar o passaporte, com os benefícios.
          </p>
          <Botao
            tamanho="sm"
            icone={<Gift />}
            onClick={() => setConfirmando(true)}
          >
            Liberar cortesia
          </Botao>
        </div>
      )}
      {erro && (
        <Alerta intencao="erro" className="mt-3">
          {erro}
        </Alerta>
      )}
    </Secao>
  );
}
