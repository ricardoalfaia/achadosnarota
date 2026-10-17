# Capacidades do Meuproduto Web

Cada funcionalidade de negócio pertence a uma pasta com nome de capacidade. A rota em `src/app` resolve convenções Next e compõe essa funcionalidade pelo contrato público.

Quando houver comportamento suficiente, separar componentes de apresentação, regras puras, operação, adaptadores HTTP/Actions e coordenação de Query. Hooks conectam React; regras permanecem testáveis sem render. Criar apenas as divisões necessárias ao fluxo, com testes próximos ao comportamento.

Outras funcionalidades consomem `index.ts`, preservando os internos. Componentes genéricos vêm de `@meuproduto/ui`; Result vem de `@meuproduto/core`. Ver [ADR-0001](../../../../docs/adr/0001-modularidade.md) e [ADR-0011](../../../../docs/adr/0011-estrutura-monorepo.md).
