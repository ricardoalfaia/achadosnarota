# ADR-0010 — ADRs e aderência verificável

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípio:** P12  
**Aceitação:** pendente.

## Contexto

Documentos não impediram componentes monolíticos nem o abandono de contratos em experiências anteriores. Uma IA pode reproduzir exemplos sem entender as fronteiras. Precisamos de instruções curtas, evidências concretas e regras executáveis, sem exigir um ADR para cada detalhe.

## Decisão proposta

Cada decisão arquitetural possui um ADR. O [índice](README.md) informa estados; os [princípios](../arquitetura.md) resumem as decisões; [AGENTS.md](../../AGENTS.md) orienta o trabalho no repositório. Contratos públicos e testes da implementação mostram a aplicação concreta.

As instruções atuais do responsável prevalecem. ADRs de produto (`docs/produto/adr/ADR-001` a `ADR-012`) e ADRs de frontend (`docs/adr/0001` em diante) são registros distintos; um ADR de frontend que dependa de uma decisão de produto cita o ADR de produto e não a redefine. Uma mudança explícita de direção é refletida no registro. Para decisões aceitas, mudança de fronteira, contrato ou estratégia recebe novo ADR; o anterior é marcado como substituído. Uma tarefa local que segue os contratos existentes não precisa desse rito.

Os ADRs desta fase permanecem propostos. Aceitação registra responsável e data, sem inventar aprovação. Aceitação documental e evidência de funcionamento são estados diferentes. O avanço entre marcos segue os portões G0–G5 e a supervisão de [10 — Supervisão](../produto/10-supervisao.md) ([ADR-012 de produto](../produto/adr/ADR-012.md)).

### Barreiras planejadas

| Regra                                         | Mecanismo previsto                                                                    | Limite                                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Tipos e contratos seguros                     | TypeScript strict, sem `any` não justificado; opções adicionais avaliadas no novo app | Tipagem não valida uma resposta HTTP em runtime.                                         |
| Dependências respeitam fronteiras             | Imports restritos, exports públicos e detecção de ciclos por grafo                    | Estrutura precisa ser definida antes de configurar paths concretos.                      |
| Código servidor permanece no servidor         | Limites server-only/client e build do Next                                            | Revisão ainda confere payloads e segredos.                                               |
| Dados não são buscados no JSX de apresentação | Restrições de imports de HTTP/Query/Actions na UI de apresentação                     | Regiões coordenadoras possuem escopo próprio e explícito.                                |
| Hooks e assincronismo corretos                | Regras React Hooks e promises sem tratamento                                          | Não provam tratamento exaustivo de todos os Results.                                     |
| Um core Result/Error                          | Restrição de declarações/imports concorrentes e unwrap; testes do core/adaptadores    | Pode exigir regra AST específica; não é prometido como recurso automático do TypeScript. |
| Cache e mutações coerentes                    | Testes de integração e contratos por recurso                                          | Análise estática não comprova todos os casos de invalidação.                             |
| Build dos consumidores compatível             | Pipeline por grafo com checks dos consumidores afetados                               | Cache e seleção de projetos precisam ser configurados e validados.                       |
| Jornadas críticas funcionam                   | Unitários, integração e Playwright                                                    | Testes de comportamento não substituem revisão de arquitetura.                           |

pnpm/Turborepo coordenam lint, tipos, testes e build. O script de arquitetura verifica grafo, dependências declaradas e imports públicos entre projetos; ESLint restringe declarações concorrentes de Result, excetuando somente seu arquivo canônico. As demais barreiras continuam planejadas. Não atribuir ao lint garantias que ele não implementa; a CI ([GitHub Actions](../../.github/workflows/ci.yml)) não permite bypass silencioso via disable, exclusão de teste ou cast.

### Revisão humana e de agentes

O autor de uma mudança informa:

- qual capacidade e responsabilidade estão mudando;
- quais ADRs e contratos se aplicam;
- qual é o dono de cada dado/estado e quem atualiza o cache;
- como Ok/Err, loading, vazio, falha e recuperação são tratados;
- quais testes/checks foram executados e seus resultados;
- impactos nos consumidores, quando existirem;
- efeito sobre isolamento entre tenants e sobre dados confidenciais (logs, URLs, telemetria), conforme os bloqueios automáticos de [10 — Supervisão](../produto/10-supervisao.md).

O revisor procura responsabilidades misturadas, dependências ocultas, cópias de estado HTTP e adaptação de erros fora da fronteira. Não aprova pela contagem de arquivos ou pela aparência de JSX curto.

### Exceções e dívida técnica

Uma exceção a decisão aceita registra motivo, escopo, responsável, rastreio e condição/prazo de retirada. A exceção é restrita; não redefine o padrão de todo o repositório. Se o padrão precisa mudar, criar uma decisão substituta.

### Funcionalidade de referência

Antes de repetir a arquitetura, construir uma capacidade pequena e real que exercite leitura, composição, DataBoundary, Result, formulário/comando, invalidação, autorização e testes. Esta implementação será o exemplo verificável, com links para os contratos e ADRs; não um exemplo que viola suas próprias regras.

Não gerar scaffolding de dezenas de módulos antes de provar esse fluxo. Evoluir os documentos junto com o código quando a experiência revelar uma limitação.

## Alternativas consideradas

- Apenas um documento longo de arquitetura: fácil de consultar, insuficiente para bloquear desvios e registrar evolução.
- ADR para toda alteração: cria burocracia e retira atenção das decisões relevantes.
- Só regras de lint: úteis para restrições objetivas, insuficientes para decidir coesão e semântica.

## Consequências

Decisões e exceções ficam rastreáveis; conflitos entre documento e código aparecem na revisão. Existe custo de configurar barreiras e mantê-las. O padrão precisa ser ajustado por decisões explícitas quando fatos novos exigirem, sem transformar a arquitetura em um catálogo imutável.

## Verificação de aderência

| Regra                                | Evidência                                              | Estado                            |
| ------------------------------------ | ------------------------------------------------------ | --------------------------------- |
| Registro coerente                    | ADRs numerados, estados e links válidos                | Verificável nesta fase documental |
| Barreiras reais                      | Configuração executável e casos que comprovam bloqueio | Planejado                         |
| Implementação de referência aderente | Revisão e checks da capacidade vertical                | Planejado                         |
| Mudanças e exceções rastreáveis      | ADRs/PRs com dono e evidência                          | Planejado                         |

**Estado atual:** a estrutura do ADR-0011 e as verificações locais vieram da base ([origem da base](../origem-da-base.md)); sua execução neste repositório é verificação pendente. O core canônico é a única origem permitida de Result. A CI está escrita em GitHub Actions e ainda não foi executada. Verificação de todas as exceções/adaptadores e a funcionalidade vertical de referência permanecem pendentes.
