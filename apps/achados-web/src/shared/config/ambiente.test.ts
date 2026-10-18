import { describe, expect, it } from "vitest";

import { lerAmbientePublico, lerAmbienteServidor } from "./ambiente";

describe("lerAmbientePublico", () => {
  it("aceita os três ambientes previstos", () => {
    for (const ambiente of ["local", "homolog", "production"]) {
      expect(lerAmbientePublico({ NEXT_PUBLIC_APP_ENV: ambiente })).toEqual({
        ok: true,
        value: { ambiente },
      });
    }
  });

  it("falha com o nome da variável quando o ambiente é desconhecido ou ausente", () => {
    for (const fonte of [{ NEXT_PUBLIC_APP_ENV: "staging" }, {}]) {
      const lido = lerAmbientePublico(fonte);
      expect(lido.ok).toBe(false);
      if (lido.ok) continue;
      expect(lido.error.code).toBe("AMBIENTE_INVALIDO");
      expect(lido.error.details).toEqual({
        variaveis: ["NEXT_PUBLIC_APP_ENV"],
      });
    }
  });
});

describe("lerAmbienteServidor", () => {
  const SEGREDO = "um-segredo-de-teste-com-mais-de-32-caracteres";
  const BASE = {
    APP_URL: "http://localhost:4500/",
    DATABASE_URL: "postgresql://achados_app:achados_app@127.0.0.1:4550/achados",
    BETTER_AUTH_SECRET: SEGREDO,
  };

  const variaveisInvalidas = (fonte: Record<string, string | undefined>) => {
    const lido = lerAmbienteServidor(fonte);
    expect(lido.ok).toBe(false);
    return lido.ok ? undefined : lido.error.details;
  };

  it("devolve a URL do app sem a barra final, o banco e o segredo; cadastro fechado por padrão", () => {
    expect(lerAmbienteServidor(BASE)).toEqual({
      ok: true,
      value: {
        appUrl: "http://localhost:4500",
        databaseUrl: BASE.DATABASE_URL,
        segredoDoAuth: SEGREDO,
        cadastroAberto: false,
        email: {
          remetente: undefined,
          resendApiKey: undefined,
          caixaDeTeste: undefined,
        },
      },
    });
  });

  it("cadastro só abre com SIGNUP_ENABLED=true; vazio vale como fechado", () => {
    const aberto = lerAmbienteServidor({ ...BASE, SIGNUP_ENABLED: "true" });
    const vazio = lerAmbienteServidor({ ...BASE, SIGNUP_ENABLED: "" });
    expect(aberto.ok && aberto.value.cadastroAberto).toBe(true);
    expect(vazio.ok && vazio.value.cadastroAberto).toBe(false);
    expect(variaveisInvalidas({ ...BASE, SIGNUP_ENABLED: "sim" })).toEqual({
      variaveis: ["SIGNUP_ENABLED"],
    });
  });

  it("lê as variáveis de e-mail e trata vazio como ausente", () => {
    const lido = lerAmbienteServidor({
      ...BASE,
      EMAIL_FROM: "Achados na Rota <nao-responda@achados.com.br>",
      RESEND_API_KEY: "",
      EMAIL_CAIXA_DE_TESTE: "  ",
    });
    expect(lido.ok && lido.value.email).toEqual({
      remetente: "Achados na Rota <nao-responda@achados.com.br>",
      resendApiKey: undefined,
      caixaDeTeste: undefined,
    });
  });

  it("falha quando APP_URL ou DATABASE_URL não têm o formato esperado", () => {
    expect(variaveisInvalidas({ ...BASE, APP_URL: "achados.local" })).toEqual({
      variaveis: ["APP_URL"],
    });
    expect(
      variaveisInvalidas({ ...BASE, DATABASE_URL: "mysql://x@y/z" })
    ).toEqual({ variaveis: ["DATABASE_URL"] });
  });

  it("falha quando o segredo do Better Auth falta ou é curto, sem repeti-lo na mensagem", () => {
    for (const BETTER_AUTH_SECRET of [undefined, "", "curto-demais"]) {
      const lido = lerAmbienteServidor({ ...BASE, BETTER_AUTH_SECRET });
      expect(lido.ok).toBe(false);
      if (lido.ok) continue;
      expect(lido.error.details).toEqual({ variaveis: ["BETTER_AUTH_SECRET"] });
      expect(lido.error.message).not.toContain("curto-demais");
    }
  });

  it("recusa subir com a conexão do dono das tabelas no ambiente do app", () => {
    expect(
      variaveisInvalidas({
        ...BASE,
        DATABASE_URL_ADMIN: "postgresql://achados:achados@127.0.0.1/achados",
      })
    ).toEqual({ variaveis: ["DATABASE_URL_ADMIN"] });
    expect(lerAmbienteServidor({ ...BASE, DATABASE_URL_ADMIN: "" }).ok).toBe(
      true
    );
  });

  describe("pagamentos (Stripe)", () => {
    const STRIPE = {
      STRIPE_SECRET_KEY: "sk_test_abc",
      STRIPE_WEBHOOK_SECRET: "whsec_abc",
      DATABASE_URL_PAGAMENTOS:
        "postgresql://achados_pagamentos:x@127.0.0.1:4550/achados",
    };

    it("sem as variáveis, os pagamentos ficam ausentes e o app sobe", () => {
      const lido = lerAmbienteServidor(BASE);
      expect(lido.ok && lido.value.pagamentos).toBeUndefined();
    });

    it("com todas, devolve a configuração", () => {
      const lido = lerAmbienteServidor({ ...BASE, ...STRIPE });
      expect(lido.ok && lido.value.pagamentos).toEqual({
        chaveSecreta: "sk_test_abc",
        segredoDoWebhook: "whsec_abc",
        databaseUrl: STRIPE.DATABASE_URL_PAGAMENTOS,
      });
    });

    it("com só parte delas, falha nomeando as que faltam", () => {
      expect(
        variaveisInvalidas({ ...BASE, ...STRIPE, STRIPE_WEBHOOK_SECRET: "" })
      ).toEqual({ variaveis: ["STRIPE_WEBHOOK_SECRET"] });
    });

    it("recusa chave que não é da Stripe", () => {
      expect(
        variaveisInvalidas({
          ...BASE,
          ...STRIPE,
          STRIPE_SECRET_KEY: "pk_test_x",
        })
      ).toEqual({ variaveis: ["STRIPE_SECRET_KEY"] });
    });
  });

  describe("R2", () => {
    const R2 = {
      R2_ACCOUNT_ID: "conta",
      R2_API_KEY: "chave-de-acesso",
      R2_SECRET: "segredo",
      R2_BUCKET: "achados-teste",
      R2_PUBLIC_URL: "https://pub-teste.r2.dev/",
    };

    it("sem nenhuma variável, o armazenamento fica ausente e o app sobe", () => {
      const lido = lerAmbienteServidor(BASE);
      expect(lido.ok && lido.value.armazenamento).toBeUndefined();
    });

    it("com todas, devolve o bucket e a URL pública sem a barra final", () => {
      const lido = lerAmbienteServidor({ ...BASE, ...R2 });
      expect(lido.ok && lido.value.armazenamento).toEqual({
        contaId: "conta",
        chaveDeAcesso: "chave-de-acesso",
        segredo: "segredo",
        bucket: "achados-teste",
        urlPublica: "https://pub-teste.r2.dev",
      });
    });

    it("com só parte delas, falha nomeando as que faltam", () => {
      expect(
        variaveisInvalidas({ ...BASE, ...R2, R2_SECRET: "", R2_BUCKET: "" })
      ).toEqual({ variaveis: ["R2_SECRET", "R2_BUCKET"] });
    });

    it("a URL pública precisa ser https", () => {
      expect(
        variaveisInvalidas({
          ...BASE,
          ...R2,
          R2_PUBLIC_URL: "http://pub-teste.r2.dev",
        })
      ).toEqual({ variaveis: ["R2_PUBLIC_URL"] });
    });
  });
});
