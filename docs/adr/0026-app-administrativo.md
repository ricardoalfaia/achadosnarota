# ADR-0026 — App administrativo: casca, telas de cadastro e dados provisórios

**Estado:** Proposto  
**Data:** 2026-10-18  
**Princípios relacionados:** P01, P02, P03, P04, P05, P06, P07, P08, P10  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; fase visual implementada em `apps/achados-admin`, sem banco e sem login.

## Contexto

A equipe precisa cadastrar casas, registrar a curadoria e cuidar das promoções ([05 — UI](../produto/05-ui-design-system.md), telas 6 a 8). O [ADR-0018](0018-casca-do-sistema.md) descreve a casca de painel da base e o [ADR-0021](0021-paginas-de-cadastro.md) o padrão de tela de cadastro; nenhum dos dois tinha aplicação no Achados na Rota. O trabalho foi paralelizado: esta frente constrói o app administrativo; a do app do assinante cuida do esquema e das funções de domínio em `packages/db`.

A primeira fase pedida pelo responsável é visual: o app novo com as configurações do monorepo, o design system e as telas, sem integrar com o banco.

## Decisão proposta

### Aplicação

- `apps/achados-admin`, Next.js 16 com App Router, React 19.2 e Tailwind 4, porta 4600, dependências por `workspace:*` e catálogo. Não importa o `achados-web` ([ADR-0007](0007-monorepo-e-autonomia.md)).
- Nunca indexado (`robots` e `X-Robots-Tag`). Cookies de preferência próprios (`achados-admin-*`): tema e menu recolhido, lidos no servidor ([ADR-0017](0017-idiomas-e-preferencias.md)).
- Só português, sem `next-intl` por enquanto: os textos ficam nos componentes, como nas telas do app do assinante. O mecanismo entra quando houver um segundo idioma.

### Casca

O [ADR-0018](0018-casca-do-sistema.md) aplicado à área administrativa, em `src/shared/casca`:

- **Menu lateral** com itens agrupados em seções com título (Editorial, Comercial, Gestão), sem submenus. A separação editorial × comercial do [ADR-004 de produto](../produto/adr/ADR-004.md) fica visível na navegação: Casas e Curadoria de um lado; Promoções, Parceiros e Resgates do outro. Os itens são dado (`navegacao.ts`), testados.
- **Recolher** no desktop (Ctrl+B) e **gaveta** no celular. O que vale em cada largura é CSS (`lg:`), para a página chegar do servidor certa, sem medir a tela no navegador.
- **Faixa do topo** com busca (Ctrl+K, sem destino ainda, texto fora da URL), notificações e o menu do usuário com o tema.
- Itens sem tela (Parceiros, Resgates, Assinantes, Configurações) abrem a página "em construção" com o que a área vai fazer.

### Telas de cadastro

O [ADR-0021](0021-paginas-de-cadastro.md) implementado uma vez e usado por casas, curadoria e promoções:

| Parte                     | Onde                                            | Responsabilidade                                                                                       |
| ------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `TelaDeCadastro`          | `shared/cadastro/tela-de-cadastro.tsx`          | Lista e formulário com `Visoes`, um `DataBoundary` por região, esqueletos na moldura                   |
| `useRegistroNaUrl`        | `shared/cadastro/use-registro-na-url.ts`        | `?status=`, `?id=` e `?novo=1` na URL, navegação como transição (`useTransition`)                      |
| `useFormularioDeCadastro` | `shared/cadastro/use-formulario-de-cadastro.ts` | Pendências após a primeira tentativa, contador por seção, salto, Ctrl+S, recusa do servidor nos campos |
| Regras puras              | `shared/cadastro/pendencias.ts`, `filtro.ts`    | Pendências por seção e filtro de situação/busca, testados                                              |
| Feature                   | `features/<area>`                               | `domain/` (tipos, validação, apresentação), `hooks/`, `consultas/`, `components/`, `actions.ts`        |

- **Leitura:** prefetch no Server Component, `HydrationBoundary` e `useSuspenseQuery` no navegador pelo BFF em `/api/...` ([ADR-0006](0006-estado-http-e-cache.md)). Cada recurso declara chave, `staleTime` e quem invalida em `consultas/*.ts`.
- **Gravação:** Server Action que devolve `ActionResult` (`toActionResult`), chamada por `useMutation` (o único coordenador) pelo adaptador `executarAcao`. A validação do formulário é conveniência: a Action valida de novo com as mesmas regras e um esquema zod, e devolve as pendências em `details`, sem ecoar os valores ([ADR-0004](0004-result-error.md)).
- **Busca** em estado local com `useDeferredValue`; **situação** na URL (valor fechado). Nenhum dado pessoal na URL.
- **Recursos do React 19.2** ([ADR-0016](0016-recursos-do-react-19.md)): `Activity` nas abas dos formulários e da fila de trabalho (`manterEstado`); `Suspense` com `DataBoundary`; `useDeferredValue` na busca; `useTransition` na navegação; estado ajustado durante o desenho (gaveta que fecha ao trocar de rota, formulário que recomeça ao abrir outro registro); `useEffectEvent` pelos hooks do design system.
- A **`Tabela`** do design system nas três listagens, com colunas declaradas fora do componente ([ADR-0015](0015-tabela-de-dados.md)).

