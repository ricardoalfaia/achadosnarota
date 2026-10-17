// Regras puras do passaporte: situação, código do membro e preço. Testadas
// sem banco.

export type Passaporte =
  | { situacao: "ativo"; validoAte: Date; codigoDoMembro: string }
  | { situacao: "inativo" };

export type Plano = {
  nome: string;
  precoEmCentavos: number;
  moeda: string;
};

export type LinhaDaAssinatura = {
  id: string;
  status: string;
  startsAt: Date | null;
  endsAt: Date | null;
};

/**
 * O passaporte vale se a assinatura está `active` e o período cobre `agora`.
 * Assinatura ativa com período vencido não vale: a reconciliação com o
 * provedor pode atrasar, e o benefício não pode.
 */
export function passaporteDe(
  assinaturas: readonly LinhaDaAssinatura[],
  agora: Date
): Passaporte {
  const vigente = assinaturas
    .filter(
      (a) =>
        a.status === "active" &&
        a.startsAt !== null &&
        a.endsAt !== null &&
        a.startsAt <= agora &&
        a.endsAt > agora
    )
    .sort((a, b) => b.endsAt!.getTime() - a.endsAt!.getTime())[0];
  if (!vigente) return { situacao: "inativo" };
  return {
    situacao: "ativo",
    validoAte: vigente.endsAt!,
    codigoDoMembro: codigoDoMembro(vigente.id),
  };
}

/**
 * O "ID do membro" do cartão: "AR-" e os seis últimos caracteres do id da
 * assinatura (a parte aleatória do ULID). Serve para o atendimento achar a
 * assinatura; não é senha nem código de resgate.
 */
export function codigoDoMembro(idDaAssinatura: string): string {
  return `AR-${idDaAssinatura.slice(-6).toUpperCase()}`;
}

/** 12900 → "R$ 129,00". */
export function formatarPreco(centavos: number, moeda = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda,
  })
    .format(centavos / 100)
    .replace(/ /g, " ");
}

const DATA = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

/** "Válido até 16/10/2027". */
export function dataCurta(data: Date): string {
  return DATA.format(data);
}
