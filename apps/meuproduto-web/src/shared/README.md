# Composição comum deste app

Esta pasta recebe composição realmente comum do Meuproduto Web e suas integrações locais com Next/React, quando houver necessidade. Componentes genéricos compartilháveis pertencem a `packages/ui`; regras e operações de negócio pertencem à capacidade em `features`.

Não criar um provider global de Query antes de uma região cliente precisar desse cache. Não copiar dados HTTP para uma store de UI nem concentrar transporte, regra e apresentação em um hook global.
