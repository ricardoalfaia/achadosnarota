# ADR-0009 — Testes rápidos, integração e Playwright

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípio:** P11  
**Aceitação:** pendente. Testes unitários e Playwright são diretrizes do responsável.

## Contexto

Precisamos implementar rapidamente com confiança, sem descobrir comportamento crítico apenas depois do deploy. Testes precisam seguir as responsabilidades: regras independentes de React são rápidas de testar; SSR, sessão e navegação exigem o runtime real.

## Decisão proposta

Testes fazem parte da funcionalidade desde o primeiro fluxo. Recomenda-se Vitest para regras, contratos e componentes compatíveis, com React Testing Library para comportamento de UI e MSW ou servidor de teste para a fronteira HTTP. Playwright valida jornadas no navegador.

No Achados na Rota, isolamento entre tenants e privacidade são critérios de aceite, não testes opcionais: o Definition of Done de [08 — Plano de entrega](../produto/08-milestones-e-aceite.md) pede testes de autorização tenant A/B em toda entrega, e [09 — Prompt](../produto/09-prompt-claude.md) pede fixtures sintéticas, nunca dados reais.

### Distribuição de evidências

| Nível                | Cobrir                                                                     | Evitar                                                                 |
| -------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Unitário de regra    | Invariantes, cálculo, parsing, mapeamento, códigos de falha e casos limite | Montar React para testar uma regra pura.                               |
| Contrato/core        | Result Ok/Err, exaustividade e codec; adaptadores Query e HTTP             | Replicar a implementação do core em mocks.                             |
| Componente/interação | Inputs, teclado, foco, composição, feedback e eventos visíveis             | Asserts sobre hooks privados, classes Tailwind ou contagem de renders. |
| Integração           | Normalização HTTP, query keys, retry, invalidação, hidratação e contexto   | Mockar justamente a integração cujo contrato deve ser comprovado.      |
| E2E                  | Sessão, rota, SSR/streaming, jornadas, persistência e isolamento A/B       | Testar todas as combinações de regra somente pelo browser.             |

