# Design system — vitrine

Storybook dos tokens e componentes de `@meuproduto/ui`. As histórias consomem o contrato público do pacote, como qualquer aplicação.

```bash
pnpm storybook        # na raiz; abre em http://localhost:4460
pnpm --filter design-system build
```

O seletor "Tema" na barra superior alterna entre Sistema, Claro e Escuro pelo mesmo `data-theme` usado nas aplicações.
