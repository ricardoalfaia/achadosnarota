# ADR-0026 — App administrativo: casca, telas de cadastro e dados provisórios

**Estado:** Proposto  
**Data:** 2026-10-18  
**Princípios relacionados:** P01, P02, P03, P04, P05, P06, P07, P08, P10  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; fase visual e integração com o banco e o login da equipe implementadas em `apps/achados-admin`.

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

### Login da equipe e papéis (18/10/2026)

- **Better Auth no painel** sobre as mesmas tabelas de conta do app do assinante, com cookies próprios (`achados-admin`), sem cadastro (as contas da equipe são criadas fora do app), sessão de 12 horas e limites de tentativa. A tela `/entrar` decide o passo no servidor: e-mail e senha; com o 2FA ligado, o código do autenticador ou um de recuperação; sem 2FA, a configuração **obrigatória** do autenticador (QR gerado no servidor, chave e códigos de recuperação); conta fora da equipe, o aviso e "Sair".
- **Papéis no banco** (`staff_member`: `admin`, `curator`, `commercial`; migração `0004_equipe_e_auditoria`). O layout do painel exige equipe com 2FA e lê o papel sob RLS a cada pedido. As políticas fazem a separação do ADR-004 de produto: a equipe lê tudo (inclusive rascunho); curadoria e administração escrevem casas, fotos e curadoria; comercial e administração escrevem promoções; só a administração vincula operadores do balcão e lê a auditoria. Testes A/B em `packages/db/src/equipe.test.ts`.
- **A tela orienta pelo papel** (`usePodeEscrever`): sem "Nova…" nem "Salvar" onde o papel não escreve. Não é autorização: o banco recusa de qualquer forma.

### Dados do banco (substitui a fonte provisória)

- As leituras e Actions usam `naEquipe` (`shared/db/equipe.servidor.ts`): a pessoa da sessão e `withUser(banco(), pessoa.id, ...)`. As listagens carregam as tabelas do catálogo no formato da antiga fonte (`tabelasDaEquipe`), para as telas não mudarem; com centenas de casas, passam a consultas filtradas e paginadas.
- Um UPDATE barrado pela RLS altera zero linhas sem erro: toda alteração confere o que voltou e responde com a recusa de papel, sem auditar. Inclusão barrada já volta como `USER_SCOPE_VIOLATION`.
- Cada mudança aceita grava `audit_event` na mesma transação, com ação, entidade e situação, sem dado pessoal (nunca e-mail). A auditoria só acrescenta: o app não altera nem apaga.
- Publicar uma curadoria substitui a publicada anterior da casa na mesma transação (índice único do banco).
- **Parceiros**: a página lista os operadores do balcão por casa e vincula pelo e-mail de uma conta existente (só administração).
- **Horário de funcionamento** na casa: aba "Horário" com até dois turnos por dia, cópia de um dia para a semana, turno que passa da meia-noite e observação; a gravação troca os turnos da casa na mesma transação (`features/casas/domain/horario.ts`, testado).
- A fonte em memória (`shared/provisorio`) saiu.

### Foto da equipe e relatório de resgates (18/10/2026)

- **Foto da equipe**: "Pôr/Mudar a minha foto" no menu do usuário, com o mesmo fluxo do app ([ADR-0027](0027-foto-do-perfil-no-r2.md)): ajuste no círculo, regravação no servidor (sharp, sem metadados), envio assinado ao R2 e remoção que apaga o objeto. A sessão da equipe traz a foto da conta.
- **Relatório de resgates** na página Resgates (administração e comercial; a curadoria vê o aviso, e a RLS não lhe entrega resgates): período (7, 30, 90 dias ou ano) e casa na URL; benefícios usados com a comparação ao período anterior (porcentagem só com base de 5 usos ou mais), códigos gerados, taxa de uso, assinantes e casas com uso; usos por dia, mapa de calor dia × hora (Brasília), rankings de casas e benefícios e os últimos usos, sem identificar o assinante. Exportação em CSV (`/api/relatorios/resgates`, separador ";", fórmulas neutralizadas, sem o assinante). Regras em `features/relatorios/domain/relatorio.ts`, testadas; gráficos em SVG, sem biblioteca.
- O seed cria um histórico sintético de 90 dias (viajantes fictícios, respeitando a regra de cada benefício), só no desenvolvimento e na homologação.

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

| Regra                                                         | Evidência                                                              | Estado                         |
| ------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| Regras de cadastro testadas sem a tela                        | `vitest` do `achados-admin` (validação, filtro, pendências, critérios) | Executado                      |
| Dados provisórios recusados fora do desenvolvimento           | `guarda.test.ts`                                                       | Executado                      |
| Navegação cobre as rotas e separa editorial e comercial       | `navegacao.test.ts`                                                    | Executado                      |
| Id desconhecido mostra "não encontrado" sem derrubar a lista  | Captura com `?id=` inexistente (DataBoundary da região)                | Executado (conferência visual) |
| Telas nos dois temas e no celular                             | Capturas 1440×900 e 390×844 conferidas                                 | Executado (conferência visual) |
| Jornadas de cadastro (incluir, editar, descartar, pendências) | E2E com Playwright                                                     | Planejado                      |
| Isolamento por papel (curador × comercial × administração)    | `packages/db/src/equipe.test.ts` (RLS, papel do app)                   | Executado                      |
| Recusa de papel na tela e sem auditoria falsa                 | Conferência manual com as contas do seed (comercial salvando casa)     | Executado (conferência manual) |

## Pendências e exceções

- E2E com Playwright das jornadas do painel (entrar com 2FA, cadastrar, recusa por papel).
- Gestão da equipe na tela (hoje as contas e papéis vêm do seed/script); troca de senha e recuperação da conta da equipe.
- Envio de fotos ao R2, com origem e licença.
- Revisor distinto do autor na publicação editorial (docs/produto/03).
- Levar a regra do selo e dos critérios para um pacote de domínio comum com o app do assinante.
- Avaliar extrair os adaptadores do Query para um pacote, se um terceiro app precisar deles.
- A validação do código no balcão ficou no modo balcão do app do assinante ([ADR-0025](0025-app-pwa-do-assinante.md)); a página Resgates do painel traz o relatório.

Nenhuma exceção registrada.

## Referências

- [ADR-0006](0006-estado-http-e-cache.md), [ADR-0015](0015-tabela-de-dados.md), [ADR-0016](0016-recursos-do-react-19.md), [ADR-0018](0018-casca-do-sistema.md), [ADR-0021](0021-paginas-de-cadastro.md), [ADR-0022](0022-identidade-visual-achados.md)
- ADRs de produto: [ADR-003](../produto/adr/ADR-003.md), [ADR-004](../produto/adr/ADR-004.md), [ADR-005](../produto/adr/ADR-005.md)