Uma região RSC assíncrona não deve ser tratada como se `render()` em DOM simulado executasse o pipeline inteiro do Next. A orientação atual do Next recomenda E2E para async Server Components no fluxo Vitest. Testar suas funções independentemente e comprovar a composição em runtime real. [Referência: Vitest com Next.js](https://nextjs.org/docs/app/guides/testing/vitest).

### Contratos prioritários da fundação

Antes de replicar a primeira funcionalidade, provar:

1. Result Ok/Err e serialização com a API existente; Err não dispara sucesso em Query/mutation; mensagens/details não expõem informações técnicas ou segredos.
2. DataBoundary com espera, falha inicial, retry e isolamento entre regiões, incluindo a correção do reset identificado no ADR-0005.
3. Falha de refetch preserva dado seguro; perda de acesso retira dado protegido.
4. Uma mutação atualiza/invalida lista, detalhe e agregados conforme seu contrato, sem precisar recarregar tudo.
5. Troca de usuário/tenant não reutiliza o cache anterior; resposta atrasada não reaparece no contexto novo.
6. Formulário trata validação e conflito sem perder o rascunho; campos compostos comprovam reset, disabled, required, valor enviado, teclado e foco.
7. Login, navegação direta, refresh e logout funcionam no build real.
8. Usuário da organização A não lê nem altera dado da organização B por URL, Action ou Route Handler, inclusive trocando um identificador na requisição ([04 — Segurança](../produto/04-seguranca-confidencialidade.md), tabela de ameaças).
9. Nenhum log, mensagem de erro ou URL gerado nos testes contém conteúdo de documento, CPF completo, token ou URL assinada.
10. Hooks compartilhados comprovam snapshot inicial, hidratação, atualização e cleanup conforme seus contratos.

### Playwright

Jornadas observam resultado do usuário: locators por role/label/texto estável, expectativas que aguardam o estado e dados isolados por teste/worker. Não usar sleeps fixos, dependência de execução anterior ou seletores de CSS estrutural como contrato principal. `data-testid` é permitido quando não há locator acessível estável. [Referência: boas práticas do Playwright](https://playwright.dev/docs/best-practices).

Fixtures criam dados sintéticos e determinísticos, organizam sessão, distinguem contexto/tenant e fazem cleanup do que criaram. Nenhuma fixture usa documento ou dado pessoal real. A API de helpers permanece pequena; não criar um framework de testes maior que as jornadas. [Referência: fixtures do Playwright](https://playwright.dev/docs/test-fixtures).

Para E2E crítico, executar contra um build de produção do app em ambiente de teste, com backend controlado e persistência verificável. Interceptar uma request do browser não intercepta automaticamente uma chamada feita pelo Server Component ou pelo BFF: mocks/stubs da API devem estar no ponto de integração realmente usado.

Testes com HTTP simulado são válidos para estado de UI e falhas determinísticas; identificar essa modalidade. Uma jornada totalmente simulada não é a única evidência de sessão, autorização ou persistência real. Não usar produção como ambiente de fixtures destrutivas.

Traces, screenshots e logs de falha ajudam a diagnosticar; não usar retries para esconder flakiness. Um teste instável tem responsável e correção, e não é silenciosamente excluído do critério de entrega.

### Velocidade e escopo da CI

- Local: testes próximos à alteração e typecheck/lint pertinentes para feedback rápido.
- PR: módulos alterados **e consumidores afetados**, verificações de arquitetura, build pertinente e E2E das jornadas críticas afetadas.
- Mudança em Result, DataBoundary, sessão, tokens ou UI compartilhada: ampliar para seus consumidores; uma mudança compartilhada não é validada apenas no pacote produtor.
- Suite ampla e navegadores adicionais: execução periódica e antes de releases conforme a matriz de suporte. O PR mantém o smoke crítico.

Medir duração e flakiness; otimizar fixtures, paralelismo, cache de build e seleção pelo grafo. “Tempo recorde” vem de funções testáveis e contratos reutilizáveis, não de remover a evidência. Não prometemos duração de pipeline antes de medi-la.

Cobertura serve para localizar lacunas em regras e contratos críticos. Não adotar uma porcentagem global como substituta de cenários; não escrever teste para cada wrapper trivial ou snapshot extenso de tela apenas para aumentar a métrica.

## Alternativas consideradas

- Só E2E: aproxima comportamento real, mas torna variações de regra lentas e difíceis de diagnosticar.
- Só unitários: rápido, mas não comprova sessão, transporte, hidratação ou isolamento.
- Testes depois da funcionalidade: favorece regressões e deixa isolamento e privacidade para o fim.

## Consequências

Existe investimento inicial em fixtures, contratos e ambiente controlado. Esse investimento reduz o custo das telas seguintes. Testes validam resultados; não garantem sozinhos responsabilidade única ou ausência de acoplamento.

## Verificação de aderência

| Regra                                   | Evidência                                           | Estado    |
| --------------------------------------- | --------------------------------------------------- | --------- |
| Regras testáveis sem UI                 | Suite unitária rápida                               | Planejado |
| Integrações não confundem sucesso/falha | Casos Ok, Err, timeout, conflito e recuperação      | Planejado |
| Isolamento entre organizações           | Testes A/B em Action, Route Handler e E2E           | Planejado |
| Testes são determinísticos              | Fixtures isoladas, sem sleeps e sem ordem implícita | Planejado |
| Feedback rápido e confiável             | Medição de duração e flakiness na CI                | Planejado |

**Estado atual:** os testes permanentes de core, calendário/schema, DataBoundary e do app vieram da base. A execução deles neste repositório é verificação pendente, salvo o que estiver registrado no ADR correspondente. Jornadas de negócio, backend, isolamento A/B, streaming e acessibilidade completa dos campos continuam pendentes.
