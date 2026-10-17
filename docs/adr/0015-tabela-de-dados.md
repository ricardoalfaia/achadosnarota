# ADR-0015 — Tabela de dados própria sobre TanStack Table e Virtual

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípios relacionados:** P01, P02, P04, P07, P11  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; o componente veio da base de origem, onde foi uma prova de conceito.

## Contexto

O Achados na Rota tem listas em quase toda área do menu: documentos, modelos, assinaturas, clientes e equipe ([ADR-0018](0018-casca-do-sistema.md)). Elas precisam de ordenação, filtro, seleção para ações em lote e, em escritórios com histórico longo, de virtualização e carga por páginas.

A base de origem trouxe uma tabela própria, construída para substituir um grid comercial que concentrava transporte, consulta, visões e edição em um único componente. Este ADR registra o desenho da tabela; o volume e os recursos que o Achados na Rota de fato precisa ainda serão levantados com o piloto ([01 — Produto](../produto/01-produto-e-escopo.md), "Premissas a testar").

## Decisão proposta

Construir uma tabela própria, `Tabela`, em `@achados/ui`, e separar o que hoje está junto:

| Parte          | Onde          | Responsabilidade                                                                          |
| -------------- | ------------- | ----------------------------------------------------------------------------------------- |
| `Tabela`       | `packages/ui` | Mostrar colunas e linhas: ordenar, filtrar, reordenar, redimensionar, fixar e virtualizar |
| Fonte de dados | Aplicação     | Definir as colunas da tela e buscar as páginas                                            |
| Visões salvas  | Aplicação     | Gravar e restaurar o estado da tabela                                                     |
| Exportação     | Aplicação     | Gerar o arquivo no servidor, com autorização e auditoria                                  |

A `Tabela` não busca dados nem conhece consultas. Recebe `linhas` e `colunas` no contrato próprio `ColunaDaTabela` (`id`, `titulo`, `valor`, `tipo`, `formatar`, `celula`, `largura`, `fixa`). Os tipos do TanStack não aparecem na API pública, exceto a restrição de que a linha seja um objeto; trocar a biblioteca não muda quem usa a tabela.

### Dependências

- `@tanstack/react-table` 9.2.6 para a lógica: filtro, valores distintos por coluna, ordenação e larguras. Só os recursos usados são registrados, e só `use-dados-da-tabela.ts` o importa.
- `@tanstack/react-virtual` 3.14.13 para desenhar apenas as linhas visíveis, na grade e na lista de valores do filtro.

São bibliotecas de código aberto (MIT), sem custo e sem interface própria: toda a aparência é do design system. Continuam sendo dependências de terceiros.

A regra de lint que proibia `@tanstack/*` em `packages/ui` foi estreitada para `@tanstack/react-query` e `@tanstack/query-*`. A intenção da regra é impedir transporte e cache HTTP na UI genérica, e ela continua valendo.

### Estrutura do componente

`Tabela.tsx` só junta as partes; cada comportamento tem um hook com nome próprio, e nenhum arquivo passa de 330 linhas.

| Arquivo                          | O que revela                                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `hooks/use-dados-da-tabela.ts`   | Filtrar, ordenar, valores distintos e larguras. É o único arquivo que importa o TanStack Table |
| `hooks/use-linhas-visiveis.ts`   | Quais linhas cabem na área de rolagem e quando pedir a próxima página                          |
| `hooks/use-ordem-das-colunas.ts` | A ordem das colunas e o arrastar e soltar dos títulos                                          |
| `hooks/use-selecao-de-linhas.ts` | Linhas marcadas, intervalo com Shift e marcar todas                                            |
| `hooks/use-edicao-de-celula.ts`  | A célula em edição, a conversão do valor e a recusa                                            |
| `hooks/use-funcoes-estaveis.ts`  | Ações com identidade fixa para as linhas com `memo`                                            |
| `valores.ts`                     | Regras puras: texto, chave, comparação, filtro, edição e mover coluna                          |
| `apresentacao.ts`                | Medidas, alinhamento e larguras como variáveis CSS                                             |
| `components/`                    | Cabeçalho, linha, editor de célula, menu de filtro, barras e esqueleto                         |

