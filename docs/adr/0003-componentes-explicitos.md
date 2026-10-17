# ADR-0003 — Componentes explícitos e composição

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípio:** P04  
**Aceitação:** pendente.

## Contexto

Telas extensas misturam responsabilidade de filtros, listagem, editor, linha, feedback e transporte. Componentes configurados por dezenas de flags ocultam a estrutura e permitem combinações inválidas. Queremos componentização forte sem obrigar o leitor a atravessar abstrações vazias.

## Decisão proposta

O JSX deve revelar as partes relevantes da interface. Preferir componentes com nomes, props tipadas e callbacks que expressem uma intenção. Separar composição da tela, região que coordena dados, partes de apresentação e primitivas do design system.

O [Select herdado da base](../../packages/ui/src/components/Select/Select.tsx) já separa resolução de opções, [campo](../../packages/ui/src/components/Select/components/campo.tsx), lista e itens. Ele usa `use` para uma Promise estável e `useFormStatus` no campo. Esse é um exemplo útil de separação interna de partes; não obriga expor todas elas como compound components na API pública.

Uma região pode consumir seu hook de dados; suas partes reutilizáveis recebem dados e callbacks. Regras de negócio permanecem independentes de React. Estado local e handlers simples, como abrir um painel, podem permanecer no componente responsável por essa interação.

Composição com partes explícitas, incluindo compound components, é recomendada quando as partes têm uma relação estável. Não criar um motor genérico de telas/cadastros antes de conhecer suas variações reais.

### Exemplo de intenção

API ilustrativa de composição, ainda não implementada:

```tsx
<CustomerPanel>
  <CustomerPanel.Header>
    <CustomerTitle customer={customer} />
    <CustomerActions onEdit={openEditor} />
  </CustomerPanel.Header>
  <CustomerPanel.Body>
    <CustomerSummary customer={customer} />
    <CustomerContacts contacts={customer.contacts} />
  </CustomerPanel.Body>
  <CustomerPanel.Footer>
    <CustomerAuditSummary updatedAt={customer.updatedAt} />
  </CustomerPanel.Footer>
</CustomerPanel>
```

O componente responsável pelo layout não busca o cliente, não infere permissões e não decide quando salvar. `CustomerActions` recebe ações disponíveis e callbacks definidos pela composição da funcionalidade. A validação de permissão continua no servidor.

### Contrato de composição

- `children`, slots nomeados ou partes explícitas representam layout e conteúdo. Usar o menor mecanismo que atende às variações reais.
- Props obrigatórias não são obtidas de stores globais ocultas. Para variantes incompatíveis, usar união discriminada em vez de combinações de booleanos.
- Context interno é permitido para coordenar partes, por exemplo foco, seleção e estado de um dialog. O provider, o escopo e o comportamento fora do root são documentados; consumo inválido falha com mensagem útil em desenvolvimento.
- Evitar inspecionar nomes de componentes, reordenar children silenciosamente ou injetar props por `cloneElement` como mecanismo geral de descoberta. Uma primitiva de composição de biblioteca pode fazê-lo se seu contrato for explícito e testado.
- Partes visuais não disparam HTTP ao serem montadas. A região dona dos dados faz essa coordenação.
- Composição preserva semântica HTML, labels, teclado, foco e nome acessível.

### Quando extrair

Extrair uma seção, linha, editor, menu, estado vazio ou feedback quando possuir responsabilidade, variação, interação ou teste próprio. Separar imediatamente quando o mesmo componente contém transporte, regras de domínio e renderização detalhada de várias regiões.

Contagem de linhas é um sinal de revisão. Não adotamos um limite universal de 80 ou 400 linhas, nem criamos um arquivo por `<div>`. Um arquivo curto com responsabilidades misturadas também precisa ser corrigido.

Micro-wrappers são permitidos para adaptar dados a uma parte de apresentação. Eles não podem ocultar que um item está ausente: distinguir cache incompleto, loading, não encontrado e falha conforme o caso. Ler uma lista filtrada do cache não prova que a entidade não existe.

## Alternativas consideradas

- Componente único por tela: baixo custo inicial, alto custo de alteração e teste.
- Componente universal com modo, feature flags e schema de renderização: pode servir a um problema específico, mas tende a esconder dependências entre variantes.
- Extrair toda expressão para hook/componente: aumenta indireção sem separar motivos de mudança.

## Consequências

A composição se torna revisável e as partes podem ser testadas isoladamente. Alguns contratos ficam mais verbosos, o que é aceitável quando explicita comportamento. Compartilhamento depende da estabilidade da API, não apenas de duas ocorrências semelhantes.

## Verificação de aderência

| Regra                               | Evidência                          | Estado         |
| ----------------------------------- | ---------------------------------- | -------------- |
| Estrutura e dependências legíveis   | Revisão do JSX e das props         | Revisão manual |
| Variantes válidas                   | Typecheck dos contratos públicos   | Planejado      |
| Partes genéricas sem I/O ou domínio | Regra de imports e teste com props | Planejado      |
| Composição acessível                | Teste de interação, teclado e foco | Planejado      |

Relacionados: [modularidade](0001-modularidade.md) e [design system](0008-design-system.md).
