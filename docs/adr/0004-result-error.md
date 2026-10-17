# ADR-0004 — Result/Error canônico e fronteiras de exceção

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípio:** P05  
**Aceitação:** pendente. O uso do core existente é uma diretriz explícita do responsável; as integrações abaixo são propostas.

## Contexto

O core Result/Error criado pelo responsável, inspirado no Rust, está em [packages/core/src/result.ts](../../packages/core/src/result.ts). O [entrypoint público](../../packages/core/src/index.ts) agora expõe somente esse contrato: envelopes de entidade/sessão do outro produto foram retirados. A implementação Result/Error veio da base de origem sem mudança de contrato; o que foi reaproveitado e removido está em [origem da base](../origem-da-base.md).

React, Next.js e TanStack Query também possuem mecanismos próprios de exceção. Precisamos integrá-los sem transformar exceção em uma segunda convenção de negócio nem fazer uma falha parecer sucesso.

## Decisão proposta

**Uma implementação canônica de Result/Error, reutilizada por todas as aplicações do monorepo.** Nenhuma feature declara um Result alternativo, envelope incompatível ou utilitário local de unwrap. A troca do escopo dos pacotes para `@meuproduto` foi uma mudança de integração; não criou outro contrato.

### API existente confirmada

| Export público                           | Contrato atual                                                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `Result<T, E = AppError>`                | União `Ok<T> \| Err<E>`, discriminada por `ok`.                                                                                      |
| `Ok(value)` / `Err(error)`               | `{ ok: true, value }` / `{ ok: false, error }`.                                                                                      |
| `map`, `mapErr`, `andThen`, `orElse`     | Transformação, encadeamento e recuperação sem unwrap indevido.                                                                       |
| `match(result, { ok, err })`             | Tratamento explícito das duas variantes.                                                                                             |
| `unwrapOr(result, fallback)`             | Fallback deliberado; não usar para esconder falha de uma leitura obrigatória.                                                        |
| `unwrapOrThrow(result)`                  | Devolve Ok; lança `toAppError(error)` em Err, inclusive quando o erro veio serializado. Restrito aos adaptadores que exigem exceção. |
| `fromPromise(factory, onError)`          | Captura exceções do I/O e retorna Result. Restrito à infraestrutura.                                                                 |
| `AppError` / `AppErrors`                 | Erro que estende Error e factories por categoria/código.                                                                             |
| `SerializedAppError` / `ActionResult<T>` | Payload de erro sem instância Error; `ActionResult<T> = Result<T, SerializedAppError>`.                                              |
| `serializeAppError` / `toActionResult`   | Projeção de erro para a fronteira; `toActionResult` também reporta categorias técnicas.                                              |
| `toAppError`                             | Reconstrói AppError a partir da forma serializada.                                                                                   |
| `errorStatusCode`                        | Mapeia categorias para status HTTP.                                                                                                  |
| `setActionFailureReporter`               | Callback global de processo para reporte de falha de Action.                                                                         |

`AppError` contém `category`, `code`, `message`, `details`, `context`, `retryable` e `cause`, além de stack herdada. `SerializedAppError` contém apenas `category`, `code`, `message`, `details` e `retryable`. Essa distinção é obrigatória ao retornar uma Action.

Categorias atuais: `validation`, `domain`, `not_found`, `conflict`, `application`, `infrastructure`, `integration`, `security` e `unexpected`. Não criar categorias ou códigos paralelos em uma feature.

Semântica do contrato, independentemente do nome de métodos ou discriminantes:

```text
Result<T, E> = Ok(T) | Err(E)
Operação falível(input) -> Promise<Result<Saída, ErroDaOperação>>
```

Este trecho resume o contrato existente; não define outro tipo TypeScript para copiar. `Ok` e `Err` são exclusivos. O consumidor deve verificar `result.ok` ou usar `match` antes de acessar valor ou erro. Coleção vazia é `Ok([])`; ausência legítima pode ser `Ok(null)` se declarada no contrato. `null`, array vazio ou valor padrão nunca escondem uma falha.

