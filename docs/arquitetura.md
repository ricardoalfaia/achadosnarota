# Meuproduto — princípios de arquitetura do frontend

**Data:** 16/10/2026 · **Etapa:** fundação copiada e adaptada · **Estado:** decisões propostas para revisão; verificações neste repositório a confirmar.

## 1. Propósito e limites desta etapa

Construir uma base que permita mudar o produto com confiança: localizar uma responsabilidade, alterar seu comportamento, testar o resultado e entregar sem regressão. O Meuproduto ("Seus documentos ganham vida.") é um SaaS horizontal de gestão e automação documental para pequenos escritórios; lida com documentos confidenciais e dados pessoais desde o primeiro dia.

**O produto é definido em [docs/produto](produto/README.md).** Lá estão escopo, arquitetura lógica, modelo de domínio, segurança, LGPD, assinaturas, API, plano de entrega, supervisão e os ADRs de produto (`ADR-001` a `ADR-012`). Este documento e os [ADRs de frontend](adr/README.md) dizem como o frontend e o monorepo são construídos; não redefinem decisões de produto. Os princípios inegociáveis do produto (privacidade por padrão, nada confidencial em logs, telemetria, prompts de IA ou URLs, documento assinado nunca editado, segurança como critério de aceite) valem para todo código daqui. O avanço segue os portões G0–G5 do produto: não avançar sem evidências verificáveis.

O monorepo reúne o app `meuproduto-web` (Next.js/Tailwind), a vitrine do design system (Storybook) e a documentação de negócio (Fumadocs). Não há aplicação legada a migrar. Backend, worker de PDF e fila são hipóteses do [documento de produto 02](produto/02-arquitetura.md); onde vão morar está nas decisões abertas.

Os princípios definem responsabilidades, contratos e como verificar sua aplicação. A estrutura está no [ADR-0011](adr/0011-estrutura-monorepo.md): apps na raiz, packages compartilhados, pnpm e Turborepo. Topologia de deploy e cronograma permanecem decisões posteriores. Os exemplos de funcionalidades nos ADRs continuam ilustrativos.

A base veio do monorepo Phibra.Web.Next, sem histórico git e sem o domínio do cliente de origem. O que foi reaproveitado, removido e alterado está em [origem da base](origem-da-base.md). Evidências de execução registradas na origem não valem aqui até serem refeitas.

**Diretrizes dadas pelo responsável:** Next.js + React 19 + Tailwind; responsabilidade única; componentes explícitos e compostos; Suspense + DataBoundary; Result/Error do core; prioridade ao estado HTTP; testes unitários + Playwright; decisões em ADRs; o mesmo padrão de arquitetura e princípios usado na base.

**Recomendações desta proposta:** Server Components como padrão de renderização, divisão entre leituras e comandos, critérios de adoção de TanStack Query, isolamento de cache, estratégia de testes e barreiras automáticas. Estão documentadas em ADRs com estado Proposto.

## 2. Princípios e evidências

| ID  | Princípio                               | Regra observável                                                                                                                           | Decisão                                        |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| P01 | Responsabilidade única e coesão         | Um componente, módulo ou função tem um motivo principal para mudar. HTTP, regra de negócio e apresentação podem evoluir separadamente.     | [ADR-0001](adr/0001-modularidade.md)           |
| P02 | Dependências explícitas                 | Cada módulo expõe um contrato público. Aplicações não importam aplicações; UI genérica não importa domínios.                               | [ADR-0001](adr/0001-modularidade.md)           |
| P03 | React 19 por intenção                   | Usar recursos atuais onde resolvem a necessidade: servidor, Suspense, Actions, transições e assinaturas externas.                          | [ADR-0002](adr/0002-react19-e-nextjs.md)       |
| P04 | Composição explícita                    | O leitor enxerga as partes da tela no JSX. Contextos, props e callbacks têm contratos claros.                                              | [ADR-0003](adr/0003-componentes-explicitos.md) |
| P05 | Resultado e falha são parte do contrato | Operações falíveis retornam Result do core; todo consumidor trata Ok e Err. Exceções de biblioteca são adaptadas em uma fronteira nomeada. | [ADR-0004](adr/0004-result-error.md)           |
| P06 | Carregamento e recuperação por região   | Cada região assíncrona relevante tem DataBoundary, fallback e caminho de recuperação. Erro de formulário permanece no formulário.          | [ADR-0005](adr/0005-data-boundary.md)          |
| P07 | Uma fonte responsável por cada estado   | URL, formulário, UI local, cache remoto e sessão têm donos diferentes. Não sincronizar cópias de dados HTTP por efeitos.                   | [ADR-0006](adr/0006-estado-http-e-cache.md)    |
| P08 | Cache é uma política explícita          | Cada recurso define escopo, atualização e invalidação. Nenhum cache é fronteira de autorização.                                            | [ADR-0006](adr/0006-estado-http-e-cache.md)    |
| P09 | Compartilhamento por contrato           | Compartilhar capacidades estáveis; preservar autonomia de build e de deploy entre aplicações.                                              | [ADR-0007](adr/0007-monorepo-e-autonomia.md)   |
| P10 | Design system acessível                 | Tokens semânticos, Tailwind e componentes com teclado, foco e semântica preservados pela composição.                                       | [ADR-0008](adr/0008-design-system.md)          |
| P11 | Testar comportamento e risco            | Regras em testes rápidos; integração para contratos, cache e isolamento; Playwright para jornadas.                                         | [ADR-0009](adr/0009-testes.md)                 |
| P12 | A arquitetura precisa ser verificável   | ADRs, contratos, revisão e barreiras de CI impedem desvios; documentação sozinha não basta.                                                | [ADR-0010](adr/0010-governanca.md)             |

