import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

// Renomeia o scaffold para um produto novo (ADR-0023). Lê o nome atual do
// `name` do package.json da raiz (`<nome>-monorepo`) e troca, nos arquivos
// versionados, as três grafias dele: `meuproduto` → escopo, `Meuproduto` →
// nome de exibição e `MEUPRODUTO` → escopo em maiúsculas (variáveis de
// ambiente). Também renomeia pastas e arquivos que levam o nome.
//
//   node scripts/novo-projeto.mjs --escopo acme --nome "Acme"
//   node scripts/novo-projeto.mjs --escopo acme --nome "Acme" --simular
//
// Depois: `pnpm install` (o lockfile é regenerado), `pnpm format` (o nome
// novo muda o tamanho das linhas) e `pnpm check`.

const root = path.resolve(import.meta.dirname, "..");

/** Extensões que não são texto: ficam como estão, só mudam de nome. */
const BINARIOS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".ico",
  ".webp",
  ".avif",
  ".woff",
  ".woff2",
  ".pdf",
]);

function argumentos(lista) {
  const valor = (nome) => {
    const indice = lista.indexOf(`--${nome}`);
    return indice === -1 ? undefined : lista[indice + 1];
  };
  return {
    escopo: valor("escopo"),
    nome: valor("nome"),
    simular: lista.includes("--simular"),
  };
}

function falhar(mensagem) {
  console.error(`novo-projeto: ${mensagem}`);
  process.exit(1);
}

function nomeAtual() {
  const manifesto = JSON.parse(
    readFileSync(path.join(root, "package.json"), "utf8")
  );
  const atual = /^([a-z][a-z0-9-]*)-monorepo$/.exec(manifesto.name ?? "")?.[1];
  if (!atual)
    falhar(`o package.json da raiz deveria se chamar "<nome>-monorepo".`);
  return atual;
}

/** "acme-docs" → "ACME_DOCS", como nas variáveis de ambiente. */
const maiusculas = (escopo) => escopo.toUpperCase().replaceAll("-", "_");

/** "acme" → "Acme": a grafia que aparece no meio de frases. */
const capitalizado = (escopo) =>
  escopo.charAt(0).toUpperCase() + escopo.slice(1);

function versionados() {
  const saida = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { cwd: root }
  );
  return saida.toString("utf8").split("\0").filter(Boolean);
}

/** Troca as grafias de `de` pelas de `para`, da mais específica à mais geral. */
function trocador(de, para) {
  const pares = [
    [maiusculas(de), maiusculas(para.escopo)],
    [capitalizado(de), para.nome],
    [de, para.escopo],
  ];
  return (texto) =>
    pares.reduce(
      (atual, [antes, depois]) => atual.replaceAll(antes, depois),
      texto
    );
}

const { escopo, nome, simular } = argumentos(process.argv.slice(2));
if (!escopo || !/^[a-z][a-z0-9-]*$/.test(escopo))
  falhar('informe --escopo em minúsculas, como "acme" ou "acme-docs".');
if (!nome) falhar('informe --nome, o nome de exibição: --nome "Acme".');

const de = nomeAtual();
if (de === escopo) falhar(`o projeto já se chama "${escopo}".`);
const trocar = trocador(de, { escopo, nome });

const arquivos = versionados().filter(
  (arquivo) => arquivo !== "pnpm-lock.yaml"
);
let alterados = 0;
for (const arquivo of arquivos) {
  if (BINARIOS.has(path.extname(arquivo).toLowerCase())) continue;
  const completo = path.join(root, arquivo);
  if (!existsSync(completo)) continue;
  const antes = readFileSync(completo, "utf8");
  const depois = trocar(antes);
  if (depois === antes) continue;
  alterados++;
  if (!simular) writeFileSync(completo, depois);
}

// Renomeia do caminho mais fundo para o mais raso, para uma pasta renomeada
// não invalidar o caminho dos arquivos que estão dentro dela.
const caminhos = new Set();
for (const arquivo of arquivos) {
  const partes = arquivo.split("/");
  for (let i = 1; i <= partes.length; i++)
    caminhos.add(partes.slice(0, i).join("/"));
}
const renomear = [...caminhos]
  .filter((caminho) => path.basename(caminho).toLowerCase().includes(de))
  .sort((a, b) => b.split("/").length - a.split("/").length);
for (const caminho of renomear) {
  const destino = path.join(
    path.dirname(caminho),
    trocar(path.basename(caminho))
  );
  console.log(`  ${caminho} → ${destino.replaceAll("\\", "/")}`);
  if (!simular) renameSync(path.join(root, caminho), path.join(root, destino));
}

if (!simular && existsSync(path.join(root, "pnpm-lock.yaml"))) {
  // O lockfile cita os nomes antigos; o próximo `pnpm install` o regenera.
  renameSync(
    path.join(root, "pnpm-lock.yaml"),
    path.join(root, "pnpm-lock.yaml.antigo")
  );
}

console.log(
  `${simular ? "[simulação] " : ""}"${de}" → "${escopo}" ("${nome}"): ${alterados} arquivos de texto, ${renomear.length} caminhos renomeados.`
);
if (!simular)
  console.log(
    "Agora: apague pnpm-lock.yaml.antigo e rode `pnpm install`, `pnpm format` (o nome novo muda o tamanho das linhas) e `pnpm check`."
  );