Casos de uso, validações falíveis e integrações I/O usam Result para falhas operacionais declaradas. Uma função pura que não pode falhar pode retornar diretamente seu valor. Defeitos de programação não são convertidos silenciosamente em um sucesso ou em um erro de validação.

### Contrato do erro

Usar as categorias e códigos do core para classificar falhas. `details` carrega informações da falha; `context` carrega contexto técnico para observabilidade. A categoria não substitui um código específico nem autoriza expor todo o contexto à UI.

| Classe de falha                    | Tratamento                                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Validação de entrada               | Err com problemas de campos quando aplicável; formulário preserva os valores.                                             |
| Regra de negócio / conflito        | Err com código estável e mensagem segura; não repetir automaticamente a operação.                                         |
| Autenticação / autorização         | Err ou controle explícito de acesso no adaptador Next; conferir sessão no servidor e retirar dado que perdeu autorização. |
| Recurso não encontrado             | Err ou ausência declarada, conforme a consulta; UI apresenta o estado correto.                                            |
| Rede / timeout / indisponibilidade | Err normalizado no adaptador de transporte; política explícita de tentativa.                                              |
| Payload fora do contrato           | Err técnico seguro; registrar evidência no servidor, sem expor resposta sensível.                                         |
| Cancelamento solicitado            | Preservar a semântica do runtime/Signal; não exibir como falha de negócio nem repetir uma busca cancelada.                |
| Defeito inesperado                 | Observabilidade e mecanismo de erro do runtime; não disfarçar como validação.                                             |

Não decidir comportamento comparando textos de mensagem. Detalhes técnicos, stack, credenciais e payloads sensíveis ficam no servidor. No Meuproduto isso inclui conteúdo de documento, CPF completo, tokens e URLs assinadas: nenhum deles entra em `message`, `details`, `context` ou log ([04 — Segurança](../produto/04-seguranca-confidencialidade.md), [ADR-011 de produto](../produto/adr/ADR-011.md)). Logs usam um identificador de correlação quando disponível; a UI recebe mensagem segura e referência de suporte, se necessária.

### Integração com os runtimes

| Fronteira                   | Regra                                                                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Caso de uso / integração    | Retorna Result; não lança exceção para representar recusa de negócio.                                                                                      |
| Server Action               | Resultado operacional é `ActionResult<T>` retornado por `toActionResult`. Valida entrada e acesso; não retorna `Err(AppError)` diretamente pela fronteira. |
| Route Handler               | Traduz Result em status HTTP e payload seguro, conforme o contrato do endpoint.                                                                            |
| Query function              | Adaptador usa `unwrapOrThrow` do core: extrai Ok e **lança AppError** em Err para registrar uma consulta falha.                                            |
| Mutation function do Query  | Adaptador equivalente evita que Err dispare `onSuccess`, toast de sucesso ou invalidação indevida.                                                         |
| Action com `useActionState` | Retorno Err é consumido como resultado da interação; erros esperados ficam no formulário.                                                                  |
| Leitura em Server Component | Trata Err deliberadamente na região; erro inesperado usa o mecanismo Next.                                                                                 |