## 3. Modelo de responsabilidades

As caixas representam responsabilidades, não diretórios ou classes obrigatórias. Uma funcionalidade simples pode ter poucas funções; camadas sem comportamento não precisam de wrappers.

```mermaid
flowchart TD
    Route[Entrada de rota Next.js] --> Composition[Composição da funcionalidade]
    Composition --> Read[Leitura no servidor ou região cliente]
    Composition --> UI[Componentes de apresentação]
    Read --> UseCase[Consulta ou caso de uso]
    UI --> Command[Adaptador de comando]
    Command --> UseCase
    UseCase --> Domain[Regras puras e contratos]
    UseCase --> Port[Contrato da integração]
    HTTP[Adaptador HTTP] -. implementa .-> Port
    HTTP --> API[API ou banco com escopo de tenant]
```

| Responsabilidade       | Faz                                                                             | Fronteira                                                                         |
| ---------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Entrada Next.js        | Parâmetros de rota, metadata, composição e convenções do framework.             | Não concentra regras de negócio. Não há regra artificial de uma única importação. |
| Composição             | Expõe as regiões, fronteiras de dados e interações entre partes.                | Não implementa transporte ou cálculo de negócio. Pode existir no servidor.        |
| Apresentação           | Renderiza dados tipados, acessibilidade e interações locais.                    | Componentes reutilizáveis não conhecem endpoint, credencial ou cache.             |
| Coordenador de dados   | Conecta Query/Action, mapeamento e eventos da região.                           | Hook não vira depósito de todas as regras da tela.                                |
| Caso de uso / consulta | Coordena a operação e retorna Result.                                           | Não depende do DOM, React, Tailwind ou cache do navegador.                        |
| Domínio                | Regras, invariantes e transformações puras quando pertencem ao frontend.        | O servidor continua responsável por autorização, tenant e regras autoritativas.   |
| Integração HTTP        | Request, timeout, cancelamento, validação do contrato e normalização de falhas. | Fetch fica nesta fronteira; DTO externo não invade todo o JSX.                    |
| Core Result/Error      | Um contrato canônico e independente de framework.                               | Não importa features, Next.js, React ou TanStack Query.                           |

Dados serializáveis podem atravessar servidor e cliente. Callbacks comuns ficam dentro de uma árvore cliente; Server Functions e composição via children seguem os contratos próprios do React. Não passar instâncias de serviço, credenciais ou funções arbitrárias pela fronteira.

## 4. Regras que devem ficar evidentes no código

Uma seção de lista pode coordenar seu hook de dados e renderizar filtros, tabela, paginação e editor separados. A linha da tabela recebe dados e callbacks; não decide como autenticar ou invalidar cache. Um cálculo do domínio permanece testável sem montar um componente.

Componentizar muito significa separar responsabilidades e construir partes úteis. Uma função trivial não precisa virar um hook nem cada elemento HTML um arquivo. Contagem de linhas ajuda a localizar problemas; não comprova responsabilidade única. O [ADR-0003](adr/0003-componentes-explicitos.md) define os sinais de extração.

Estado HTTP tem vida própria: carregamento inicial, dado vazio, dado atual, atualização em segundo plano, falha inicial, falha após sucesso e resultado de uma mutação. Suspense não elimina todos esses estados. O [ADR-0005](adr/0005-data-boundary.md) define a apresentação; o [ADR-0006](adr/0006-estado-http-e-cache.md), seus donos e políticas.

## 5. Definição de pronto de uma funcionalidade

- [ ] Responsabilidades separadas e dependências seguindo contratos públicos.
- [ ] Contrato Result/Error canônico usado nas operações falíveis; nenhum Err tratado como sucesso de consulta ou mutação.
- [ ] Leitura inicial e dono da atualização definidos; uso de Query justificado pela necessidade do navegador.
- [ ] Regiões assíncronas com loading, vazio, erro e recuperação definidos; atualização em segundo plano preserva dados quando seguro.
- [ ] Filtros navegáveis na URL; dados remotos fora de stores globais de UI.
- [ ] Autorização e tenant no servidor, cache isolado por contexto e payloads sem segredos.
- [ ] Nenhum conteúdo de documento, CPF completo, token ou URL assinada em log, telemetria, mensagem de erro ou URL; fixtures sintéticas.
- [ ] Teste de isolamento tenant A/B quando a funcionalidade lê ou grava dado de negócio.
- [ ] Componentes explícitos, navegação por teclado e foco verificados nas interações relevantes.
- [ ] Testes de regras, integrações e jornadas proporcionais ao risco, passando.
- [ ] ADRs aplicáveis citados; documentação e verificações atualizadas junto com a mudança.

