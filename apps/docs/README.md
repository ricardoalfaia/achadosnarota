# Meuproduto Docs

Documentação do Meuproduto para quem usa o sistema (administradores e operadores dos escritórios), em português e inglês. Fumadocs 16 sobre Next.js 16.3.8 e Tailwind 4, com os tokens e as fontes de `@meuproduto/ui`. A decisão está no [ADR-0019](../../docs/adr/0019-documentacao.md).

A documentação técnica (produto, princípios e ADRs) não fica aqui: continua em [docs/](../../docs/) na raiz. Esta documentação descreve só o que já existe no sistema; uma área ainda não pronta aparece como "em construção".

```sh
pnpm dev:docs                 # na raiz; abre em http://localhost:4430
pnpm --filter docs test       # regras de idioma
pnpm --filter docs test:e2e   # depois do build; usa a porta 4431
```

## Escrever uma página

As páginas ficam em `content/docs`, em MDX. O caminho do arquivo é o endereço: `content/docs/modulos/clientes.mdx` vira `/pt-BR/docs/modulos/clientes` e `/en/docs/modulos/clientes`.

```mdx
---
title: Clientes
description: Uma frase que aparece abaixo do título e na busca.
---

Texto da página.
```

- **Tradução:** crie `clientes.en.mdx` ao lado do arquivo em português. Sem ele, o site em inglês mostra a página em português.
- **Nome e ordem no menu:** `meta.json` na pasta (e `meta.en.json` para o inglês), com `title` e, se a ordem importar, `pages`.
- **Links entre páginas:** escreva sem idioma, `/docs/...`, nos dois arquivos. O idioma da página é acrescentado sozinho.
- **Componentes prontos no MDX:** `Cards`, `Card`, `Callout`, tabelas e blocos de código.
- **Exemplos:** use dados fictícios. Nenhum nome, CPF, documento ou captura de tela com dado real de cliente.

## Estrutura

- `content/docs`: o conteúdo.
- `src/app/[lang]`: página inicial e rotas da documentação, por idioma.
- `src/shared/idiomas.ts`: idiomas e regra do prefixo no endereço.
- `src/shared/conteudo.ts`: leitura das páginas.
- `src/shared/layout.tsx`: logotipo (`public/logo-meuproduto.png`), opções do layout e textos do Fumadocs em português.
- `src/shared/provedores.tsx`: tema, busca e troca de idioma.
- `src/shared/mdx.tsx`: componentes disponíveis no MDX e prefixo de idioma nos links.
- `src/shared/modulos.ts`: as áreas do menu lateral mostradas na página inicial.
- `src/shared/textos.ts`: textos da página inicial nos dois idiomas.
- `src/app/global.css`: liga as cores do Fumadocs aos tokens do Meuproduto.
- `src/proxy.ts`: encaminha o endereço ao idioma.

Leia as [instruções do repositório](../../AGENTS.md) e os guias do Next em `node_modules/next/dist/docs/` antes de mudar convenções.
