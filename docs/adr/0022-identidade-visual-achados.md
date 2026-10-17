# ADR-0022 — Identidade visual Achados na Rota no design system

**Estado:** Proposto  
**Data:** 2026-10-17  
**Princípios relacionados:** P04, P10  
**Responsável pela proposta:** Ricardo Alfaia Barbosa  
**Aceitação:** pendente; implementado em `packages/ui` e `apps/design-system`. Substitui a versão anterior deste ADR, escrita para a identidade da base de origem.

## Contexto

O design system veio da base com tokens semânticos, temas claro e escuro e componentes acessíveis ([ADR-0008](0008-design-system.md)), mas com a paleta, a fonte e a escala de outro produto (painel denso, corpo em 13px). A referência visual do Achados na Rota é o protótipo de alta fidelidade (`pwa.html`, `css/styles.css`) e os mockups em [docs/produto/marca](../produto/marca/README.md). O protótipo só desenha o tema claro.

## Decisão proposta

### Tokens

- **Prefixo `--ar-`**; nomes semânticos da base mantidos onde fazem sentido (`background`, `surface`, `foreground`, `primary`, `primary-solid`, `success`...). Tokens do menu lateral e do painel SaaS saíram.
- **Paleta (camada 1):** laranja (`#F15A24` do logotipo), asfalto (`#0A1E2E`), ardósia (neutros do protótipo), âmbar, céu, verde/esmeralda e rosa.
- **Papéis novos:** `brand` (laranja do logotipo, só ícone e elemento gráfico, 3,4:1), `foreground-brand` ("Achados"), `accent` âmbar (curadoria), `star` e `rating` (nota), `seal-*` (selos editoriais sobre foto), `favorite`, `chip`, `passport-*` e as utilidades `bg-brand-gradient`, `text-brand-gradient`, `bg-passport`, `scrollbar-none`.
- **Contraste AA por construção:** texto laranja usa o 700 (`#C2410C`); preenchimento com texto branco usa o 600 (`#D4440F`); selos "Mais querido" e "Verificado" usam céu 700 e verde 700; `foreground-muted` é `#5F6E84`, um pouco mais escuro que o slate-500 do protótipo, para atingir AA também sobre o cinza das abas. Diferença visual pequena em relação ao protótipo, registrada aqui.
- **Tema:** o escuro segue o asfalto da marca e foi aprovado pelo responsável em 17/10/2026 ("ficou muito melhor"). O app abre no claro por padrão (decisão do responsável em 17/10/2026, enquanto o seletor não está em evidência), e a pessoa escolhe claro, escuro ou automático no perfil. A barra de status do celular acompanha o tema do app: laranja no claro, asfalto no escuro.

### Tipografia, forma e movimento

- **Plus Jakarta Sans** variável (200–800), servida pela aplicação (`@fontsource-variable/plus-jakarta-sans`); o 900 do protótipo é desenhado em 800.
- **Escala padrão do Tailwind** com corpo em 16px (campos em 16px evitam o zoom do iOS), mais `text-2xs` (10px).
- **Raios:** campos 12px, cartões 16px, diálogos 24px; **botões em pílula** (`rounded-full`).
- **Animações novas:** `sheet-in` (diálogo do protótipo), `scan` (feixe do leitor), `pop` (coração).

### Componentes

| Componente / mudança        | Papel                                                                   |
| --------------------------- | ----------------------------------------------------------------------- |
| `Etiqueta` (novo)           | Selos sobre foto, especialidade, tags, selo da curadoria                |
| `Nota` (novo)               | Estrela âmbar e nota com vírgula ("4,8"), nome acessível com a escala   |
| `Pilula` + `estiloDaPilula` | Chips de categoria e cidade; estilo puro para links em Server Component |
| `CaixaDeIcone` (novo)       | Ícone no quadrado laranja (cupons, benefícios)                          |
| `Botao`                     | Pílula; variantes novas `suave` e `flutuante` (sobre foto)              |
| `Abas`                      | Variante `segmentos` (filtro de cupons); traço laranja na `linha`       |
| `Dialogo`                   | Variante `cartao` (modal centralizado do app) e `tema` forçado          |
| `Avatar`                    | Tamanho `xl` (perfil)                                                   |
| `useInstalacaoPwa` (hook)   | Pedido de instalação do PWA, sem `setState` em efeito                   |

Os componentes continuam sem domínio: os selos editoriais do app viram `Etiqueta` com um `tom`, mapeado na feature.

## Alternativas consideradas

- **Laranja `#F15A24` em todo texto e botão, como no protótipo:** fiel, mas 3,4:1 com branco, abaixo de AA (docs/produto/05 pede AA).
- **Manter a escala densa da base:** pensada para painel em desktop; o app é mobile.

## Consequências

A troca ficou concentrada em `tokens.css`, `fonts.css` e nos componentes citados. Histórias e testes de contraste foram refeitos neste repositório.

## Verificação de aderência

| Regra                                            | Evidência                                           | Estado                         |
| ------------------------------------------------ | --------------------------------------------------- | ------------------------------ |
| Pares de texto e fundo atingem AA nos dois temas | `tokens.test.ts` (102 verificações, claro e escuro) | Executado                      |
| Componentes passam no axe                        | `pnpm --filter design-system test` (127 testes)     | Executado                      |
| Fonte carrega sem rede externa                   | `.woff2` servido pela aplicação (build do app)      | Executado                      |
| Telas parecidas com o protótipo                  | Capturas 390×844 conferidas com `pwa.html`          | Executado (conferência visual) |

## Pendências e exceções

- Validar a paleta contra a arte final do logotipo ([05 — UI](../produto/05-ui-design-system.md)).
- Textos de exemplo de algumas histórias do Storybook ainda usam o domínio da base (documentos, clientes); trocar por exemplos do Achados.

Nenhuma exceção registrada.

## Referências

- [ADR-0008](0008-design-system.md), [ADR-0025](0025-app-pwa-do-assinante.md)
- [WCAG 2.2: contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
