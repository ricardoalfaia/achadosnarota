# ADR-0006 — Estado HTTP, Actions, Query e cache

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípios:** P07, P08  
**Aceitação:** pendente.

## Contexto

Next.js pode ler APIs no servidor e executar comandos por Server Actions. TanStack Query pode coordenar o ciclo dos dados no navegador. São responsabilidades complementares: cache no servidor, cache cliente e estado global de UI não são a mesma coisa.

O objetivo é dar prioridade ao estado HTTP e reduzir estado global artificial. Não obrigar toda leitura a passar por Actions, nem adicionar Query para uma página que já resolve seus dados no servidor sem precisar mantê-los vivos no cliente.

## Decisão proposta

### 1. Escolha do caminho de dados

| Necessidade                                  | Caminho recomendado                                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Leitura inicial de uma região servidor       | Server Component → consulta/caso de uso → adaptador HTTP → API.                                                          |
| Leitura que deve continuar viva no navegador | Hook Query → adaptador cliente → GET de Route Handler/BFF autenticado → consulta/adaptador HTTP → API.                   |
| Formulário/comando pertencente ao Next       | React Action / `useActionState` → Server Action → caso de uso → API.                                                     |
| Mutação com listas vivas e cache Query       | `useMutation` → adaptador Result → Server Action ou endpoint de comando → caso de uso; reconciliar cache no coordenador. |
| Upload, streaming ou consumidor fora do Next | Endpoint com contrato HTTP próprio, quando necessário.                                                                   |

