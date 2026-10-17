import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

// O que roda nos arquivos em stage antes de cada commit: o ESLint do projeto
// de cada arquivo e, depois, o Prettier. Ver o ADR-0012.

const RAIZ = import.meta.dirname;
const CONFIG_DO_ESLINT = "eslint.config.mjs";

/**
 * A pasta do projeto que sabe verificar o arquivo: a mais próxima, subindo,
 * que tem configuração do ESLint. O ESLint é instalado em cada app e pacote,
 * não na raiz; um arquivo sem projeto (scripts da raiz) fica só com o Prettier.
 */
function projetoDe(arquivo) {
  // `resolve` deixa o caminho no formato do sistema, como o de RAIZ.
  let pasta = dirname(resolve(arquivo));
  while (pasta.startsWith(RAIZ) && pasta !== RAIZ) {
    if (existsSync(join(pasta, CONFIG_DO_ESLINT))) return pasta;
    pasta = dirname(pasta);
  }
  return null;
}

/** `{ pasta do projeto: [arquivos] }`, só com os arquivos que têm projeto. */
function porProjeto(arquivos) {
  const grupos = new Map();
  for (const arquivo of arquivos) {
    const projeto = projetoDe(arquivo);
    if (!projeto) continue;
    grupos.set(projeto, [...(grupos.get(projeto) ?? []), arquivo]);
  }
  return grupos;
}

/** Barras normais valem no Windows e não precisam de escape no comando. */
const comBarras = (caminho) => caminho.replaceAll("\\", "/");

const entreAspas = (arquivos) =>
  arquivos.map((arquivo) => JSON.stringify(comBarras(arquivo))).join(" ");

/**
 * O Windows recusa linhas de comando acima de ~8 mil caracteres ("Linha de
 * comando muito longa"), e um commit grande, como o primeiro de um projeto
 * novo, passa disso com caminhos absolutos. Os arquivos vão em lotes.
 */
const TAMANHO_DO_LOTE = 40;

function emLotes(arquivos) {
  const lotes = [];
  for (let i = 0; i < arquivos.length; i += TAMANHO_DO_LOTE)
    lotes.push(arquivos.slice(i, i + TAMANHO_DO_LOTE));
  return lotes;
}

/**
 * Um comando do ESLint por projeto, rodado de dentro dele para valer a
 * configuração e as regras de fronteira daquele projeto. Aviso também reprova,
 * como no `pnpm lint`. Não usa `--fix`: o commit não reescreve código.
 */
function eslint(arquivos) {
  return [...porProjeto(arquivos)].flatMap(([projeto, doProjeto]) =>
    emLotes(doProjeto).map(
      (lote) =>
        `pnpm --dir ${JSON.stringify(comBarras(relative(RAIZ, projeto)))} exec eslint --max-warnings 0 --no-warn-ignored ${entreAspas(lote)}`
    )
  );
}

const prettier = (arquivos) =>
  emLotes(arquivos).map((lote) => `prettier --write ${entreAspas(lote)}`);

export default {
  "**/*.{ts,tsx,js,mjs,cjs}": (arquivos) => [
    ...eslint(arquivos),
    ...prettier(arquivos),
  ],
  "**/*.{json,md,mdx,css,html,yml,yaml,scss}": prettier,
};