### Dados provisórios

Até o banco ser ligado, as consultas e Actions leem e gravam uma fonte em memória (`shared/provisorio`) com linhas no formato das tabelas do `@achados/db`, para a troca não mudar hooks nem componentes. Os dados são sintéticos e marcados como provisórios. A guarda (`guarda.ts`) recusa em `homolog` e `production`, e em build de produção sem `APP_ENV`: nada de casa, nota ou promoção fictícia fora do desenvolvimento ([README de produto](../produto/README.md), princípio 6). As regras que o banco já tem (uma avaliação publicada por casa, promoção ativa só em casa publicada, nota calculada no servidor) foram reproduzidas para a tela se comportar como vai se comportar.

### Design system

- Novo `AreaDeTexto` em `@achados/ui` (texto de várias linhas na moldura dos campos, com contador), com história no Storybook.

## Alternativas consideradas

- **Rotas dentro do `achados-web`:** um deploy só, mas mistura o PWA público com a área interna, seus cabeçalhos, cache e superfície de ataque; o [ADR-001 de produto](../produto/adr/ADR-001.md) admite apps separados no monorepo.
- **Restaurar a casca do commit inicial:** foi a referência, mas tinha tenant na URL, mega menu e notificações do produto de origem.
- **Dados fixos nos componentes:** mais rápido, mas a troca pelo banco reescreveria as telas; a fonte atrás de Result mantém os contratos.
- **Formulário em rota própria (`/casas/[id]`):** preferível quando houver muitos registros; a mesma página preserva busca e filtros ([ADR-0021](0021-paginas-de-cadastro.md)).

## Consequências

As três áreas seguem o mesmo padrão e a parte comum mora em `shared/cadastro`. O custo é a duplicação, por enquanto, de adaptadores do Query (`buscar-json`, `acao`, `cliente`) com o app do assinante e da regra do selo da curadoria.

## Verificação de aderência

| Regra                                                         | Evidência                                                              | Estado                          |
| ------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------- |
| Regras de cadastro testadas sem a tela                        | `vitest` do `achados-admin` (validação, filtro, pendências, critérios) | Executado                       |
| Dados provisórios recusados fora do desenvolvimento           | `guarda.test.ts`                                                       | Executado                       |
| Navegação cobre as rotas e separa editorial e comercial       | `navegacao.test.ts`                                                    | Executado                       |
| Id desconhecido mostra "não encontrado" sem derrubar a lista  | Captura com `?id=` inexistente (DataBoundary da região)                | Executado (conferência visual)  |
| Telas nos dois temas e no celular                             | Capturas 1440×900 e 390×844 conferidas                                 | Executado (conferência visual)  |
| Jornadas de cadastro (incluir, editar, descartar, pendências) | E2E com Playwright                                                     | Planejado                       |
| Isolamento por papel e por parceiro                           | Testes A/B com o banco e a sessão da equipe                            | Planejado (sem banco nem login) |

## Pendências e exceções

- Login da equipe com papéis (curador, administrador) e MFA ([ADR-0020](0020-autenticacao-e-sessao.md), [ADR-003 de produto](../produto/adr/ADR-003.md)). **O app não vai para homologação nem produção sem isso.**
- Trocar a fonte provisória pelo `@achados/db`, com escopo de papel, `audit_events` e testes A/B. Combinar com a outra frente antes de mexer em `packages/db`.
- Envio de fotos ao R2, com origem e licença.
- Revisor distinto do autor na publicação editorial (docs/produto/03).
- Levar a regra do selo e dos critérios para um pacote de domínio comum com o app do assinante.
- Avaliar extrair os adaptadores do Query para um pacote, se um terceiro app precisar deles.
- Painel do parceiro (validação do código de resgate no balcão).

Nenhuma exceção registrada.

## Referências

- [ADR-0006](0006-estado-http-e-cache.md), [ADR-0015](0015-tabela-de-dados.md), [ADR-0016](0016-recursos-do-react-19.md), [ADR-0018](0018-casca-do-sistema.md), [ADR-0021](0021-paginas-de-cadastro.md), [ADR-0022](0022-identidade-visual-achados.md)
- ADRs de produto: [ADR-003](../produto/adr/ADR-003.md), [ADR-004](../produto/adr/ADR-004.md), [ADR-005](../produto/adr/ADR-005.md)
