# ADR-0012 — Formatação, hooks de commit e padrões de editor na raiz

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípios relacionados:** P12  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; a configuração veio da base de origem e foi mantida por decisão do responsável.

## Contexto

A fundação do [ADR-0011](0011-estrutura-monorepo.md) coordena lint, tipos, testes e build, mas não define estilo de código. Sem formatador, cada editor e cada agente produz quebras de linha, ordem de imports e ordem de classes Tailwind diferentes, e os diffs passam a misturar mudança de comportamento com ruído de estilo.

A base de origem já trazia `.prettierrc.json`, `.prettierignore`, lint-staged, Husky e commitlint na raiz. O responsável pediu mantê-los no Achados na Rota. A dúvida registrada é onde instalar: na raiz do monorepo ou em cada projeto.

Fatos que restringem a escolha:

- Hooks do git pertencem ao repositório, não a um pacote do workspace.
- O Prettier resolve plugins a partir da pasta do arquivo de configuração.
- O `@achados/eslint-config` atual (`js.configs.recommended`, `typescript-eslint` recomendado e fronteiras) não contém regras de estilo.
- O Tailwind v4 não tem `tailwind.config.js`; o plugin de classes precisa do caminho do CSS de entrada.

## Decisão proposta

Formatação é uma preocupação do repositório inteiro, instalada e configurada **uma única vez na raiz**.

| Ferramenta                            | Versão | Papel                                                      |
| ------------------------------------- | ------ | ---------------------------------------------------------- |
| `prettier`                            | 3.9.9  | Formatador único de TS/TSX, JS, JSON, Markdown, CSS e YAML |
| `@ianvs/prettier-plugin-sort-imports` | 4.7.1  | Ordem dos imports definida em `importOrder`                |
| `prettier-plugin-tailwindcss`         | 0.8.1  | Ordem das classes Tailwind                                 |
| `lint-staged`                         | 17.6.0 | Roda o ESLint e o Prettier somente nos arquivos em stage   |
| `husky`                               | 9.1.7  | Instala os hooks `pre-commit`, `commit-msg` e `pre-push`   |
| `@commitlint/cli`                     | 21.2.3 | Valida a mensagem de commit                                |
| `@commitlint/config-conventional`     | 21.2.3 | Regras do padrão Conventional Commits                      |

As versões são exatas em `devDependencies` da raiz, como o `turbo`. Apps e pacotes não declaram Prettier, plugins, lint-staged, Husky ou commitlint, e não criam `.prettierrc` próprio.

### Contratos

