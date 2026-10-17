import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const errors = [];
const projects = new Map();

for (const kind of ["apps", "packages"]) {
  for (const entry of await readdir(path.join(root, kind), {
    withFileTypes: true,
  })) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(root, kind, entry.name);
    let manifest;
    try {
      manifest = JSON.parse(
        await readFile(path.join(directory, "package.json"), "utf8")
      );
    } catch (error) {
      if (error.code === "ENOENT" && kind === "apps") continue;
      throw error;
    }
    if (projects.has(manifest.name))
      errors.push(`Nome de pacote duplicado: ${manifest.name}`);
    projects.set(manifest.name, {
      kind,
      directory,
      manifest,
      dependencies: [],
    });
  }
}

for (const [name, project] of projects) {
  const dependencies = {
    ...project.manifest.dependencies,
    ...project.manifest.devDependencies,
    ...project.manifest.peerDependencies,
  };
  for (const [dependency, version] of Object.entries(dependencies)) {
    if (version.startsWith("workspace:") && !projects.has(dependency))
      errors.push(`${name}: workspace ausente ${dependency}`);
    const target = projects.get(dependency);
    if (!target) continue;
    project.dependencies.push(dependency);
    if (target.kind === "apps")
      errors.push(`${name}: aplicação ${dependency} não pode ser dependência`);
  }
}

const visited = new Set();
function visit(name, ancestors = []) {
  if (ancestors.includes(name)) {
    errors.push(`Ciclo: ${[...ancestors, name].join(" -> ")}`);
    return;
  }
  if (visited.has(name)) return;
  for (const dependency of projects.get(name).dependencies)
    visit(dependency, [...ancestors, name]);
  visited.add(name);
}
for (const name of projects.keys()) visit(name);

async function sources(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const files = [];
  for (const entry of entries) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await sources(filename)));
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(filename);
  }
  return files;
}

for (const [name, project] of projects) {
  for (const filename of await sources(path.join(project.directory, "src"))) {
    const text = await readFile(filename, "utf8");
    const imports = text.matchAll(
      /(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g
    );
    for (const [, specifier] of imports) {
      if (specifier.startsWith(".")) {
        const target = path.resolve(path.dirname(filename), specifier);
        const relative = path.relative(project.directory, target);
        if (relative.startsWith("..") || path.isAbsolute(relative))
          errors.push(
            `${name}: import relativo fora do projeto em ${path.relative(root, filename)}`
          );
      }
      if (!specifier.startsWith("@achados/")) continue;
      const parts = specifier.split("/");
      const dependency = parts.slice(0, 2).join("/");
      const target = projects.get(dependency);
      if (!target) {
        errors.push(`${name}: pacote desconhecido ${dependency}`);
        continue;
      }
      const declared = {
        ...project.manifest.dependencies,
        ...project.manifest.devDependencies,
        ...project.manifest.peerDependencies,
      };
      if (dependency !== name && !Object.hasOwn(declared, dependency))
        errors.push(`${name}: dependência não declarada ${dependency}`);
      const subpath =
        parts.length === 2 ? "." : `./${parts.slice(2).join("/")}`;
      if (!Object.hasOwn(target.manifest.exports ?? {}, subpath))
        errors.push(`${name}: export privado/inexistente ${specifier}`);
    }
    if (
      name === "@achados/core" &&
      /\bfrom\s+["'](?:react|react-dom|next|@tanstack\/|@achados\/ui)/.test(
        text
      )
    )
      errors.push(
        `${name}: dependência de framework em ${path.relative(root, filename)}`
      );
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Arquitetura: ${projects.size} projetos com grafo sem ciclos, dependências declaradas e imports públicos válidos.`
  );