O hook de dados devolve as linhas separadas de três partes (`ordenacao`, `filtros`, `larguras`), e os componentes recebem só as partes que usam. Nenhum recebe o conjunto de linhas; o motivo está no [ADR-0016](0016-recursos-do-react-19.md).

### Decisões de implementação

- **Regras puras à parte:** `valores.ts` contém texto, chave de filtro, comparação, `passaNoFiltro` e `moverColuna`, sem React nem TanStack, com testes unitários.
- **Filtro por lista de valores:** cada coluna tem uma lista de valores marcados e, opcionalmente, uma condição. A lista mostra os valores distintos considerando os filtros das outras colunas e só é aplicada no OK. A condição vem do submenu "Filtros de texto" ou "Filtros de número" (igual, diferente, começa com, termina com, contém, não contém; maior, maior ou igual, menor, menor ou igual), que abre o diálogo **Filtro customizado** com o operador escolhido: uma cláusula e, opcionalmente, uma segunda unida por E ou OU, mais "diferenciar maiúsculas e minúsculas" em texto. Datas não têm condição. A coluna com filtro em vigor mostra o funil cheio em destaque no cabeçalho.
- **Texto sem acento nem caixa** na ordenação, na busca e nas condições. O texto normalizado fica em cache, porque os valores se repetem muito.
- **Larguras em variáveis CSS** na raiz da grade: redimensionar uma coluna não redesenha as linhas.
- **Ordem e fixação das colunas são estado próprio.** Colunas fixas ficam presas à esquerda e só trocam de lugar entre si.
- **Arrasta-se a coluna pelo título**, com o arrastar e soltar nativo do navegador, sem biblioteca. A borda de redimensionar fica fora da área de arrasto.
- **O menu de filtro usa a Popover API do navegador:** vai para a camada superior e não é cortado pela rolagem da grade, o limite registrado no ADR-0008 para as outras caixas suspensas.
- **Rolagem infinita:** `aoChegarAoFim` é chamado perto do fim da lista. Neste modo, ordenação e filtro valem só sobre as linhas carregadas.

### Seleção e edição

- **Seleção de linhas** (`selecionavel`): uma coluna de marcação presa à esquerda, com Shift e clique para marcar o intervalo e "selecionar todas" sobre as linhas filtradas. A seleção pode ser controlada por quem usa (`selecionadas` e `aoMudarSelecao`), que é quem a limpa depois de excluir.
- **Ações em lote** (`acoesDaSelecao`): quando há linhas marcadas, uma barra mostra a contagem e os botões que a tela fornece, como excluir ou aplicar um valor. A tabela não sabe o que as ações fazem.
- **Edição na célula** (`editavel` na coluna e `aoEditar` na tabela): duplo clique, Enter ou F2 abrem o campo; Enter confirma, Esc desiste e Tab segue para a próxima célula editável da linha. `editavel` aceita uma função, para a regra depender da linha.
- **A tabela não altera os dados.** Ela converte o texto para o tipo da coluna e avisa por `aoEditar`; quem usa atualiza `linhas`. Devolver um texto em `aoEditar` recusa o valor: o motivo aparece no rodapé e a célula continua em edição.
- **Números no formato brasileiro:** `1.234` é mil duzentos e trinta e quatro, e `1.234,56` tem vírgula decimal. `1234.56`, sem agrupamento, também é aceito.
- A marcação e a edição de uma linha não redesenham as outras: as linhas recebem sempre o mesmo objeto de ações.

### Onde o filtro roda

A `Tabela` filtra e ordena no navegador o que recebe. Para listas grandes, a recomendação é a API filtrar, ordenar e paginar, com escopo de tenant em toda consulta ([07 — API](../produto/07-api-eventos-operacoes.md): paginação e limites). Busca de documentos é por metadados; indexar o conteúdo integral só depois de avaliação de risco ([05 — LGPD](../produto/05-lgpd.md)).

Dados de clientes na memória do navegador seguem o [ADR-0006](0006-estado-http-e-cache.md): não vão para armazenamento persistente. Exportar uma lista com dados pessoais é tratamento de dados; quando existir, a exportação é gerada no servidor, autorizada e auditada ([ADR-011 de produto](../produto/adr/ADR-011.md)), não montada no navegador.

