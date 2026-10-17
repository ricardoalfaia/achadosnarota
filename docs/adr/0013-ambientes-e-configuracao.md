# ADR-0013 — Ambientes, variáveis, configuração do app e infraestrutura local

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípios relacionados:** P01, P05, P07, P12  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; a estrutura de ambientes veio da base de origem; a infraestrutura local foi criada para o Achados na Rota.

## Contexto

O `achados-web` precisa rodar em três ambientes: máquina local, homologação e produção. Ambientes e chaves separados são controle obrigatório do produto ([02 — Arquitetura](../produto/02-arquitetura.md), "Decisões de infraestrutura"; [04 — Segurança](../produto/04-seguranca-confidencialidade.md)).

A base de origem já trazia os arquivos `.env.production`, `.env.homolog`, `.env.local` e `.env.example`, uma configuração do app escolhida pelo ambiente e um provider para entregá-la aos componentes. O backend do Achados na Rota ainda não existe; o desenvolvimento do M1 ([08 — Plano de entrega](../produto/08-milestones-e-aceite.md)) vai precisar de banco e armazenamento de objetos locais.

Restrições:

- O Next carrega sozinho apenas `.env`, `.env.local` e `.env.<NODE_ENV>`, e `NODE_ENV` só assume `development`, `production` ou `test`. `.env.homolog` não é carregado.
- Em build de produção o Next sempre lê `.env.production`; uma chave ausente no arquivo de homologação herdaria o valor de produção.
- `.env.local` tem prioridade sobre `.env.production`, inclusive em `next build`.
- Variáveis `NEXT_PUBLIC_*` são embutidas no bundle no build e só quando lidas pelo nome literal.
- Pelo [ADR-0006](0006-estado-http-e-cache.md), o navegador fala com o BFF; endereços internos e segredos são dados do servidor.

## Decisão proposta

Separar três coisas com donos diferentes: **variáveis de ambiente**, **configuração do app** e **entrega aos componentes**. Tudo pertence ao app, em `apps/<app>/`; a raiz não tem `.env`.

### Arquivos de ambiente

| Arquivo           | No git | Uso                                                          |
| ----------------- | ------ | ------------------------------------------------------------ |
| `.env.example`    | Sim    | Modelo e lista oficial das chaves                            |
| `.env.homolog`    | Sim    | Homologação; carregado por `build:homolog` e `start:homolog` |
| `.env.production` | Sim    | Produção; carregado pelo Next em `build` e `start`           |
| `.env.local`      | Não    | Máquina do desenvolvedor; pode conter segredos               |

Arquivo versionado não contém segredo. Segredos ficam em `.env.local` ou nos segredos do ambiente de execução (GitHub Actions, hospedagem), que prevalecem sobre qualquer arquivo. Em produção, o destino é um gerenciador de segredos, conforme o documento de produto 02.

O ambiente lógico é `NEXT_PUBLIC_APP_ENV` (`local`, `homolog` ou `production`), independente de `NODE_ENV`. Homologação é um build de produção do Next com `.env.homolog` carregado antes por [scripts/next-com-ambiente.mjs](../../scripts/next-com-ambiente.mjs).

Variáveis do `achados-web` com o Better Auth ([ADR-0020](0020-autenticacao-e-sessao.md)), validadas em [ambiente.ts](../../apps/achados-web/src/shared/config/ambiente.ts):

| Variável               | Onde é lida | Observação                                                                                                                                                     |
| ---------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_ENV`  | Navegador   | Ambiente lógico; entra no bundle.                                                                                                                              |
| `APP_URL`              | Servidor    | URL pública do app (`http://localhost:4500` no local). Base do Better Auth, única origem confiável e base dos links de e-mail. `https` liga os cookies Secure. |
| `DATABASE_URL`         | Servidor    | Conexão como `achados_app`, papel que não é dono das tabelas e por isso fica sujeito ao RLS. Vazia nos arquivos versionados de homologação e produção.         |
| `BETTER_AUTH_SECRET`   | Servidor    | Segredo do Better Auth, mínimo de 32 caracteres; vazio nos arquivos versionados.                                                                               |
| `SIGNUP_ENABLED`       | Servidor    | `true` abre o cadastro público; vazio ou `false` (padrão) mantém fechado.                                                                                      |
| `EMAIL_FROM`           | Servidor    | Remetente dos e-mails transacionais.                                                                                                                           |
| `RESEND_API_KEY`       | Servidor    | Chave do Resend; vazia nos versionados. Sem ela, o e-mail sai no console só no ambiente local; fora dele, o envio falha com erro claro.                        |
| `EMAIL_CAIXA_DE_TESTE` | Servidor    | Só E2E: arquivo onde os e-mails são gravados. Ignorada se `APP_URL` não for um endereço local.                                                                 |

