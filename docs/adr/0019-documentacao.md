# ADR-0019 — Documentação técnica em `docs/` no repositório e documentação de negócio com Fumadocs

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípios relacionados:** P01, P09, P12  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; o app de documentação veio da base de origem e foi adaptado ao Achados na Rota.

## Contexto

O projeto tem dois públicos de documentação, com necessidades diferentes:

- **Quem desenvolve** lê documentos de produto, princípios e ADRs, em Markdown na pasta `docs/`, referenciados por caminho no `AGENTS.md` e entre os próprios ADRs. Os componentes têm documentação no Storybook ([ADR-0008](0008-design-system.md)).
- **Quem usa o sistema** (administradores e operadores dos escritórios, [01 — Produto](../produto/01-produto-e-escopo.md)) precisa de guias, com a identidade visual do Achados na Rota, em português e inglês.

A base de origem publicava a pasta técnica como wiki do Azure DevOps. O Achados na Rota fica no GitHub, que já mostra Markdown e diagramas Mermaid do próprio repositório.

## Decisão proposta

### Documentação técnica

Fica em Markdown na pasta `docs/` da raiz, revisada no mesmo PR do código, e é lida no próprio repositório (editor ou GitHub). Não há publicação separada nem cópia: o repositório é a fonte.

- `docs/produto/`: documentos e ADRs de **produto** (`ADR-001` a `ADR-012`). São a fonte do que o Achados na Rota deve ser.
- `docs/arquitetura.md` e `docs/adr/`: princípios e ADRs de **frontend** (`0001` em diante).
- `docs/origem-da-base.md`: de onde veio a base e o que mudou.

### Documentação de negócio

O app `apps/docs`, com Fumadocs sobre Next.js 16 e Tailwind 4, criado na base a partir do gerador oficial (`create-fumadocs-app`, modelo Next.js com `fumadocs-mdx`) e adaptado às convenções do monorepo:

- **Conteúdo:** arquivos MDX em `apps/docs/content/docs`, versionados no git. Descreve o que existe; uma área ainda em construção aparece assim, sem prometer funcionalidade ([README de produto](../produto/README.md): não declarar o que não existe).
- **Idiomas:** `pt-BR` (padrão) e `en`, os mesmos do sistema ([ADR-0017](0017-idiomas-e-preferencias.md)). `pagina.mdx` é o português e `pagina.en.mdx`, a tradução. Página sem tradução aparece em português no site em inglês, o que permite traduzir aos poucos.
- **Endereços:** o idioma é o começo do endereço, `/pt-BR/docs/...` e `/en/docs/...`. Endereço sem idioma é redirecionado ao idioma do navegador, ou ao português. Diferente do sistema, aqui o idioma faz parte do endereço, porque um link de documentação é compartilhado já no idioma de quem vai ler.
- **Troca de idioma:** recarrega a página. Sem recarregar, o layout raiz é remontado no navegador e o provedor de tema do Fumadocs (`next-themes`) renderiza de novo o seu `<script>`, o que o React acusa como erro.
- **Identidade visual:** as cores do Fumadocs são ligadas aos tokens semânticos de `@achados/ui/styles/tokens.css`, e as fontes vêm de `@achados/ui/styles/fonts.css`. O tema claro ou escuro usa o mesmo atributo `data-theme` do sistema. O logotipo é `public/logo-achados.png`.
- **Escala de texto:** os tokens definem a escala densa das telas do sistema. O app de documentação a redefine para a escala de leitura (16px) em seu `global.css`. É a única divergência dos tokens, restrita a este app.
- **Busca:** índice local do próprio Fumadocs (Orama), servido por `/api/search`, sem serviço externo.
- **Portas:** 4530 para `dev` e `start`, 4531 para o E2E.

O app depende de `@achados/ui` apenas pelos estilos exportados. Não importa código de `apps/achados-web`.

## Alternativas consideradas

