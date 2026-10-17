# ADR-0002 — React 19 e Next.js por intenção

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípio:** P03  
**Aceitação:** pendente.

## Contexto

Usar Next.js apenas como um host de componentes cliente mantém boa parte dos padrões e custos de uma SPA. Também não queremos trocar APIs estáveis por novidades sem ganho. O objetivo é usar React 19 para resolver renderização, interação e dados com contratos claros.

## Decisão proposta

Next.js com App Router, React 19 e TypeScript no novo código. Server Components são o padrão; declarar `use client` na menor fronteira útil para eventos, estado interativo, hooks cliente ou APIs do navegador. Um componente cliente ainda pode participar do HTML inicial no servidor; não equivale a código executado exclusivamente no browser.

A entrada de rota pode resolver parâmetros, metadata e composição. Ela chama as capacidades da funcionalidade, sem concentrar suas regras. Não obrigar toda feature a ter shell, content, hook e wrapper vazios, nem tornar o orquestrador cliente por convenção.

Dados necessários à renderização inicial são lidos no servidor quando apropriado. Conteúdo independente fica fora de esperas de dados lentos; regiões assíncronas usam Suspense/DataBoundary. O `await` precisa estar no descendente da fronteira que deve apresentar o fallback. Leituras independentes são iniciadas em paralelo; dependências reais permanecem sequenciais. [Referência: leitura e streaming no Next.js](https://nextjs.org/docs/app/getting-started/fetching-data).

### Recursos e critérios

| Recurso                                   | Aplicação prevista                                                                                                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Suspense                                  | Revelar regiões assíncronas e carregamento de código, com fronteiras significativas.                                                                                 |
| `use`                                     | Consumir recursos suportados, como uma Promise estável fornecida pelo servidor/framework ou contexto.                                                                |
| `useActionState`                          | Resultado e pending de uma Action ligada a uma interação/formulário. Não substituir o cache remoto.                                                                  |
| `useFormStatus`                           | Botão/indicador descendente do formulário que precisa ler o pending daquele formulário.                                                                              |
| `useOptimistic`                           | Projeção temporária de uma operação reversível, com reconciliação após a resposta.                                                                                   |
| `useTransition` / `startTransition`       | Atualizações não urgentes e coordenação de Actions conforme o contrato da API.                                                                                       |
| `useDeferredValue`                        | Adiar uma representação custosa mantendo a entrada responsiva; não substitui debounce HTTP.                                                                          |
| `useSyncExternalStore`                    | Assinar uma fonte realmente externa ao React, com snapshots estáveis.                                                                                                |
| `useEffectEvent`                          | No React 19.2 ou superior compatível, ler props/estado atuais em lógica não reativa chamada por um efeito; não esconder dependências nem substituir handlers comuns. |
| `ref` como prop e `<Context value={...}>` | APIs de novos componentes React 19 compatíveis com seus consumidores.                                                                                                |

As APIs de Actions e formulários pertencem ao ciclo de interação; ler `Err` como um retorno normal permite mostrar erros esperados no formulário. Usar o contrato de chamada correto, incluindo Action/transition quando necessário. [Referências: useActionState](https://react.dev/reference/react/useActionState), [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus) e [recursos do React 19](https://react.dev/blog/2024/12/05/react-19).

Otimismo pertence a um único coordenador por operação: React ou Query. Não manter duas projeções otimistas do mesmo dado. Operações de consequência relevante ou com conflito frequente precisam de confirmação do servidor antes de afirmar sucesso. [Referência: useOptimistic](https://react.dev/reference/react/useOptimistic).

Onde cada recurso já está aplicado no repositório, o que entrou com o React 19.2 (`<Activity>`) e o que foi considerado e não usado estão no [ADR-0016](0016-recursos-do-react-19.md).

### Restrições

- Não criar Promise nova durante render cliente para entregá-la a `use`. Não construir um cache caseiro de promises.
- `use(Context)` e `useContext` são válidos; escolher a API que torna o consumo claro. Não exigir migração mecânica de todos os usos.
- Efeitos sincronizam sistemas externos. Estado derivado é calculado; eventos são tratados no evento. Não usar efeito para copiar dados de Query para outro estado.
- `useMemo` e `useCallback` são ferramentas de identidade/performance, usadas quando necessárias; não obrigatórias em toda transformação ou callback.
- Stores externas precisam de `getSnapshot` estável entre notificações e `getServerSnapshot` coerente com a hidratação. `Date.now()` no snapshot ou valores diferentes no servidor/cliente quebram esse contrato. Um timer local não precisa virar store externa apenas por existir.
- JSX composto no servidor pode entrar por `children` em uma fronteira cliente. Um componente cliente não importa diretamente módulos de implementação server-only.

Esses critérios seguem os contratos de [use](https://react.dev/reference/react/use), [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) e a orientação sobre [efeitos desnecessários](https://react.dev/learn/you-might-not-need-an-effect).

### Referências da base

O [useNow](../../packages/ui/src/hooks/use-now.ts) recebe o instante inicial do servidor. Para um texto temporal já renderizado no servidor, explicita melhor o contrato de hidratação que uma cópia inicializada em zero. Validar seus cenários antes de usá-lo em uma tela do Meuproduto.

Hooks de preferência ligados a um app de origem não fazem parte do material genérico. Providers e preferências específicas ficam com a aplicação responsável ou recebem um contrato explícito quando houver compartilhamento real.

O [useFecharAoSair](../../packages/ui/src/hooks/use-fechar-ao-sair.ts) usa `useEffectEvent`, introduzido no [React 19.2](https://react.dev/blog/2025/10/01/react-19-2). Os pacotes declaram versões mínimas compatíveis de React/react-dom, tipos e lint; não interpretar “React 19” como compatibilidade automática com qualquer release 19.x. A origem desses hooks está em [origem da base](../origem-da-base.md).

## Alternativas consideradas

- Tudo cliente: modelo de SPA, com mais código no navegador; não é o padrão dos módulos do Meuproduto.
- Proibir estado e eventos em componentes: gera hooks artificiais e não garante separação das regras.
- Obrigar todas as APIs novas em toda tela: dificulta manutenção sem benefício comportamental.

## Consequências

Menos código interativo é enviado ao navegador e a arquitetura aproveita streaming. Fronteiras de serialização e hidratação precisam de testes. Pacotes React compartilhados só adotam APIs de React 19 se todos os consumidores declarados forem compatíveis.

## Verificação de aderência

| Regra                                  | Evidência                                    | Estado    |
| -------------------------------------- | -------------------------------------------- | --------- |
| Client por necessidade e sem segredos  | Revisão das fronteiras e build do Next       | Planejado |
| Loading acontece na região correta     | Teste com resposta atrasada e navegador real | Planejado |
| Hidratação e assinaturas consistentes  | Teste de render inicial, navegação e cleanup | Planejado |
| Pending e resultado de Action corretos | Teste da interação, incluindo falha esperada | Planejado |

As versões instaladas estão no lockfile; APIs adicionais de releases 19.x são avaliadas quando houver necessidade. Não assumir que um exemplo de documentação corresponde à versão instalada.