Server Actions ficam orientadas a comandos. A documentação atual do Next descreve Server Functions para mutações e despacho cliente sequencial; não são o mecanismo geral para buscar várias regiões em paralelo. [Referência: mutações no Next.js](https://nextjs.org/docs/app/getting-started/mutating-data).

Server Components chamam a consulta diretamente, sem fazer HTTP para seu próprio Route Handler. O BFF existe para a fronteira navegador/servidor e para contratos consumidos externamente. Fetch e cliente gerado ficam nos adaptadores, fora dos componentes de apresentação. [Referência: BFF no Next.js](https://nextjs.org/docs/app/guides/backend-for-frontend).

### 2. Quando TanStack Query agrega valor

Usar Query quando houver atualização no navegador, refetch, paginação/filtros interativos, compartilhamento da mesma leitura entre regiões, polling, invalidação após comandos ou otimismo com cache. Seu valor é o ciclo completo do estado remoto, incluindo deduplicação de leituras concorrentes equivalentes, não apenas guardar uma resposta.

Uma página somente de leitura pode usar Server Components e Suspense sem Query. Não copiar o mesmo dado para `useState`, Context ou Zustand para torná-lo compartilhado. A adoção de Query é por necessidade da funcionalidade, não um requisito de todos os componentes.

Várias chamadas de `useSuspenseQuery` no mesmo componente podem suspender em sequência e criar uma cascata de requests. Para leituras independentes, usar prefetch paralelo, regiões independentes ou `useSuspenseQueries`, conforme a composição. Dependências reais continuam sequenciais. [Referência: consultas suspensivas em paralelo](https://tanstack.com/query/latest/docs/framework/react/reference/useSuspenseQuery).

### 3. Fontes de estado

| Tipo de estado                                 | Dono                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| Dados autoritativos                            | API/backend.                                                             |
| Projeção remota em renderização servidor       | Consulta servidor e política explícita de cache Next, se houver.         |
| Projeção remota atualizável no navegador       | TanStack Query.                                                          |
| Filtros, paginação, ordenação ou aba navegável | URL, com parsing e valores padrão.                                       |
| Texto digitado ainda não aplicado ao filtro    | Estado local temporário; URL após a aplicação.                           |
| Campos, dirty/touched e erros de formulário    | Estado do formulário.                                                    |
| Pending e resultado de uma Action              | React Action/`useActionState` ou coordenador Query, conforme a operação. |
| Modal, foco ou seleção local                   | `useState`/`useReducer` na menor região responsável.                     |
| Estado de UI compartilhado em uma subárvore    | Elevar estado ou Context explícito de escopo limitado.                   |
| UI transversal com necessidade demonstrada     | Store dedicada, se escolhida em ADR; Zustand é candidato.                |
| Sessão, credenciais e autorização              | Servidor. Cliente recebe só o contexto seguro necessário para UI/cache.  |

Um rascunho de formulário é uma cópia intencional de edição, com política para sincronização/conflito. Refetch não sobrescreve silenciosamente campos dirty. Store de UI pode guardar um ID selecionado, sem copiar a entidade inteira. Consultar um detalhe não deve depender de sua presença em uma lista paginada ou filtrada.

### 4. Leitura inicial e hidratação

Se uma região Query participa do HTML inicial, escolher prefetch no servidor com `HydrationBoundary` e chaves equivalentes nos dois runtimes. O servidor usa consulta direta; refetch cliente usa o endpoint autenticado. O formato de dados e o adaptador Result devem ser equivalentes, sem importar credenciais ou módulos server-only no bundle cliente.

Criar QueryClient isolado por request/escopo de render no servidor; mantê-lo estável no navegador. Configurar `staleTime` conforme o recurso para evitar refetch imediato desnecessário. Prefetch é organizado por região; não aguardar todos os recursos da tela antes de mostrar conteúdo independente. Falha no prefetch não é tratada como uma leitura bem-sucedida: a política deve tratar o Result ou usar a operação que propaga a falha conforme o cenário.

Não renderizar dois indicadores do mesmo recurso, um fixo em Server Component e outro atualizado por Query, sem coordenação. Refetch de Query não revalida automaticamente a representação servidor. [Referência: hidratação, isolamento e propriedade dos dados no TanStack Query](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr).

Hidratação não é obrigatória para toda feature. Dados exclusivamente servidor não precisam dela; região cliente carregada após interação pode fazer sua leitura somente após montar. Alternativas de streaming de Query exigem validação de versão e testes, sem adotar integração experimental por padrão.

### 5. Política obrigatória de cada recurso

O contrato de dados da funcionalidade declara:

- chave de consulta e escopo de aplicação/contexto;
- filtros, paginação e demais entradas que alteram a resposta;
- `staleTime`, retenção (`gcTime`) e eventos de refetch relevantes;
- cache no servidor, se existir, com tags/escopo e política de expiração;
- comandos que invalidam listas, detalhes e agregados;
- retry por classe de falha, com limite e atraso;
- cancelamento, comportamento de background e estratégia de otimismo, se houver.

`staleTime` indica quando o dado fica desatualizado para a política de refetch; `gcTime` controla retenção de queries inativas. Deduplicação não garante um único request para sempre: montagem, foco, invalidation e políticas podem gerar novas leituras. Não aceitar defaults por desconhecimento. [Referência: defaults do TanStack Query](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults).

Consulta não armazena Err como um dado válido. Cancelamento é propagado pelo transporte quando suportado, sem retry indevido. Para pesquisas rápidas que exigem `enabled` e cancelamento, avaliar `useQuery`; a variante suspensiva tem limitações próprias. [Referências: cancelamento](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation) e [useSuspenseQuery](https://tanstack.com/query/latest/docs/framework/react/reference/useSuspenseQuery).

### 6. Escopo, sessão e autorização

Uma chave ilustrativa é `['web', scopeKey, 'customers', 'list', filters]`. `scopeKey` é um identificador não secreto do contexto autenticado; não é token, cookie ou credencial. Todos os parâmetros relevantes à resposta devem participar da identidade da query. A construção fica centralizada por recurso.

O servidor deriva e valida o contexto autorizado; um ID de tenant enviado pelo cliente nunca comprova acesso ([07 — API](../produto/07-api-eventos-operacoes.md), [ADR-003 de produto](../produto/adr/ADR-003.md)). O cliente pode conhecer um identificador seguro de tenant para navegação e particionamento de cache. Proibir sua visibilidade não cria uma barreira de segurança. No Meuproduto, `scopeKey` inclui a organização ativa da sessão ([ADR-0020](0020-autenticacao-e-sessao.md)); a relação organização × tenant ainda depende do [ADR-002 de produto](../produto/adr/ADR-002.md).

No logout ou troca de usuário/tenant: interromper atividade do contexto antigo quando possível, retirar sua UI, limpar/descartar seu QueryClient/cache e impedir que respostas atrasadas repovoem o contexto novo. Preferências visuais podem persistir; dados protegidos não são persistidos no navegador por padrão. Documentos e dados de clientes nunca vão para `localStorage`, IndexedDB ou cache persistente do navegador.

Sessão nova é proposta em cookie HttpOnly, Secure conforme o ambiente e política SameSite/CSRF definida no desenho de autenticação. Access/refresh tokens não ficam em stores cliente ou localStorage do novo app. Todo Route Handler e Action verifica autenticação, autorização de recurso e entrada; checagem só no layout não protege endpoints. [Referência: segurança de dados no Next.js](https://nextjs.org/docs/app/guides/data-security).

Cache persistente no servidor para dados privados começa desabilitado, salvo política justificada e particionada corretamente. Não assumir que cache é isolado por usuário/tenant ou que `fetch` será cacheado por padrão. Chave cliente correta também não corrige cache HTTP/CDN público indevido.

Memoização durante uma renderização/request, cache persistente no servidor e cache Query no navegador têm escopos distintos. Evitar requests equivalentes dentro da renderização não define quanto tempo um dado poderá ser reutilizado entre requests. [Referência: leitura, memoização e cache no Next.js](https://nextjs.org/docs/app/getting-started/fetching-data).

### 7. Comandos e consistência entre caches

Uma operação tem um coordenador de pending, resultado e otimismo. `useMutation` pode chamar uma Action por adaptador; não exige abandonar Actions nem usar um segundo `useActionState` para controlar o mesmo envio.

Depois de **Ok confirmado**:

1. O servidor invalida/atualiza somente as representações servidor afetadas, usando APIs compatíveis com a versão escolhida.
2. O coordenador cliente atualiza um detalhe com a resposta autoritativa quando suficiente e invalida listas/agregados afetados.
3. Quando existirem representações servidor visíveis do mesmo recurso, coordenar nova renderização depois da invalidação adequada.
4. O feedback distingue comando concluído de dificuldade em atualizar a visualização. Falha de refetch não significa que se deve reenviar o comando.

Invalidação do Next não limpa automaticamente o QueryClient. Invalidação do Query não atualiza automaticamente o cache servidor. Atualizar a rota não substitui invalidar dados servidor persistidos. Evitar invalidar todo o cache em qualquer comando.

Em **Err**, não executar feedback de sucesso. Otimismo é revertido e reconciliado por um único coordenador. Retry de comando fica desligado salvo operação idempotente comprovada e política explícita; timeout pode ocorrer depois de a API ter concluído. Erros de validação, acesso e conflito não recebem retry automático.

## Alternativas consideradas

- Todas as leituras por Actions: mistura comandos e consultas e limita o fluxo de leitura cliente.
- Query em toda página: adiciona dois ciclos de cache onde uma leitura servidor basta.
- Dados remotos em store global: exige reconstruir loading, erro, refetch e invalidação manualmente.
- Cache permanente para tudo: aumenta risco de dados desatualizados e de vazamento entre contextos.

## Consequências

Estado HTTP tem dono e ciclo claros; estado global é reduzido. A arquitetura exige contratos explícitos de query, um BFF para leituras cliente e disciplina de consistência entre caches. Os valores concretos das políticas serão definidos por recurso, não por um TTL universal.

## Verificação de aderência

| Regra                                              | Evidência                                                         | Estado    |
| -------------------------------------------------- | ----------------------------------------------------------------- | --------- |
| Nenhuma consulta de rotina usa Action como queryFn | Regra de imports e revisão de query options                       | Planejado |
| Estado remoto não é replicado em stores            | Revisão e restrições de dependência                               | Planejado |
| Hidratação e refetch coerentes                     | Teste com dados iniciais e atualização no navegador               | Planejado |
| Invalidação por recurso                            | Integração: lista, detalhe e agregado após Ok; sem sucesso em Err | Planejado |
| Escopo de cache isolado                            | Teste com dois contextos e resposta atrasada após troca           | Planejado |
| Sessão e acesso reais                              | Testes de endpoint/Action e Playwright                            | Planejado |

**Pendência a decidir:** a regra de filtros navegáveis na URL (P07) colide com o princípio de produto de não pôr dado confidencial em URLs ([README de produto](../produto/README.md), princípio 2). Uma busca livre por nome ou CPF de cliente na URL vai para histórico do navegador, logs de acesso e cabeçalho `Referer`. Até a decisão, filtros por valores fechados (estado, tipo, página) podem ir para a URL; texto livre de busca fica em estado local.

Relacionados: [Result/Error](0004-result-error.md), [DataBoundary](0005-data-boundary.md) e [monorepo e autonomia](0007-monorepo-e-autonomia.md).
