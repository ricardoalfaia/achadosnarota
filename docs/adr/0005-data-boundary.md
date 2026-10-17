# ADR-0005 — DataBoundary, Suspense e recuperação por região

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípio:** P06  
**Aceitação:** pendente. A reutilização do DataBoundary existente é uma diretriz do responsável.

## Contexto

O DataBoundary existente está em [packages/data-boundary/src/data-boundary.tsx](../../packages/data-boundary/src/data-boundary.tsx). O [entrypoint público](../../packages/data-boundary/src/index.ts) exporta o componente e seu tipo de props. Os fontes dependem de React e TanStack Query 5. O componente veio da base de origem já com a correção do retry e testes de regressão ([origem da base](../origem-da-base.md)).

Suspense só apresenta loading quando uma fonte compatível suspende. Um fetch iniciado em `useEffect` ou um handler assíncrono comum não aciona Suspense apenas por estar dentro de uma fronteira. [Referência: Suspense](https://react.dev/reference/react/Suspense).

## Decisão proposta

DataBoundary é a fronteira canônica de uma região com leitura suspensiva. Reutilizar o componente existente e completar as lacunas abaixo; não introduzir um substituto por feature.

### API existente confirmada

```ts
interface DataBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  canFetch?: boolean;
  errorFallback?: (error: Error, reset: () => void) => ReactNode;
}
```

`canFetch` tem default `true`; com `false`, o componente retorna `null` e não monta seus filhos. Isso é um controle de montagem, não valida autorização, não apresenta empty state e não habilita/desabilita uma query já montada.

Composição atual: `QueryErrorResetBoundary` → `InnerErrorBoundary` → `Suspense` → children. O erro fica no estado da classe interna; a classe é um mecanismo válido de ErrorBoundary, inclusive com React 19. O componente possui `use client`, mas pode receber conteúdo composto no servidor via children.

Exemplo de uso da API real, com componentes de uma funcionalidade ainda ilustrativos:

```tsx
import { DataBoundary } from "@meuproduto/data-boundary";

<DataBoundary fallback={<CustomerListSkeleton />}>
  <CustomerListRegion />
</DataBoundary>;
```

### Requisitos de comportamento

O contrato deve:

- delimitar a região que pode carregar ou falhar independentemente;
- apresentar fallback de carregamento coerente com a região;
- apresentar erro seguro e recuperação quando suportados pelo runtime da leitura;
- permitir reiniciar a região ao mudar sua identidade, sem preservar erros de outra entidade;
- integrar reset de erro do Query **apenas quando** a região usa Query;
- preservar conteúdo vizinho, acessibilidade e uma interação útil de recuperação.

A fronteira fica no ancestral do componente que lê o recurso. Uma fronteira criada depois de um `await` não mostra o loading dessa espera. A composição organiza fronteiras por regiões percebidas pelo usuário, por exemplo indicadores e listagem; não cria uma por célula, nem exige que a tela inteira espere pela região mais lenta.

### Estados da região

| Estado                            | Apresentação                                                                |
| --------------------------------- | --------------------------------------------------------------------------- |
| Primeira leitura pendente         | Skeleton/fallback na fronteira da região.                                   |
| Consulta bem-sucedida sem itens   | Estado vazio explícito dentro do conteúdo.                                  |
| Dados disponíveis                 | Conteúdo normal.                                                            |
| Atualização com dados existentes  | Preservar dados quando seguro; indicar atualização se útil.                 |
| Falha inicial recuperável         | Erro da região com tentativa de recuperação.                                |
| Falha de atualização              | Manter o último dado seguro, indicar falha/desatualização e oferecer retry. |
| Acesso revogado ou sessão trocada | Retirar o dado protegido; não preservar a visualização antiga.              |
| Mutação recusada / form inválido  | Feedback junto à operação, mantendo formulário e contexto.                  |
| Defeito inesperado                | Mecanismo de erro apropriado e observabilidade.                             |

Suspense cuida da espera inicial compatível. Empty state, pending de mutação e erro de background continuam explícitos; não são proibidos por uma regra de “nunca usar loading”. Transições podem preservar conteúdo durante certas atualizações, conforme a interação. [Referência: Suspense e atualização de conteúdo](https://react.dev/reference/react/Suspense).

### Região com TanStack Query

`useSuspenseQuery` é a recomendação para uma região que não tem conteúdo útil sem sua leitura. O `queryFn` usa o adaptador Result descrito no [ADR-0004](0004-result-error.md). Reset precisa coordenar a ErrorBoundary e `QueryErrorResetBoundary` ou `useQueryErrorResetBoundary`; mudar só o estado visual não garante nova tentativa.

Query suspensivo não encaminha automaticamente toda falha de background para a ErrorBoundary quando já possui dados. Por isso a região deve decidir como indicar falha/desatualização, sem remover dados úteis indiscriminadamente. [Referência: falhas e reset de Suspense no TanStack Query](https://tanstack.com/query/latest/docs/framework/react/guides/suspense?from=reactQueryV3).

`useQuery` permanece adequado para consultas condicionais, autocomplete, conteúdo opcional e interfaces que precisam controlar esses estados sem suspender. Não está proibido. O hook suspensivo possui restrições como ausência de `enabled` e limitações de cancelamento; não forçar sua aplicação a toda interação. [Referência: contrato de useSuspenseQuery](https://tanstack.com/query/latest/docs/framework/react/reference/useSuspenseQuery).

### Região renderizada no servidor

Suspense participa do streaming de Server Components. Isso não torna uma ErrorBoundary cliente uma camada de captura e classificação de qualquer exceção lançada no servidor.

Uma falha operacional retornada como Result pode ser tratada explicitamente pelo componente servidor da região, com apresentação segura. Erros inesperados usam as fronteiras e controles do Next, incluindo `error.tsx` e a fronteira global onde cabível. Erros originados no servidor podem chegar ao cliente com mensagem genérica e digest; não depender de uma instância de erro de domínio preservada através desse transporte. [Referência: fronteiras de erro no Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/error).

Recuperar uma região servidor exige a estratégia da fonte de dados: nova renderização/requisição e eventual invalidação de cache. Um reset local da ErrorBoundary não substitui essa estratégia. A integração será comprovada usando a implementação existente de DataBoundary e a versão escolhida do Next.

### Eventos e observabilidade

ErrorBoundary não substitui o tratamento do resultado de um evento ou de uma Promise solta. Comandos têm um coordenador que aguarda o resultado, trata Err e apresenta o feedback. O adaptador trata rejeições do transporte. Não deixar chamadas assíncronas sem tratamento.

Feedback tem mensagem segura, nome acessível e teclado/foco funcionais; skeleton evita ruído em leitores de tela. Retry não pode gerar loops ou repetir automaticamente um comando. Não registrar a mesma falha repetidamente em transporte, hook e fallback.

## Alternativas consideradas

- Uma única fronteira para toda a tela: simples, mas acopla disponibilidade de regiões independentes.
- Loading e erro escritos em cada componente de dados: aumenta divergência e duplicação.
- Suspense para toda consulta: não respeita consultas condicionais ou estados de background.

## Consequências

A UI assíncrona ganha um padrão único e recuperável. É necessário confirmar suporte a SSR/streaming do componente existente e separar recuperação de leitura da recuperação de comando. Não há promessa de que o DataBoundary atual já cumpre todos esses requisitos.

## Verificação de aderência

| Regra                                     | Evidência                                                                   | Estado                     |
| ----------------------------------------- | --------------------------------------------------------------------------- | -------------------------- |
| Loading e falha isolados                  | Teste com duas regiões: uma lenta/falha, outra disponível                   | Planejado                  |
| Retry realmente lê novamente              | Teste React com Query real: erro inicial, clique, segunda leitura e sucesso | Pendente neste repositório |
| Background mantém dado seguro             | Teste de sucesso seguido de falha de refetch                                | Planejado                  |
| Acesso revogado retira dados              | Teste de mudança de contexto/permissão                                      | Planejado                  |
| Servidor e cliente recuperam corretamente | Playwright contra build real, incluindo streaming                           | Planejado                  |

## Lacunas encontradas na inspeção

1. **Retry corrigido na base de origem.** O reset antigo alterava apenas a flag do Query e dependia de mudança de identidade do callback para limpar a classe. Agora o callback passado ao botão e ao `errorFallback` chama o reset do Query e limpa `state.error` explicitamente. A [suite de regressão](../../packages/data-boundary/src/data-boundary.test.tsx) cobre segunda leitura com sucesso e recuperação pelo fallback personalizado; sua execução neste repositório está pendente.
2. Identidade do recurso continua explícita na composição por `key` React quando mudar; não há API adicional de reset por recurso neste pacote inicial.
3. O fallback agora usa token destructive, role alert e botão com type/foco explícitos. Foco após recuperação e adequação completa à acessibilidade ainda precisam de teste no consumidor real.
4. Query é um peer explícito do pacote, inclusive para uma região sem query cliente. O componente isolado não exige QueryClientProvider; avaliar custo e eventual separação da integração se consumidores reais justificarem.
5. Há três testes React: canFetch, retry com Query e fallback personalizado. Background, streaming, erro servidor e recuperação em build real ainda precisam de comprovação específica.

O problema foi identificado por inspeção e corrigido com testes React antes da cópia da base. Esses testes não substituem a comprovação dos cenários RSC/streaming ou autorização de uma funcionalidade real.
