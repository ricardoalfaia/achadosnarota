#!/usr/bin/env node
// Roda um comando com as variáveis do banco carregadas (ver load-env.mjs).
//
//   node scripts/with-env.mjs [--exigir-banco] -- <comando...>
//
// --exigir-banco liga MEUPRODUTO_EXIGIR_BANCO=1: os testes de integração do
// @meuproduto/db FALHAM (em vez de pular) se o Postgres não responder. É o modo
// do CI (`pnpm --filter @meuproduto/db test:integracao`).
import { spawn } from "node:child_process";

import { carregarEnv } from "./load-env.mjs";

const args = process.argv.slice(2);
if (args[0] === "--exigir-banco") {
  args.shift();
  process.env.MEUPRODUTO_EXIGIR_BANCO = "1";
}
if (args[0] === "--") args.shift();
if (args.length === 0) {
  console.error("Uso: with-env.mjs [--exigir-banco] -- <comando>");
  process.exit(1);
}

carregarEnv();

const citar = (arg) =>
  /^[\w@%+=:,./\-]+$/.test(arg) ? arg : `"${arg.replace(/"/g, '\\"')}"`;
const filho = spawn(args.map(citar).join(" "), {
  stdio: "inherit",
  shell: true,
  env: process.env,
});
filho.on("exit", (codigo, sinal) => {
  if (sinal) process.kill(process.pid, sinal);
  process.exit(codigo ?? 1);
});