TanStack Query trabalha com rejeição/throw para marcar falhas; um Promise resolvido contendo Err é dado bem-sucedido para a biblioteca. A conversão existe **somente no adaptador aprovado**, usando `unwrapOrThrow` já existente. A feature não escreve `throw new Error` para cada operação. [Referência: contrato de falhas com Suspense no TanStack Query](https://tanstack.com/query/latest/docs/framework/react/guides/suspense?from=reactQueryV3).

Algoritmo do adaptador com o contrato existente:

```text
Receber Result do contrato canônico
  Ok  -> devolver o valor para Query
  Err -> unwrapOrThrow reconstrói/preserva AppError e o lança

Resultado de mutation
  Ok  -> reconciliar dados e executar feedback de sucesso
  Err -> onError recebe AppError; apresentar feedback de falha
```

Este é o único ponto que reconcilia a convenção Result com a convenção de exceção da biblioteca. O core não importa Query ou React. `AppError` preserva categoria/código para classificar, mostrar e decidir retry. Falhas de transporte da própria chamada de Action também são tratadas na fronteira cliente.

Exemplo de consumo na fronteira Query, usando a API real; a operação é um placeholder de funcionalidade:

```ts
import { unwrapOrThrow } from "@meuproduto/core";

const result = await operation(); // Result ou ActionResult do contrato canônico
const data = unwrapOrThrow(result); // somente no adaptador Query/throw-based
```

Result é um objeto plano, mas `AppError` é uma classe. O codec existente é `toActionResult`/`serializeAppError` na saída e `toAppError` na reconstrução quando necessária. Não espalhar reconstrução de instâncias em features. O valor Ok também precisa ser compatível com o transporte.

`redirect`, `notFound` e outros controles do Next ficam fora de catches amplos ou são repropagados conforme o contrato do framework. Não transformar uma navegação do Next em Err genérico. [Referência: tratamento de erros e controles no Next.js](https://nextjs.org/docs/app/getting-started/error-handling).

## Alternativas consideradas

- Exceções em todos os casos de uso: não seguem o contrato escolhido e tornam falhas esperadas menos explícitas.
- `Result` diretamente como dado de Query: faz Err parecer sucesso.
- Um Result em cada feature: impede tratamento e serialização consistentes.
- Unwrap indiscriminado: retira do consumidor a decisão sobre recuperação.

## Consequências

Falhas se tornam parte da tipagem e do teste. São necessários adaptadores pequenos e testados; exceções continuam presentes nas fronteiras de frameworks e para defeitos inesperados. Essas exceções técnicas não autorizam abandonar Result no domínio.

## Verificação de aderência

| Regra                                  | Evidência                                                                                                                  | Estado                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Um único contrato                      | Imports públicos e lint contra outro tipo/interface Result; unwrap fora de adaptadores ainda requer verificação específica | Restrições configuradas; execução pendente neste repositório             |
| Tratamento de variantes                | Typecheck e testes permanentes do core                                                                                     | Pendente neste repositório; exaustividade de consumidores reais pendente |
| Err de Query/mutation não vira sucesso | Teste do adaptador: falha, sem callback de sucesso                                                                         | Planejado                                                                |
| Serialização preserva semântica        | Roundtrip de erro controlado no teste do core                                                                              | Pendente neste repositório; sanitização arbitrária pendente              |
| Erro de formulário preserva dados      | Teste da interação                                                                                                         | Planejado                                                                |

## Lacunas encontradas na inspeção

- `serializeAppError` remove cause/stack/context, mas copia `message` e `details` sem sanitizar. `details` aceita `unknown`: serialização segura e ausência de segredos não estão garantidas apenas pelo tipo. Definir mensagens públicas e campos permitidos; testar payloads antes de produção.
- `errorStatusCode` mapeia toda categoria `security` para 403. O desenho de autenticação precisa distinguir ausência/expiração de sessão e acesso proibido, sem criar um mapeamento local divergente.
- `setActionFailureReporter` é global por processo. Não guardar contexto de request/tenant nesse callback; ele deve consumir o contexto do próprio erro. A assinatura é síncrona, e o catch atual não trata uma Promise rejeitada por um reporter assíncrono. Definir explicitamente seu ciclo e tratamento de falhas na integração.
- A chave global de reporte (`Symbol.for(...)` em `result.ts`) ainda usa o identificador de um produto de origem. Adaptá-la sem duplicar a implementação. Os envelopes de entidade da origem foram retirados e não são contrato da API Meuproduto.
- A [suite permanente do core](../../packages/core/src/result.test.ts) cobre curto-circuito de `andThen`, roundtrip de um erro controlado, `unwrapOrThrow` e captura por `fromPromise`; não comprova segurança de payload arbitrário, status de autenticação ou reporte assíncrono.

Essas lacunas continuam necessárias antes de integrar os contratos em produção. A implementação e seus testes vieram da base; a execução deles neste repositório é verificação pendente.

A integração Result → Query/mutation e formulários com dados reais continua pendente.
