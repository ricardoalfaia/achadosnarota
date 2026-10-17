import { describe, expect, it } from "vitest";

import {
  codigoDoMembro,
  dataCurta,
  formatarPreco,
  passaporteDe,
  type LinhaDaAssinatura,
} from "./passaporte";

const agora = new Date("2026-10-17T12:00:00Z");
const dia = 86_400_000;

const assinatura = (
  extra: Partial<LinhaDaAssinatura> = {}
): LinhaDaAssinatura => ({
  id: "01JABCDEFGHJKMNPQRSTVW1234",
  status: "active",
  startsAt: new Date(agora.getTime() - 30 * dia),
  endsAt: new Date(agora.getTime() + 335 * dia),
  ...extra,
});

describe("passaporteDe", () => {
  it("assinatura ativa e vigente dá passaporte ativo", () => {
    const p = passaporteDe([assinatura()], agora);
    expect(p).toEqual({
      situacao: "ativo",
      validoAte: new Date(agora.getTime() + 335 * dia),
      codigoDoMembro: "AR-VW1234",
    });
  });

  it("sem assinatura, inativo", () => {
    expect(passaporteDe([], agora)).toEqual({ situacao: "inativo" });
  });

  it.each(["pending", "past_due", "canceled", "expired", "refunded"])(
    "status %s não vale",
    (status) => {
      expect(passaporteDe([assinatura({ status })], agora).situacao).toBe(
        "inativo"
      );
    }
  );

  it("ativa com período vencido não vale", () => {
    const vencida = assinatura({
      startsAt: new Date(agora.getTime() - 400 * dia),
      endsAt: new Date(agora.getTime() - dia),
    });
    expect(passaporteDe([vencida], agora).situacao).toBe("inativo");
  });

  it("ativa que ainda não começou não vale", () => {
    const futura = assinatura({
      startsAt: new Date(agora.getTime() + dia),
      endsAt: new Date(agora.getTime() + 366 * dia),
    });
    expect(passaporteDe([futura], agora).situacao).toBe("inativo");
  });
});

describe("apresentação", () => {
  it("código do membro com os seis últimos caracteres", () => {
    expect(codigoDoMembro("01JABCDEFGHJKMNPQRSTVWXYZ9")).toBe("AR-VWXYZ9");
  });

  it("preço em reais", () => {
    expect(formatarPreco(12900)).toBe("R$ 129,00");
    expect(formatarPreco(1490)).toBe("R$ 14,90");
  });

  it("data no horário de Brasília", () => {
    expect(dataCurta(new Date("2027-10-17T02:00:00Z"))).toBe("16/10/2027");
  });
});
