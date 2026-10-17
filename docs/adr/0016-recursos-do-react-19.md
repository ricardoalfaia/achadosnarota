# ADR-0016 — Recursos do React 19.2: quais usar, onde e quando não usar

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípios relacionados:** P03, P06, P07, P11  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; os exemplos vieram com os componentes da base de origem.

## Contexto

O [ADR-0002](0002-react19-e-nextjs.md) lista os recursos do React 19 e os critérios gerais. Faltava dizer, com exemplos do próprio repositório, onde cada um já é usado, o que entrou com a versão 19.2 e, tão importante quanto, onde um recurso foi considerado e não foi usado. Sem esse registro, a tendência é repetir o padrão antigo por hábito (efeito para tudo, `useCallback` em volta de tudo, desmontar o que sai da tela) ou adotar um recurso novo onde ele não ajuda.

O projeto usa React 19.2.8. O design system já tem campos, abas, diálogos e a `Tabela`, que servem de referência.

## Decisão proposta

Usar cada recurso para o problema que ele resolve, com um exemplo de referência no código. Antes de escrever um efeito, um `useCallback` ou um "manter montado" à mão, consultar a tabela abaixo.

### Recursos em uso

| Recurso                            | Problema que resolve                                                                                                                           | Onde está aplicado                                                                                                                                                                                                                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<Activity>` (19.2)                | Esconder uma parte da tela sem perder o estado dela. O que está escondido mantém o estado, para os efeitos e é atualizado com prioridade baixa | `Abas` com `manterEstado`: o painel de uma aba já visitada continua vivo; ao voltar, texto digitado, filtros e seleção estão lá. Na casca da base, o menu lateral escondido voltava com o estado preservado; a casca do Meuproduto ([ADR-0018](0018-casca-do-sistema.md)) reavalia esse uso |
| `useEffectEvent` (19.2)            | Um efeito que precisa da versão mais recente de uma função sem reagir a ela                                                                    | `useLinhasVisiveis`: pedir a próxima página reage à rolagem, e não a quem usa a tabela passar uma função nova a cada desenho. `useFecharAoSair`: os ouvintes de clique e de Esc não são recriados; sai por `@meuproduto/ui/hooks` e fecha menus e painéis suspensos da casca                |
| `<Suspense>` com `use`             | Mostrar um substituto enquanto um dado assíncrono chega, sem estado de "carregando" espalhado                                                  | `Select` com opções em `Promise`; história `Carregando com Suspense` da `Tabela`, com `EsqueletoDeTabela` como substituto                                                                                                                                                                   |
| Esqueletos como substituto         | A tela não pular quando o conteúdo entra                                                                                                       | `CampoSkeleton`, `Esqueleto`, `EsqueletoDeTabela` e as linhas de espera no fim da rolagem infinita                                                                                                                                                                                          |
| `useDeferredValue`                 | Uma lista pesada acompanhar uma entrada sem travar a digitação                                                                                 | Busca na lista de valores do filtro da `Tabela`                                                                                                                                                                                                                                             |
| `use(Context)` e `<Context value>` | Ler e fornecer contexto sem `Provider` e sem `useContext`                                                                                      | `Abas`, `BotaoDeMenu`, `Acordeao`, `PreferenciasProvider`                                                                                                                                                                                                                                   |
| `ref` como prop                    | Receber `ref` sem `forwardRef`                                                                                                                 | `Botao` (o diálogo de exclusão foca o botão Voltar)                                                                                                                                                                                                                                         |
| `useFormStatus`                    | Um campo saber que o formulário dele está sendo enviado                                                                                        | Campos do design system, que se bloqueiam durante o envio                                                                                                                                                                                                                                   |
| `useId`                            | Ligar rótulo, descrição e controle sem ids fixos                                                                                               | Todos os campos, abas e diálogos                                                                                                                                                                                                                                                            |
| Estado ajustado durante o desenho  | Reiniciar estado quando uma prop muda, sem efeito                                                                                              | `DialogoDeExclusao` (recomeça ao reabrir), `usePresenca`, painel de aba visitado                                                                                                                                                                                                            |

### Recursos considerados e não aplicados

| Recurso                                                    | Situação       | Motivo                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useTransition` na troca de idioma                         | Em uso         | `PreferenciasProvider`: a página é pedida de novo ao servidor como transição, e a tela atual continua utilizável até a nova chegar                                                                                                                              |
| `useTransition` em volta de filtro e ordenação da `Tabela` | Não decidido   | O objetivo era o clique responder antes do cálculo. O estado da tabela fica no armazenamento da biblioteca, que o React lê por assinatura externa. A tentativa coincidiu com outro problema de desempenho e não foi medida isoladamente; fica para nova medição |
| `useOptimistic`                                            | Sem uso ainda  | Pertence a quem grava o dado. Na edição de célula, a `Tabela` avisa a tela, e é a tela (ou o Query) que decide mostrar o valor antes da resposta do servidor. Vale o ADR-0002: um único coordenador de otimismo por operação                                    |
| `useActionState` e Actions                                 | Sem uso ainda  | Entram com o primeiro formulário real, conforme o [ADR-0006](0006-estado-http-e-cache.md)                                                                                                                                                                       |
| `useEffectEvent` para as ações das linhas da `Tabela`      | Não se aplica  | Só pode ser chamado dentro de efeitos. Ações passadas a componentes com `memo` e chamadas em cliques usam `useFuncoesEstaveis`                                                                                                                                  |
| `<ViewTransition>`                                         | Não usar       | Ainda não é estável nesta versão. As animações usam CSS e os tokens de movimento                                                                                                                                                                                |
| React Compiler                                             | Não habilitado | A documentação do TanStack Table alerta para leituras do modelo escondidas por memorização automática. Avaliar à parte, com a `Tabela` como caso de teste                                                                                                       |