`DATABASE_URL_ADMIN` (dono das tabelas) é das ferramentas: migrações, seed e bootstrap, carregada por [scripts/load-env.mjs](../../scripts/load-env.mjs). O app recusa subir se a receber com valor. `SESSION_SECRET` (cookie JWE próprio da base) e `ACHADOS_API_URL` (API de identidade externa) saíram. SMTP ficou como pendência, sem variável.

As variáveis do servidor são lidas na primeira chamada de `ambienteServidor()`, e `src/instrumentation.ts` a faz na subida. Não são lidas no import: o `next build` importa os módulos das rotas, e o build da CI não tem segredos.

Uma variável nova entra no `.env.example`, nos dois arquivos de ambiente e no schema, no mesmo trabalho.

### Leitura validada

[ambiente.ts](../../apps/achados-web/src/shared/config/ambiente.ts) valida com Zod e devolve `Result` do core, com `AppError` de validação que nomeia as variáveis inválidas. São funções puras, testadas sem `process.env`.

Dois adaptadores convertem o `Result` em exceção com `unwrapOrThrow`, porque configuração inválida deve interromper build e boot e não tem recuperação para o usuário ([ADR-0004](0004-result-error.md)):

- `ambiente.publico.ts`: variáveis `NEXT_PUBLIC_*`, lidas pelo nome literal.
- `ambiente.servidor.ts`: marcado com `server-only`; `ambienteServidor()` valida na primeira leitura, feita na subida por `src/instrumentation.ts`.

Nenhum outro módulo lê `process.env` diretamente. A mensagem de erro nomeia a variável, nunca o valor.

### Configuração do app por ambiente

[app.config.ts](../../apps/achados-web/src/shared/config/app.config.ts) define o tipo `ConfiguracaoDoApp`, os valores comuns e a função `configuracaoPara(ambiente)`. Cada ambiente tem um arquivo em `shared/config/ambientes/` (`local.ts`, `homolog.ts`, `production.ts`).

Regra de divisão: valor que muda por implantação ou é segredo vai em variável de ambiente; valor estruturado, público e conhecido no código (rótulos, limites, recursos ligados por ambiente) vai em `app.config`. `app.config` não contém segredo nem endereço interno, porque chega ao navegador.

### Entrega aos componentes

- Server Components importam `configuracaoDoApp` de `configuracao.ts`.
- Componentes cliente usam `useConfiguracao()`. O layout raiz, no servidor, entrega o valor ao `ConfiguracaoProvider`.

O provider carrega configuração estática do app. Preferências de um usuário vindas da API são estado HTTP e seguem o [ADR-0006](0006-estado-http-e-cache.md); não entram neste contexto.

### Infraestrutura local de desenvolvimento

[docker-compose.yml](../../docker-compose.yml), na raiz, sobe os serviços que o backend vai usar. O padrão foi reaproveitado do projeto scribevox do responsável.

| Serviço            | Imagem / papel                                  | Porta no host | Acesso de desenvolvimento                             |
| ------------------ | ----------------------------------------------- | ------------- | ----------------------------------------------------- |
| `achados-postgres` | `postgres:18-alpine`                            | 4550          | `postgresql://achados:achados@127.0.0.1:4550/achados` |
| `achados-storage`  | `chrislusf/seaweedfs:4.48`, S3 compatível       | 4551 (API S3) | chave `achados`, segredo `achados-dev`                |
| `storage-bucket`   | Container de inicialização: cria o bucket e sai | —             | bucket privado `achados-documentos`                   |

