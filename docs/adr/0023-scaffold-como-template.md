# ADR-0023 — Scaffold do monorepo como template no GitHub

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípios relacionados:** P02, P09, P12  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; nada implementado. Nome do repositório e detalhes do script a definir.

## Contexto

O Achados na Rota nasceu de uma cópia manual de outra base ([origem da base](../origem-da-base.md)). A cópia exigiu remover domínio de cliente, renomear escopo, portas e textos, e conferir que nada ficou para trás. Esse trabalho se repete a cada produto novo e depende de memória.

O responsável quer que este monorepo seja a base dos próximos produtos: a mesma arquitetura, os mesmos princípios P01–P12 e o mesmo ferramental.

## Decisão proposta

- **Template derivado, não o próprio Achados na Rota.** Um repositório de template no GitHub ("template repository") é gerado a partir deste monorepo, **sem** `docs/produto`, sem conteúdo de negócio do Achados na Rota, sem marca e sem dados provisórios. Fica com: pacotes genéricos (`core`, `ui`, `data-boundary`, configs), a estrutura de apps, os scripts de verificação, a CI, os hooks, `docs/arquitetura.md` e os ADRs genéricos.
- **Script de inicialização.** No projeto novo, um script renomeia o escopo dos pacotes (`@achados/*`), o nome do app (`achados-web`), o prefixo dos tokens (`--ar-`), o prefixo dos cookies e a faixa de portas, e confere que nenhuma ocorrência do nome antigo sobrou.
- **Fonte única.** As melhorias de base são feitas aqui e propagadas ao template; o template não evolui por conta própria.
- **Sem histórico:** o projeto criado do template começa sem o histórico do Achados na Rota, como o Achados na Rota começou sem o da origem.

## Alternativas consideradas

- **Copiar manualmente a cada produto:** o que aconteceu agora; caro e sujeito a esquecer domínio do produto anterior.
- **Publicar os pacotes em um registro (npm privado):** compartilha código, não a estrutura, a CI nem os documentos; exige versionamento e publicação.
- **Gerador próprio (`create-*`) com perguntas:** mais flexível, com mais código para manter. Pode vir depois, se o script não bastar.
- **Usar o repositório do Achados na Rota como template direto:** carregaria documentos de produto, marca e domínio para todo projeto novo.

## Consequências

Começar um produto fica mais rápido e com menos risco de levar dados de outro. O custo é manter a separação entre o que é genérico e o que é do Achados na Rota, que já é exigida pelo [ADR-0007](0007-monorepo-e-autonomia.md), e manter o template atualizado.

## Verificação de aderência

| Regra                                       | Evidência esperada                                                 | Estado    |
| ------------------------------------------- | ------------------------------------------------------------------ | --------- |
| Template sem documentos ou marca do produto | Busca pelo nome do produto e por `docs/produto` no template gerado | Planejado |
| Projeto novo passa nas verificações         | Projeto criado do template, script executado, `pnpm check` e E2E   | Planejado |
| Nenhuma ocorrência do nome antigo           | Script de inicialização termina com a busca vazia                  | Planejado |

## Pendências e exceções

- Nome e organização do repositório de template no GitHub.
- Como gerar o template a partir daqui (script que copia e limpa, ou branch dedicada).
- Quais ADRs são genéricos e quais são do Achados na Rota (por exemplo, 0018, 0020 e 0022 são do produto).

Nenhuma exceção registrada.

## Referências

- [ADR-0007](0007-monorepo-e-autonomia.md) — monorepo e autonomia
- [ADR-0011](0011-estrutura-monorepo.md) — estrutura
- [Origem da base](../origem-da-base.md)
- [GitHub: criar um repositório de template](https://docs.github.com/repositories/creating-and-managing-repositories/creating-a-template-repository)
