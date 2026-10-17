// Confere os arquivos de ambiente de cada app contra o .env.example:
// mesmas chaves em todos e nenhum valor com cara de segredo em arquivo versionado.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const root = fileURLToPath(new URL("..", import.meta.url));
const VERSIONADOS = [".env.homolog", ".env.production"];
const LOCAIS = [".env.local"];
const SEGREDO = /(SECRET|TOKEN|PASSWORD|SENHA|PRIVATE|CREDENTIAL|API_KEY)/i;
const errors = [];

async function ler(filename) {
  try {
    return parseEnv(await readFile(filename, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return undefined;
    throw error;
  }
}

for (const entry of await readdir(path.join(root, "apps"), {
  withFileTypes: true,
})) {
  if (!entry.isDirectory()) continue;
  const app = path.join(root, "apps", entry.name);
  const exemplo = await ler(path.join(app, ".env.example"));
  if (!exemplo) continue;
  const esperadas = Object.keys(exemplo).sort();

  for (const nome of [...VERSIONADOS, ...LOCAIS]) {
    const rotulo = `apps/${entry.name}/${nome}`;
    const valores = await ler(path.join(app, nome));
    if (!valores) {
      if (VERSIONADOS.includes(nome)) errors.push(`${rotulo}: arquivo ausente`);
      continue;
    }
    const chaves = Object.keys(valores);
    for (const chave of esperadas)
      if (!chaves.includes(chave)) errors.push(`${rotulo}: falta ${chave}`);
    for (const chave of chaves)
      if (!esperadas.includes(chave))
        errors.push(`${rotulo}: ${chave} não está no .env.example`);
  }

  for (const nome of [".env.example", ...VERSIONADOS]) {
    const valores = (await ler(path.join(app, nome))) ?? {};
    for (const [chave, valor] of Object.entries(valores)) {
      if (SEGREDO.test(chave) && valor !== "")
        errors.push(
          `apps/${entry.name}/${nome}: ${chave} parece segredo e não pode ter valor em arquivo versionado`
        );
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Arquivos de ambiente coerentes com .env.example.");