- **Comandos:** `pnpm infra:up` sobe, `pnpm infra:down` para (os volumes continuam) e `pnpm infra:reset` apaga os volumes e recria do zero.
- **Isolamento:** containers e volumes (`achados-pgdata`, `achados-storage`) são exclusivos do Achados na Rota. Nenhum banco é compartilhado com outros projetos da máquina ([04 — Segurança](../produto/04-seguranca-confidencialidade.md): segregação e mínimo privilégio).
- **Bucket privado:** o storage só tem a identidade `achados` (`docker/seaweedfs/s3.json`), sem identidade anônima; nada é servido sem URL assinada, como pede o [ADR-005 de produto](../produto/adr/ADR-005.md). Verificado em 17/10/2026: acesso anônimo recebe 403 ao listar e ao gravar; o autenticado lista com 200.
- **Banco próprio do E2E:** o Playwright cria e usa `achados_e2e` no mesmo Postgres (`apps/achados-web/e2e/apoio/banco.ts`); o banco `achados` de desenvolvimento nunca é tocado pelo E2E. Antes, a rodada deixava o owner do seed com uma chave de autenticador que só o teste conhecia. Verificado em 17/10/2026: depois de 39 E2E, o admin do banco de dev seguiu sem 2FA e o do `achados_e2e` ficou com o do teste.
- **Portas só em 127.0.0.1:** Postgres e storage não ficam expostos na rede local.
- **Por que SeaweedFS e não MinIO:** as imagens públicas do MinIO deixaram de ser publicadas em 2025 (`minio/minio` e `quay.io/minio/minio` não baixam mais); um emulador que só existe no cache de uma máquina quebraria o `infra:up` em qualquer outra e no template.
- **Só para desenvolvimento:** o Postgres sobe com `fsync`, `synchronous_commit` e `full_page_writes` desligados, para ser rápido. Credenciais fixas valem só aqui e não são segredo de nenhum outro ambiente.
- **Dados:** somente fixtures sintéticas. Documento ou dado pessoal real nunca entra neste ambiente ([09 — Prompt](../produto/09-prompt-claude.md), item 6).
- **Papéis do banco:** o app conecta como `achados_app`, que não é dono das tabelas; migrações e seed rodam como dono (`DATABASE_URL_ADMIN`). Isso faz o RLS valer para o app ([ADR-0020](0020-autenticacao-e-sessao.md)). O papel é criado por `docker/postgres/init/01-app-role.sql` na primeira subida do volume e, onde o init não roda (volume existente, CI), por `pnpm --filter @achados/db db:setup-app-role`.
- **Esquema e dados:** o pacote `@achados/db` (Drizzle ORM e drizzle-kit) guarda o schema, as migrações SQL versionadas e um seed idempotente com dois tenants sintéticos, para testar isolamento. O bootstrap de produção é separado do seed. Comandos na raiz: `pnpm db:migrate`, `pnpm db:seed`, `pnpm db:generate` e `pnpm db:studio`.
- **Estado honesto:** o storage ainda não é usado pelo frontend. O app já usa o Postgres para identidade, sessão, vínculos e o total de clientes do painel (ADR-0020). O storage prepara o fluxo documental do M3.

## Alternativas consideradas

- **`app.config.json` por ambiente:** simples de editar, mas sem tipos nem verificação em tempo de compilação; uma chave faltando só aparece em runtime. Arquivos TypeScript com tipo comum dão o mesmo formato com verificação.
- **Só variáveis de ambiente:** um mecanismo a menos, mas tudo vira texto, valores estruturados se espalham em dezenas de chaves e cada uma exige alteração em três arquivos.
- **Ler `NEXT_PUBLIC_*` direto no cliente, sem provider:** funciona porque o valor é embutido, mas espalha leituras de `process.env` e dificulta testar componentes com outra configuração.
- **`NODE_ENV=homolog`:** o Next não aceita valores fora de `development`, `production` e `test`.
- **`dotenv-cli` para carregar `.env.homolog`:** equivalente ao script próprio, com uma dependência a mais. `node --env-file` falha na base de origem porque os workers do build do Next rejeitam a opção; não foi retestado aqui.
- **Um único build com configuração em runtime:** permite promover o mesmo artefato entre ambientes, mas exige tirar `NEXT_PUBLIC_*` do bundle. Fica como evolução se a promoção de artefato virar requisito.
- **Banco de desenvolvimento compartilhado com outros projetos da máquina:** economiza memória, mas mistura dados e credenciais de produtos diferentes. Rejeitado pelo isolamento.
- **Serviços gerenciados na nuvem para desenvolvimento:** mais próximo de produção, com custo, credencial remota e risco de dado real em ambiente de teste.

## Consequências

