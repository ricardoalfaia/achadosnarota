# ADR-0022 — Identidade visual Meuproduto no design system

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípios relacionados:** P04, P10  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; implementação em andamento em `packages/ui` e `apps/design-system`.

## Contexto

O design system veio da base de origem com tokens semânticos, temas claro e escuro e componentes acessíveis ([ADR-0008](0008-design-system.md)), mas com a paleta e a fonte de outro produto. A identidade do Meuproduto está no [quadro da marca](../produto/marca/quadro-da-marca.png) e no [logotipo](../produto/marca/logo.png), em `docs/produto/marca/`:

- **Lema:** "Seus documentos ganham vida.", com "ganham vida." em degradê.
- **Paleta:** Azul Escuro `#0B2D6B` (confiança), Verde Água `#00C2A8` (inovação), Azul Principal `#3B82F6` (tecnologia), Roxo `#8B5CF6` (criatividade) e Fundo Claro `#F4F7FB` (leveza).
- **Tipografia:** Inter, com Bold para títulos, Semibold para destaques, Medium para navegação e Regular para texto.
- **Mockup do painel:** menu lateral claro, cartões com fundo tingido por cor, botões em degradê verde-água → azul, selos de estado coloridos.

A imagem não define tema escuro, estados de foco, medidas exatas nem contraste.

## Decisão proposta

### Tokens

- **Mesmos nomes, valores novos.** Os tokens semânticos (`background`, `surface`, `foreground`, `primary`, `primary-solid`, `success`, `warning`, `danger`, `info` e os demais) mantêm os nomes da base; só os valores mudam. Nenhum componente muda por causa da troca de paleta.
- **Prefixo `--pl-`** em todos os tokens; o `@theme` do Tailwind os expõe como classes (`bg-surface`, `text-primary`).
- **Paleta fechada**, como no ADR-0008: a paleta da marca entra na camada de paleta; componentes usam só a camada semântica.
- **Papéis sugeridos:** azul-escuro para texto forte, títulos e `primary` no tema claro; fundo claro como `background`; verde-água, azul e roxo para preenchimentos, ícones, indicadores e degradês. [A CONFIRMAR com a implementação em `tokens.css`: o mapeamento definitivo de cada token e os valores do tema escuro]

### Degradê da marca

Três utilitários, definidos uma vez em `tokens.css`:

| Utilitário                 | Uso                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `bg-brand-gradient`        | Fundos de destaque da marca (faixa do `Destaque`, cabeçalho `destaque` do `Dialogo`) |
| `bg-brand-gradient-action` | Preenchimento do `Botao` sólido, a ação principal                                    |
| `text-brand-gradient`      | Texto em degradê, como "ganham vida." do lema                                        |

Texto em degradê é decorativo: precisa de cor de reserva para contraste e não é usado em texto pequeno nem em informação que só a cor transmite.

### Fonte

Inter em versão variável, servida pela própria aplicação a partir de `@meuproduto/ui/styles/fonts.css`, sem CDN, como no ADR-0008. JetBrains Mono continua para `font-mono`.

### Componentes novos

Entram em `@meuproduto/ui`, sem domínio de aplicação, com histórias no Storybook:

| Componente          | Papel                                                                      |
| ------------------- | -------------------------------------------------------------------------- |
| `Avatar`            | Iniciais ou foto de uma pessoa; nome acessível obrigatório                 |
| `CampoDeBusca`      | Campo de busca da faixa do topo e das listagens                            |
| `CartaoDeIndicador` | Número, rótulo, ícone e variação do período, com cor de fundo por intenção |
| `CartaoDeAcao`      | Atalho com ícone, título e descrição (ações rápidas)                       |
| `CartaoDeModelo`    | Modelo com ícone, nome e uso                                               |
| `Destaque`          | Faixa da marca com saudação, título, texto, ações e ilustração             |
| `EstadoVazio`       | Área sem conteúdo ou ainda em construção, com explicação e ação opcional   |
| `ZonaDeArquivo`     | Escolher ou arrastar um arquivo                                            |
| `Etapas`            | Indicador de etapas de um fluxo (por exemplo, gerar → revisar → assinar)   |

**`ZonaDeArquivo` não é barreira de segurança.** Tipo e tamanho checados no navegador são conveniência para quem usa. O servidor revalida o MIME real, o tamanho e faz a varredura do arquivo antes de aceitá-lo ([04 — Segurança](../produto/04-seguranca-confidencialidade.md): "antivírus/varredura de upload, limites de tamanho e tipos permitidos, checagem de MIME real"). O componente também não lê nem exibe o conteúdo do arquivo; o nome do arquivo é dado do usuário e não vai para log ou telemetria.

**Dados nos cartões:** os componentes recebem números e textos prontos. Não buscam dados nem conhecem o domínio ([ADR-0003](0003-componentes-explicitos.md)).

### Decisões que a imagem não resolve

Ficam abertas e são resolvidas com o responsável, registrando aqui:

1. **Tema escuro:** valores da paleta e se o preenchimento de marca é sólido ou translúcido (a regra herdada da base usava translúcido).
2. **Escala tipográfica:** a escala densa da base (corpo em 13px) ou uma escala mais arejada, como sugere o mockup.
3. **Contraste:** verde-água e azul sobre branco não atingem AA para texto pequeno; definir as variantes escuras usadas como texto.
4. **Raios e sombras:** o mockup sugere raios maiores que os da base nos cartões.

## Alternativas consideradas

- **Renomear os tokens para os nomes da marca** (`--pl-verde-agua` como token usado por componentes): deixaria o nome da cor no código das telas e obrigaria a trocar componentes a cada ajuste de paleta.
- **Manter a paleta da base até o fim do MVP:** menos trabalho agora, com um produto que não parece o Meuproduto e retrabalho visual depois.
- **Biblioteca de componentes pronta com tema da marca:** rápida, mas troca os contratos acessíveis já testados por outros e adiciona dependência grande.

## Consequências

A troca de identidade fica concentrada em `tokens.css`, `fonts.css` e nos componentes novos. Os resultados de contraste e de histórias obtidos na base deixam de valer e precisam ser refeitos neste repositório.

## Verificação de aderência

| Regra                                            | Evidência esperada                                                          | Estado    |
| ------------------------------------------------ | --------------------------------------------------------------------------- | --------- |
| Pares de texto e fundo atingem AA nos dois temas | `tokens.test.ts` com a paleta nova                                          | Planejado |
| Componentes novos passam no axe                  | Histórias no Storybook (`pnpm --filter design-system test`)                 | Planejado |
| Componentes novos sem domínio nem transporte     | Lint de fronteiras de `packages/ui`                                         | Planejado |
| `ZonaDeArquivo` não é a única validação          | Revisão do fluxo de upload: validação no servidor existe                    | Planejado |
| Inter carrega sem rede externa                   | Chromium: `.woff2` local servido pela aplicação                             | Planejado |
| Painel parecido com o mockup                     | Capturas comparadas com `quadro-da-marca.png`, conferidas com o responsável | Planejado |

## Pendências e exceções

- As quatro decisões da seção anterior.
- Variantes do logotipo (claro, escuro e ícone) como arquivos otimizados nas aplicações.

Nenhuma exceção registrada.

## Referências

- [ADR-0008](0008-design-system.md) — tokens, tema e componentes
- [ADR-0018](0018-casca-do-sistema.md) — casca e página inicial
- Identidade: [`quadro-da-marca.png`](../produto/marca/quadro-da-marca.png) e [`logo.png`](../produto/marca/logo.png) em `docs/produto/marca/`
- [WCAG 2.2: contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
