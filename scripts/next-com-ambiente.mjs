// Executa o Next do app atual com as variáveis de .env.<ambiente>.
// Uso (dentro do app): node ../../scripts/next-com-ambiente.mjs homolog build
// Variáveis já definidas no processo (pipeline) prevalecem sobre o arquivo.
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const [ambiente, ...args] = process.argv.slice(2);
if (!ambiente || args.length === 0) {
  console.error(
    "Uso: next-com-ambiente.mjs <ambiente> <comando do next> [opções]"
  );
  process.exit(1);
}

const arquivo = path.resolve(`.env.${ambiente}`);
try {
  process.loadEnvFile(arquivo);
} catch {
  console.error(`Arquivo de ambiente não encontrado: ${arquivo}`);
  process.exit(1);
}

const next = createRequire(path.resolve("package.json")).resolve(
  "next/dist/bin/next"
);
const { status } = spawnSync(process.execPath, [next, ...args], {
  stdio: "inherit",
});
process.exit(status ?? 1);
