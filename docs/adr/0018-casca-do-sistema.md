# ADR-0018 — Casca do sistema conforme o mockup Achados na Rota

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípios relacionados:** P01, P03, P04, P10  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; implementação em andamento.

## Contexto

A base de origem trouxe uma casca desenhada para outro produto: menu lateral escuro com grupos e submenus, faixa do topo com indicadores do domínio de origem, mega menu de cadastros e um catálogo extraído de um sistema desktop. Nada disso descreve o Achados na Rota.

A referência visual do Achados na Rota é o mockup do painel na imagem de identidade da marca ([`docs/produto/marca/quadro-da-marca.png`](../produto/marca/quadro-da-marca.png)): menu lateral claro com itens planos, faixa do topo com busca, notificações e avatar, e a página inicial com saudação, destaque da marca, indicadores, documentos recentes, ações rápidas e modelos mais usados. A identidade (cores, fonte, degradê) está no [ADR-0022](0022-identidade-visual-achados.md).

O mockup é uma imagem, não um protótipo navegável: não define medidas exatas, estados de hover, tema escuro ou comportamento em telas estreitas. Essas lacunas são resolvidas com os tokens e componentes do design system e conferidas com o responsável.

## Decisão proposta

A casca fica em `apps/achados-web/src/shared/casca`, é da aplicação (conhece navegação e sessão) e é composta com primitivas, tokens e hooks de `@achados/ui`. Cada parte é um componente com responsabilidade própria, ligado pelo `Casca`:

| Parte            | Responsabilidade                                     | Estado                     |
| ---------------- | ---------------------------------------------------- | -------------------------- |
| Menu lateral     | Marca, itens planos de navegação e botão de recolher | Implementação em andamento |
| Faixa do topo    | Busca, notificações e avatar com o menu do usuário   | Implementação em andamento |
| Menu do usuário  | Quem está na sessão, tema, idioma e sair             | Implementação em andamento |
| Área de conteúdo | Página da rota; itens sem tela mostram `EstadoVazio` | Implementação em andamento |

### Casca e capacidades

A casca é composição comum do app ([ADR-0011](0011-estrutura-monorepo.md)). O que é funcionalidade de negócio, mesmo quando aparece dentro da casca, é uma capacidade em `src/features/<capacidade>` com `domain/`, `components/` e o contrato em `index.ts`. A dependência tem um sentido só: a casca e as rotas compõem as capacidades pelo `index.ts`; nenhuma capacidade importa a casca. Onde uma capacidade precisa de algo da casca, a casca passa por prop ou slot. O lint de fronteiras só cobre pacotes; internos de uma capacidade importados por outra dependem de revisão ([ADR-0010](0010-governanca.md)).

### Menu lateral

- **Itens, nesta ordem:** Início, Documentos, Modelos, Assinaturas, Clientes, Equipe, Relatórios, Integrações e Configurações. São itens planos, sem grupos nem submenus.
- **Dados:** `navegacao.ts` descreve os itens como dado, sem texto e sem React; os nomes ficam em `messages`. As regras de rota atual são funções puras, testadas.
- **Rotas e tenant:** [A CONFIRMAR — ADR-0020] com o tenant ativo na URL (`/t/[slug]/...`), os endereços dos itens ficam sob esse prefixo. A casca recebe o slug da rota; não o lê de cookie nem de estado do cliente.
- **Recolher:** o menu recolhe para uma faixa só com ícones. `recolhido` é a preferência `menuRecolhido` (cookie, lido no servidor: a página já chega recolhida, sem saltar; [ADR-0017](0017-idiomas-e-preferencias.md)).
- **Aparência:** fundo claro (`surface`), item ativo com fundo `primary-subtle` e texto `primary`, como no mockup. Tokens próprios do menu, se necessários, ficam no bloco `--ar-sidebar-*` de `tokens.css`, com valor por tema.
- **Itens sem tela:** a rota existe e mostra `EstadoVazio` com o nome da área e a informação de que está em construção. O menu é navegável por inteiro sem fingir que a funcionalidade existe.
- **Autorização:** esconder um item no menu não é segurança. Quando houver papéis, cada rota verifica no servidor; o menu só reflete o que o servidor já decidiu ([ADR-003 de produto](../produto/adr/ADR-003.md)).

### Faixa do topo