## Alternativas consideradas

- **Grid comercial pronto:** entrega mais recursos de imediato, com licença, visual próprio e o risco de concentrar transporte e regras no componente.
- **AG Grid:** a versão gratuita cobre virtualização e filtros simples; agrupamento, filtro por lista de valores, exportação e o modo servidor ficam na versão paga.
- **Tabela sem biblioteca:** elimina dependências, mas reimplementa filtro encadeado, ordenação estável e redimensionamento, que o TanStack Table já resolve e testa.
- **Usar os tipos do TanStack como contrato de coluna:** menos código de adaptação, mas prende todas as telas à API de uma versão. A passagem da versão 8 para a 9 mudou essa API.

## Consequências

A tabela é um componente comum, testável com dados sintéticos, e a definição de colunas de cada tela é dado tipado. O custo é manter o que um grid comercial entregaria pronto.

Ainda não existem, e entram por fases:

1. Condições para datas, seletor de colunas e estado controlado por quem usa (base das visões salvas).
2. Agrupamento por níveis e totais.
3. Exportação.
4. Menu de contexto, e editores próprios por tipo (lista de opções, calendário).

Riscos:

- A combinação de agrupamento, colunas fixas e virtualização é a parte mais difícil e não foi provada.
- Não há navegação por teclado entre células; hoje o teclado alcança os títulos, os filtros, as caixas de marcação e a rolagem. Uma célula editável só entra em edição pelo teclado depois de receber o foco com um clique.
- Cada edição entrega um novo conjunto de linhas, e a tabela refaz filtro e ordenação sobre todas; o custo cresce com o volume carregado.
- Muitas linhas na memória custam memória do navegador. É mais um motivo para filtro e paginação no servidor.
- O arrastar e soltar nativo não funciona em telas de toque.

## Verificação de aderência

Na base de origem houve medições em Chromium com 150 mil linhas geradas; elas não são transferidas como evidência do Achados na Rota. Medir neste repositório quando houver uma tela real.

| Regra                                                      | Evidência                                                             | Estado                         |
| ---------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------ |
| Regras de filtro, ordenação, reordenação e edição corretas | Testes unitários em `valores.test.ts`                                 | Pendente neste repositório     |
| Só as linhas visíveis vão para a tela                      | História de volume: `aria-rowcount` total e poucas linhas no DOM      | Pendente neste repositório     |
| Filtro por lista e ordenação sobre o conjunto inteiro      | A mesma história compara com o cálculo direto sobre os dados          | Pendente neste repositório     |
| Rolagem infinita pede a próxima página                     | História `Rolagem infinita`                                           | Pendente neste repositório     |
| Edição recusa valor inválido e grava o válido              | História `Edição e seleção`                                           | Pendente neste repositório     |
| Seleção por intervalo e ação em lote                       | A mesma história: Shift e clique marcam o intervalo; excluir confirma | Pendente neste repositório     |
| Redimensionar, reordenar e fixar colunas                   | Conferência em Chromium com mouse real                                | Pendente; sem teste permanente |
| Acessibilidade estática                                    | axe nas histórias                                                     | Pendente neste repositório     |
| Desempenho                                                 | Medição neste repositório                                             | Não medido                     |
| Tabela não importa transporte nem consulta                 | Regra de lint de `packages/ui`                                        | Pendente neste repositório     |

## Pendências e exceções

- Levantar com o piloto o volume esperado de documentos e clientes e quais recursos da tabela são de fato usados.
- Definir o contrato de listagem paginada da API e o que ela filtra.
- Escolher a primeira tela do Achados na Rota que usa a tabela (documentos ou clientes).
- Medir desempenho neste repositório e definir limite automático, se necessário.

Nenhuma exceção registrada.

## Referências

- [ADR-0006](0006-estado-http-e-cache.md) — estado HTTP e cache
- [ADR-0008](0008-design-system.md) — design system
- [ADR-0010](0010-governanca.md) — funcionalidade de referência antes de repetir a arquitetura
- [TanStack Table](https://tanstack.com/table/latest) e [TanStack Virtual](https://tanstack.com/virtual/latest)
- [Popover API](https://developer.mozilla.org/docs/Web/API/Popover_API)
