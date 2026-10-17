# Supervisão das entregas

Toda entrega, humana ou feita por agente, termina com o que permite a quem supervisiona decidir sem reabrir o código:

1. **Arquivos alterados** e o motivo de cada grupo de mudanças.
2. **Verificações executadas**, com o comando e a saída resumida: `pnpm check:architecture`, lint, typecheck, testes, build e, quando houver jornada afetada, `pnpm test:e2e`. O que não rodou é dito, com o motivo.
3. **Isolamento entre usuários e entre parceiros** quando a mudança lê ou grava dado de negócio: teste A/B que prova que um não vê nem altera o dado do outro.
4. **Separação editorial-comercial** quando a mudança toca curadoria, selos, notas ou ofertas ([ADR-004](adr/ADR-004.md)).
5. **Efeitos sobre privacidade**: dados novos coletados, base legal pretendida, onde aparecem e o que fica fora de logs ([04](04-seguranca-lgpd.md)).
6. **ADRs aplicáveis**, de produto e de frontend, e mudanças de contrato.
7. **Riscos e pendências**, separando fato verificado de hipótese.

Nenhuma entrega declara pronto o que não foi executado, nem apresenta ADR proposto como aceito.