- **Busca:** `CampoDeBusca` com o texto do mockup ("Buscar documentos, clientes ou modelos..."). Sem destino até existir a busca por metadados. A busca é por metadados, nunca no conteúdo integral sem avaliação de risco ([05 — LGPD](../produto/05-lgpd.md)); o texto digitado não vai para a URL nem para telemetria (ver a pendência do [ADR-0006](0006-estado-http-e-cache.md)).
- **Notificações:** sino com indicador. Sem fonte de dados ainda; o painel mostra estado vazio.
- **Avatar e menu do usuário:** `Avatar` com as iniciais (ou foto, quando houver) e o menu com nome, e-mail e organização da sessão, `SeletorDeTema`, `SeletorDeIdioma` e sair.

### Página inicial

O painel do mockup: saudação com o nome da sessão, `Destaque` com o lema "Seus documentos ganham vida." e as ações "Gerar documento" e "Enviar para assinatura", quatro `CartaoDeIndicador` (Documentos, Assinaturas, Clientes, Pendentes), documentos recentes em tabela, ações rápidas (`CartaoDeAcao`) e modelos mais usados (`CartaoDeModelo`).

- **Dados provisórios:** os números, documentos e modelos são sintéticos, atrás de uma função que retorna `Result` do core ([ADR-0004](0004-result-error.md)), para a troca pela consulta real não mudar os componentes. São marcados como provisórios no código e não usam nome, CPF ou documento real.
- **Ações:** "Gerar documento" e "Enviar para assinatura" não têm destino até os fluxos do M3/M4 ([08 — Plano de entrega](../produto/08-milestones-e-aceite.md)). Assinatura eletrônica é opcional no produto ([README de produto](../produto/README.md), princípio 6); a página não promete integração com provedor.

### O que saiu da base

Mega menu e catálogo de cadastros, menu secundário de um módulo do produto de origem, seletor de filial, data de pregão, notas de versão com conteúdo do produto de origem e os ícones exclusivos daquele protótipo. O registro está em [origem da base](../origem-da-base.md).

## Alternativas consideradas

- **Manter a casca da base e só trocar as cores:** menos trabalho, mas a estrutura (grupos, mega menu, indicadores do domínio de origem) não corresponde ao produto.
- **Casca em `@achados/ui`:** daria reuso ao template do [ADR-0023](0023-scaffold-como-template.md), mas a casca conhece navegação e sessão do Achados na Rota; o que é genérico (tokens, hooks, componentes de cartão e estado vazio) fica no pacote.
- **Guardar o menu recolhido em `localStorage`:** o servidor não lê, e a primeira pintura viria aberta.
- **Esconder do menu os itens sem tela:** o menu ficaria quase vazio e mudaria a cada entrega; o `EstadoVazio` mostra o caminho do produto sem fingir que existe.

## Consequências

A casca corresponde ao produto e cada estado tem um dono. O mockup não cobre tema escuro nem telas estreitas; o que for decidido nesses casos entra neste ADR com a conferência do responsável.

## Verificação de aderência

| Regra                                                   | Evidência                                                                   | Estado    |
| ------------------------------------------------------- | --------------------------------------------------------------------------- | --------- |
| Itens do menu na ordem do mockup e rota atual destacada | E2E do menu lateral; `navegacao.test.ts`                                    | Planejado |
| Recolhido vem pronto do servidor                        | E2E do menu lateral                                                         | Planejado |
| Itens sem tela mostram `EstadoVazio`                    | E2E percorrendo os itens do menu                                            | Planejado |
| Menu do usuário troca tema e idioma e sai               | E2E do menu do usuário                                                      | Planejado |
| Página inicial lê dados por função que retorna `Result` | Teste unitário da função provisória; revisão                                | Planejado |
| Casca parecida com o mockup nos dois temas              | Capturas comparadas com `quadro-da-marca.png`, conferidas com o responsável | Planejado |
| Textos em paridade nos dois idiomas                     | `mensagens.test.ts`                                                         | Planejado |

## Pendências e exceções

- Tema escuro e telas estreitas, que o mockup não mostra.
- Destino da busca, das notificações e das ações da página inicial.
- Prefixo de tenant nas rotas, com o [ADR-0020](0020-autenticacao-e-sessao.md).
- Troca dos dados provisórios da página inicial pela consulta real.

Nenhuma exceção registrada.

## Referências

- [ADR-0008](0008-design-system.md) — tokens, tema e componentes
- [ADR-0016](0016-recursos-do-react-19.md) — recursos do React usados na casca
- [ADR-0017](0017-idiomas-e-preferencias.md) — preferências
- [ADR-0022](0022-identidade-visual-achados.md) — identidade visual
- Mockup: [`docs/produto/marca/quadro-da-marca.png`](../produto/marca/quadro-da-marca.png)