- **Docusaurus:** maduro, com versionamento de documentação e idiomas prontos. Tem empacotador e tema próprios, fora de Next e Tailwind; reaproveitar os tokens exigiria um tema à parte.
- **Nextra:** também sobre Next. O Fumadocs foi preferido pela integração direta com Tailwind 4 e pela busca local embutida.
- **Um site único para as duas documentações:** mistura públicos e obrigaria a mover os ADRs, quebrando os links atuais.
- **Wiki do GitHub para a documentação técnica:** fica fora do PR do código e diverge com facilidade.
- **Rotas de documentação dentro de `apps/achados-web`:** acoplaria o deploy da documentação ao do sistema e traria as dependências de MDX para o app principal.

## Consequências

A documentação de negócio é revisada por PR, como o código, e pode ser publicada separadamente do sistema. O custo é que escrever uma página exige git; se outras pessoas passarem a editar diretamente, será preciso um CMS sobre o mesmo conteúdo ou outra ferramenta.

Limites desta versão:

- O conteúdo é inicial: visão do produto, primeiros passos (entrar e preferências) e a lista de áreas do menu, marcadas como em construção.
- Não há autenticação nem hospedagem definidas.
- `fumadocs-core` e `@fumadocs/base-ui` 16.16.2 eram mais novos que a idade mínima de publicação exigida pelo workspace e entraram em `minimumReleaseAgeExclude`.
- O português sem prefixo (`hideLocale` do Fumadocs) foi testado e descartado na base: o endereço é reescrito pelo proxy, o menu calcula o item atual com endereços diferentes no servidor e no navegador, e a página dá erro de hidratação.
- O servidor do E2E sobe sem `--hostname 127.0.0.1`: com ele, o proxy de idiomas redireciona para `localhost`, outra origem para quem abriu `127.0.0.1`.
- O texto de "Entrar" na documentação segue o desenho do [ADR-0020](0020-autenticacao-e-sessao.md) e precisa ser revisto quando a implementação terminar.

## Verificação de aderência

| Regra                                        | Evidência                                      | Estado                                                                                                         |
| -------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| O app respeita o grafo e os imports públicos | `pnpm check:architecture` com o projeto `docs` | Pendente neste repositório                                                                                     |
| Lint, tipos, testes e build do app           | `pnpm --filter docs lint typecheck test build` | Executado em 16/10/2026 neste repositório: lint, typecheck, 5 testes e build passaram                          |
| Endereço no idioma certo e troca de idioma   | `idiomas.test.ts` e E2E `docs.spec.ts`         | Executado em 16/10/2026 neste repositório: 7 testes E2E em Chromium passaram                                   |
| Páginas hidratam sem erro nos dois idiomas   | E2E `docs.spec.ts`                             | Executado em 16/10/2026 neste repositório: 7 testes E2E em Chromium passaram                                   |
| Página sem tradução cai no português         | E2E `docs.spec.ts`                             | Executado em 16/10/2026 neste repositório: 7 testes E2E em Chromium passaram                                   |
| A busca encontra páginas pelo conteúdo       | E2E `docs.spec.ts` contra `/api/search`        | Executado em 16/10/2026 neste repositório: 7 testes E2E em Chromium passaram                                   |
| Cores e fontes vêm dos tokens nos dois temas | Conferência visual das telas em claro e escuro | Página inicial conferida em 16/10/2026 (captura em Chromium, 1280px, claro e escuro); demais páginas pendentes |

As execuções de 16/10/2026 usaram o estado de `packages/ui` daquele momento, que estava sendo alterado em paralelo (ADR-0022); repetir depois que a troca de identidade terminar.

## Pendências e exceções

- Definir hospedagem e controle de acesso do `apps/docs`.
- Escrever os guias de cada área à medida que ela existir, e definir quem os mantém.
- Revisar as traduções com quem conhece os termos em inglês.

Nenhuma exceção registrada.

## Referências

- [ADR-0008](0008-design-system.md) — tokens, tema e Storybook
- [ADR-0011](0011-estrutura-monorepo.md) — estrutura do monorepo
- [ADR-0014](0014-ferramental-do-monorepo.md) — catálogo, testes e portas
- [ADR-0017](0017-idiomas-e-preferencias.md) — idiomas do sistema
- [Fumadocs: internacionalização com Next.js](https://fumadocs.dev/docs/internationalization/next)