Os três ambientes têm o mesmo conjunto de chaves, verificado por script. Configuração inválida falha no build ou na subida, com o nome da variável. Componentes não dependem de `process.env`. Quem desenvolve sobe banco e storage com um comando, sem instalar nada além do Docker.

Custos e limites:

- Cada ambiente exige um build próprio, porque `NEXT_PUBLIC_APP_ENV` entra no bundle.
- Um `pnpm build` em máquina com `.env.local` gera build do ambiente `local`. Na CI não existe `.env.local`, e o build é de produção.
- `.env.homolog` e `.env.production` ficam no histórico do git; um segredo colocado ali por engano exige rotação. O script barra apenas nomes de chave suspeitos.
- Homologação e produção ainda não têm banco nem endereço definidos.
- O Postgres local pode não ter a mesma versão nem a mesma configuração do de produção, que ainda não foi escolhido.
- O SeaweedFS só emula o S3: o provedor de produção, a criptografia e o ciclo de vida dos objetos ainda não foram escolhidos.

## Verificação de aderência

| Regra                                            | Evidência esperada                                                           | Estado                                                                             |
| ------------------------------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Mesmas chaves em todos os arquivos de ambiente   | `pnpm check:env`, parte de `pnpm check`                                      | Executado em 17/10/2026: passou                                                    |
| Arquivo versionado sem chave com nome de segredo | `pnpm check:env`                                                             | Executado em 17/10/2026: passou                                                    |
| Leitura e seleção por ambiente corretas          | Testes em `shared/config`                                                    | Executado em 17/10/2026: passou (Vitest)                                           |
| Variável inválida interrompe o build             | `next build` com `NEXT_PUBLIC_APP_ENV=staging` falha com `AMBIENTE_INVALIDO` | Pendente neste repositório                                                         |
| Homologação usa `.env.homolog`                   | `pnpm build:homolog` gera `data-ambiente="homolog"`                          | Pendente neste repositório                                                         |
| Só os adaptadores leem `process.env`             | Regra de lint restringindo `process.env` fora de `shared/config`             | Planejado                                                                          |
| Infraestrutura local sobe e o bucket é privado   | `pnpm infra:up`; leitura anônima do bucket recusada                          | Testado pelo responsável ao criar o arquivo; sem registro de saída neste documento |
| CI executa as verificações                       | Execução real do workflow do GitHub Actions                                  | Escrito; nunca executado                                                           |

## Pendências e exceções

- Definir onde cada ambiente é publicado e o Postgres gerenciado de homologação e produção.
- Transporte SMTP para o e-mail (hoje: Resend, console no local, caixa no E2E).
- Aceitar ou não o Drizzle como ORM e migrações (era hipótese de [02 — Arquitetura](../produto/02-arquitetura.md); o ADR-0020 o adota em `@achados/db`) e decidir se o Postgres 18 de desenvolvimento acompanha a versão de produção.
- `start:homolog` não foi exercitado; `rotuloDoAmbiente` e `useConfiguracao` ainda não têm consumidor na interface.
- Regra de lint para `process.env`.

Nenhuma exceção registrada.

## Referências

- [ADR-0004](0004-result-error.md) — Result/Error e adaptadores
- [ADR-0006](0006-estado-http-e-cache.md) — estado HTTP e BFF
- [ADR-0010](0010-governanca.md) — barreiras verificáveis
- [ADR-0012](0012-formatacao-e-hooks.md) — formatação e hooks
- [ADR-005 de produto](../produto/adr/ADR-005.md) — armazenamento privado
- [Next.js: variáveis de ambiente](https://nextjs.org/docs/app/guides/environment-variables)
- [Next.js: instrumentation](https://nextjs.org/docs/app/guides/instrumentation)

## Registro de aplicação — 2026-10-17

- Faixa de portas do Achados na Rota: 4500–4599 (o Papelivo ocupa 4450/4451 na mesma máquina). Postgres local em 4550, storage em 4551, app em 4500, E2E em 4501, docs em 4530, Storybook em 4560.
- **Banco de produção: Neon** (decisão do responsável). Desenvolvimento segue no Postgres 18 do Docker. Antes do primeiro deploy: criar o projeto no Neon com Postgres 18, rodar `db:setup-app-role` e `db:migrate` com a URL direta do dono, e configurar `DATABASE_URL` do app com o pooler e o papel `achados_app`. O cliente já usa `prepare: false`, compatível com o pooler em modo transação.
