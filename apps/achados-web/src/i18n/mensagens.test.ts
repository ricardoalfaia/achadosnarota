import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { IDIOMA_PADRAO, IDIOMAS } from "@/shared/preferencias/preferencias";

type Mensagens = { [chave: string]: string | Mensagens };

function ler(idioma: string): Mensagens {
  const arquivo = new URL(`../../messages/${idioma}.json`, import.meta.url);
  return JSON.parse(readFileSync(arquivo, "utf8")) as Mensagens;
}

/** `Inicio.titulo`, `Casca.ambiente`... todas as chaves, em ordem. */
function chaves(mensagens: Mensagens, prefixo = ""): string[] {
  return Object.entries(mensagens)
    .flatMap(([chave, valor]) =>
      typeof valor === "string"
        ? [prefixo + chave]
        : chaves(valor, `${prefixo}${chave}.`)
    )
    .sort();
}

/** `{nome}` e demais variáveis de um texto. */
function variaveis(texto: string): string[] {
  return [...texto.matchAll(/\{(\w+)/g)].map(([, nome]) => nome ?? "").sort();
}

function texto(mensagens: Mensagens, caminho: string): string {
  let atual: string | Mensagens = mensagens;
  for (const parte of caminho.split(".")) {
    atual = typeof atual === "string" ? atual : (atual[parte] ?? "");
  }
  return typeof atual === "string" ? atual : "";
}

describe("arquivos de tradução", () => {
  const padrao = ler(IDIOMA_PADRAO);
  const outros = IDIOMAS.filter((idioma) => idioma !== IDIOMA_PADRAO);

  it.each(outros)("%s tem as mesmas chaves do idioma padrão", (idioma) => {
    expect(chaves(ler(idioma))).toEqual(chaves(padrao));
  });

  it.each(outros)("%s usa as mesmas variáveis em cada texto", (idioma) => {
    const traduzido = ler(idioma);
    for (const chave of chaves(padrao)) {
      expect(variaveis(texto(traduzido, chave)), chave).toEqual(
        variaveis(texto(padrao, chave))
      );
    }
  });

  it("nenhum texto ficou vazio", () => {
    for (const idioma of IDIOMAS) {
      const mensagens = ler(idioma);
      for (const chave of chaves(mensagens)) {
        expect(texto(mensagens, chave).trim(), `${idioma}: ${chave}`).not.toBe(
          ""
        );
      }
    }
  });
});