- **Configuração:** [.prettierrc.json](../../.prettierrc.json) é a única fonte de estilo. `tailwindStylesheet` aponta para `apps/achados-web/src/app/globals.css`; `tailwindFunctions` cobre `clsx`, `twMerge` e `cn`.
- **Exclusões:** [.prettierignore](../../.prettierignore) e o `.gitignore`, que o Prettier 3 respeita por padrão.
- **Scripts da raiz:** `pnpm format` grava; `pnpm format:check` apenas verifica. Ambos usam `--cache` do Prettier.
- **Hook:** `prepare: husky` ativa os hooks em cada `pnpm install`; [.husky/pre-commit](../../.husky/pre-commit) executa `pnpm exec lint-staged` com [lint-staged.config.mjs](../../lint-staged.config.mjs). Nos arquivos de código em stage roda o ESLint e, depois, o Prettier; nos demais, só o Prettier. O ESLint é instalado em cada app e pacote, não na raiz: a configuração agrupa os arquivos pelo projeto (a pasta mais próxima com `eslint.config.mjs`) e roda o ESLint de dentro de cada um, com `--max-warnings 0` e sem `--fix`. Arquivo fora de projeto, como os scripts da raiz, fica só com o Prettier.
- **Mensagem de commit:** [.husky/commit-msg](../../.husky/commit-msg) executa o commitlint com [commitlint.config.mjs](../../commitlint.config.mjs). A mensagem segue Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:` e demais tipos do padrão).
- **Antes do push:** [.husky/pre-push](../../.husky/pre-push) executa `turbo run lint typecheck test --affected` contra `origin/main`, verificando só os projetos alterados e seus dependentes. Sem `origin/main`, verifica todos. Build e E2E ficam fora do hook.
- **Finais de linha:** [.gitattributes](../../.gitattributes) define `* text=auto eol=lf`, coerente com `endOfLine: lf` do Prettier, para o Windows não introduzir CRLF.
- **Editor:** [.editorconfig](../../.editorconfig) repete charset, indentação e final de linha para editores sem Prettier. [.vscode/](../../.vscode/settings.json) liga formatar ao salvar e recomenda as extensões; é conveniência, não barreira.

### Limites de responsabilidade

- Prettier decide estilo; ESLint decide correção e fronteiras. Não adicionar regras de estilo ao ESLint nem executar o Prettier como regra de lint.
- Formatação não é task do Turborepo: não depende do grafo de pacotes e o cache do próprio Prettier é suficiente. `turbo.json` não muda.
- O `pre-commit` verifica e formata só os arquivos em stage. O responsável pediu o ESLint também no commit: o erro aparece com o contexto fresco e não vira um commit de correção depois. O ESLint por arquivo custa poucos segundos. Tipos e testes, que precisam do projeto inteiro, seguem no `pre-push` junto com o lint completo; arquitetura, ambiente, build e E2E continuam em `pnpm check` e na CI.
- Os hooks são conveniência local e podem ser ignorados com `--no-verify`. A barreira real é `format:check` na verificação do repositório, conforme o [ADR-0010](0010-governanca.md).

## Alternativas consideradas

- **Prettier por projeto:** permite estilos e versões diferentes por app, mas duplica configuração e plugins, e o hook da raiz precisaria descobrir qual binário usar para cada arquivo. Não há hoje necessidade de estilos distintos.
- **Pacote `@achados/prettier-config`:** útil quando repositórios diferentes compartilham a configuração. Dentro de um único repositório, um arquivo na raiz resolve com menos indireção. Pode ser adotado quando o template do [ADR-0023](0023-scaffold-como-template.md) ou outro repositório precisar da mesma configuração.
- **Task `format` no Turborepo por pacote:** ganharia cache remoto, ao custo de script e dependência em cada pacote e de não cobrir arquivos da raiz (`docs`, `scripts`, configurações).
- **`eslint-plugin-prettier`:** mistura as duas ferramentas, deixa o lint mais lento e reporta estilo como erro de código.
- **Biome:** formatador e linter rápidos em um binário, mas sem equivalente aos dois plugins usados e com substituição do ESLint de fronteiras já configurado.
- **Mensagem de commit livre:** sem custo de adoção, mas o histórico deixa de servir para gerar changelog e filtrar por tipo.
- **Hook com lint e typecheck:** aumenta a proteção local e torna o commit lento; essas verificações já pertencem a `pnpm check`.

## Consequências

Diffs passam a refletir mudança de conteúdo; ordem de imports e de classes deixa de ser discutida em revisão. Todo commit formata os arquivos tocados.

Custos e riscos:

- Uma reformatação ampla (por exemplo, ao mudar a configuração) altera muitos arquivos de uma vez e deve ficar em um commit isolado, sem mudança de comportamento.
- `importOrder` assume aliases `@/` do app Next; pacotes sem esses aliases caem nos grupos de terceiros e relativos.
- `tailwindStylesheet` aponta para um único app. Um segundo app com tema próprio exige `overrides` por caminho.
- O plugin de imports pode reordenar imports com efeito colateral; esses casos precisam de `// prettier-ignore` justificado.

A decisão é reversível: remover os sete pacotes, o script `prepare`, a pasta `.husky` e a configuração do commitlint.

## Verificação de aderência

| Regra                                             | Evidência esperada                                                      | Estado                                                           |
| ------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Ferramentas instaladas somente na raiz            | `devDependencies` da raiz e `pnpm-lock.yaml`                            | Implementado                                                     |
| Prettier carrega a configuração e os dois plugins | `prettier --check` em arquivos de app e pacote, sem erro de plugin      | Pendente neste repositório                                       |
| Hook ativo no repositório                         | `core.hooksPath` = `.husky/_` e `.husky/pre-commit` presente            | `core.hooksPath` conferido em 16/10/2026; ainda não houve commit |
| Repositório inteiro formatado                     | `pnpm format:check` sem diferenças                                      | Pendente neste repositório                                       |
| Mensagem de commit segue o padrão                 | `commitlint` recusa mensagem fora do padrão e aceita `feat: ...`        | Pendente neste repositório                                       |
| Finais de linha em LF                             | `.gitattributes` e `git ls-files --eol` sem `crlf` ou `mixed` no índice | Pendente neste repositório                                       |
| Push verifica os projetos afetados                | `.husky/pre-push` executado com e sem `--affected`                      | Pendente neste repositório                                       |
| Formatação é barreira                             | `format:check` em `pnpm check` e na CI                                  | `pnpm check` inclui `format:check`; CI nunca rodou               |

## Pendências e exceções

- Executar a [CI](../../.github/workflows/ci.yml) pela primeira vez; ela chama `pnpm check`, que inclui `format:check`, mas nunca rodou.
- Rever `importOrder` e `tailwindStylesheet` quando entrar um segundo app com tema próprio ou um backend.

Nenhuma exceção registrada.

## Referências

- [ADR-0010](0010-governanca.md) — barreiras verificáveis
- [ADR-0011](0011-estrutura-monorepo.md) — estrutura do monorepo, pnpm e Turborepo
- [ADR-0008](0008-design-system.md) — Tailwind e tokens
- [Prettier: configuração e plugins](https://prettier.io/docs/configuration)
- [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)
- [@ianvs/prettier-plugin-sort-imports](https://github.com/IanVS/prettier-plugin-sort-imports)
- [lint-staged](https://github.com/lint-staged/lint-staged)
- [Husky](https://typicode.github.io/husky/)
- [commitlint](https://commitlint.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/pt-br/)