### Regras que saem desta etapa

- **Efeito só para sincronizar com algo externo** (DOM, temporizador, assinatura). Estado derivado é calculado no desenho; reação a evento fica no manipulador do evento.
- **`useEffectEvent` no lugar de "desligar" dependências.** Não remover dependência de efeito com comentário de lint.
- **`Activity` no lugar de "manter montado com `display: none`"** quando o objetivo é preservar estado. Para conteúdo pesado, só depois da primeira visita, como em `Abas`.
- **Todo substituto de carregamento tem a moldura do conteúdo final**, com a mesma altura.
- **Nenhum componente recebe uma coleção grande como prop.** Na base de origem, a `Tabela` passava o conjunto de linhas ao cabeçalho, e filtro e ordenação ficaram muito mais lentos em modo de desenvolvimento do que na versão compilada; tirar a coleção das props resolveu. A causa provável é a comparação de props que o React 19.2 faz em desenvolvimento para as trilhas de desempenho; isso não foi confirmado no código do React nem medido neste repositório. Quem precisa da coleção é o componente que a percorre; os demais recebem contagens, indicadores e funções.
- **Funções entregues a componentes com `memo`** mantêm a identidade com `useFuncoesEstaveis`, e não com `useCallback` em cadeia.

## Alternativas consideradas

- **Só o ADR-0002, sem este registro:** os critérios gerais existem, mas não dizem onde olhar um exemplo nem o que já foi descartado.
- **Proibir padrões antigos por lint:** útil para `forwardRef` e `useContext`, mas a maior parte destas escolhas depende de julgamento. Fica como apoio futuro, não como substituto.
- **Adotar tudo o que a versão oferece:** `ViewTransition` e o compilador trariam risco sem necessidade comprovada.

## Consequências

Quem escreve um componente tem um exemplo para cada recurso e uma lista do que não usar. O custo é manter esta lista atual a cada versão do React e a cada componente de referência novo.

O problema das coleções grandes em props só apareceu em desenvolvimento, mas é ali que o time trabalha: uma tela lenta para quem desenvolve atrasa todo o resto.

## Verificação de aderência

| Regra                                                         | Evidência                                                                    | Estado                           |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------- |
| `Activity` preserva o estado da aba                           | História `Mantendo o estado` das `Abas`: o texto digitado continua ao voltar | Pendente neste repositório       |
| Rolagem infinita não repete o pedido por causa de função nova | `useLinhasVisiveis` com `useEffectEvent`; história `Rolagem infinita`        | Pendente neste repositório       |
| Substituto com a moldura da tabela                            | História `Carregando com Suspense`: o esqueleto aparece e dá lugar à grade   | Pendente neste repositório       |
| Nenhuma coleção grande em props                               | História de volume da `Tabela`, medida em desenvolvimento                    | Não medido; sem regra automática |
| Efeitos sem dependência desligada                             | `git grep` por `eslint-disable` em `packages/ui/src`: nenhum                 | Pendente neste repositório       |

## Pendências e exceções

- Medir `useTransition` na `Tabela` isoladamente e decidir.
- Avaliar o React Compiler.
- Acrescentar os exemplos de `useActionState` e `useOptimistic` quando o primeiro formulário com gravação existir.

Nenhuma exceção registrada.

## Referências

- [ADR-0002](0002-react19-e-nextjs.md) — critérios gerais de React 19 e Next.js
- [ADR-0008](0008-design-system.md) — componentes citados
- [ADR-0015](0015-tabela-de-dados.md) — a tabela de dados
- [React 19.2](https://react.dev/blog/2025/10/01/react-19-2)
- [`<Activity>`](https://react.dev/reference/react/Activity) e [`useEffectEvent`](https://react.dev/reference/react/useEffectEvent)