## 6. Sequência de consolidação

1. Revisar estes princípios e os ADRs adaptados, resolver divergências com os documentos de produto e registrar a aceitação.
2. Executar neste repositório as verificações herdadas (`pnpm check`, E2E, histórias do design system) e registrar os resultados nos ADRs, sem reaproveitar os da origem.
3. Validar os contratos de [Result/Error](../packages/core/src/result.ts) e [DataBoundary](../packages/data-boundary/src/data-boundary.tsx) e tratar suas lacunas antes de torná-los referência executável. As assinaturas estão nos ADRs 0004 e 0005; não criar implementações concorrentes.
4. Concluir identidade, sessão e isolamento multi-tenant ([ADR-0020](adr/0020-autenticacao-e-sessao.md)) com testes A/B, que são o aceite do M1 ([08 — Plano de entrega](produto/08-milestones-e-aceite.md)).
5. Implementar uma funcionalidade vertical de referência, provavelmente clientes ([ADR-0021](adr/0021-paginas-de-cadastro.md)): leitura, composição, comando, erro, invalidação, autorização e testes.
6. Só então repetir o padrão por funcionalidade, um marco por vez, com aprovação humana entre os portões.

## 7. Decisões ainda abertas

| Tema                                               | Evidência necessária                                                                                                                                                                                   | Quando resolver                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Validação completa de Result/Error e DataBoundary  | Testes da base executados aqui; ainda faltam payloads arbitrários seguros, background, acesso revogado e streaming real.                                                                               | Antes dos fluxos de produção correspondentes.  |
| Identidade e modelo organização/tenant             | Desenho do ADR-0020 (Better Auth, `organization`, `tenant`, `tenant_user`, RLS) confrontado com o ADR-002 de produto; mapeamento dos papéis do documento 01; carteira por organização do documento 06. | M1 (portão G2).                                |
| Onde fica o backend                                | Hoje identidade e acesso a dados ficam no app Next; o documento 02 previa Fastify separado. Necessidade real do worker de PDF, fila e outbox.                                                          | Antes do worker de PDF (M3).                   |
| ORM, migrações e versão do Postgres                | Drizzle era hipótese do documento 02 e é adotado em `@meuproduto/db`; confirmar e decidir se o Postgres 18 de desenvolvimento casa com a versão de produção.                                           | Antes do primeiro ambiente de homologação.     |
| Contrato real da API                               | OpenAPI dos endpoints do documento 07, com erros sem dados sensíveis e paginação.                                                                                                                      | Antes do primeiro adaptador HTTP de produção.  |
| Armazenamento privado e URLs assinadas             | Provedor de objetos de produção, criptografia, ciclo de vida e duração das URLs ([ADR-005 de produto](produto/adr/ADR-005.md)); o SeaweedFS local só simula.                                           | Antes do upload e download de documentos (M3). |
| Geração de PDF                                     | Biblioteca ou serviço com geração determinística e hash, executada fora da requisição ([ADR-004 de produto](produto/adr/ADR-004.md)).                                                                  | M3.                                            |
| Observabilidade sem dados pessoais                 | Ferramenta de logs, métricas e traces com redação de PII e IDs de correlação ([04 — Segurança](produto/04-seguranca-confidencialidade.md)).                                                            | Antes do piloto (G5).                          |
| Filtros na URL × dado confidencial                 | Regra para busca livre (nome, CPF) que hoje iria para a URL pelo P07 ([ADR-0006](adr/0006-estado-http-e-cache.md)).                                                                                    | Primeira listagem com busca.                   |
| Identidade visual no tema escuro e escala de texto | Decisões abertas do [ADR-0022](adr/0022-identidade-visual-meuproduto.md), conferidas com o responsável.                                                                                                | Antes da primeira tela além da casca.          |
| Biblioteca de formulário                           | Complexidade dos formulários reais. RHF/Zod e primitivas acessíveis são candidatos.                                                                                                                    | Primeira funcionalidade de referência.         |
| Metas de CI                                        | Tempos medidos na primeira execução do GitHub Actions e jornadas críticas.                                                                                                                             | Depois da primeira execução da CI.             |
| Template para outros produtos                      | Nome do repositório e forma de geração ([ADR-0023](adr/0023-scaffold-como-template.md)).                                                                                                               | Antes do próximo produto.                      |

Referências técnicas oficiais estão junto às decisões que fundamentam. Não fixamos uma versão de biblioteca a partir de exemplos de outro produto.
