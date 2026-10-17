# ADR-0008 — Tailwind, tokens e design system acessível

**Estado:** Proposto  
**Data:** 2026-10-16  
**Princípio:** P10  
**Aceitação:** pendente. Tailwind é a stack escolhida pelo responsável.

## Contexto

As aplicações do Meuproduto precisam de consistência visual e componentes reutilizáveis, sem estilos globais que se acumulam por tela. A identidade visual do produto está no [ADR-0022](0022-identidade-visual-meuproduto.md). Composição visual também precisa preservar interação por teclado, foco e semântica.

## Decisão proposta

Usar Tailwind no novo código e tokens semânticos como contrato visual compartilhado. Cores de ação, superfície, texto, borda e feedback têm significado; temas mudam valores, preservando a intenção. Espaçamento, tipografia e demais valores recorrentes pertencem ao sistema de tokens quando houver padrão útil.

Primitivas genéricas cuidam de apresentação e interação acessível: botão, campo, dialog, menu e similares. Padrões compostos agrupam primitivas com uma responsabilidade visual estável. Componentes de negócio permanecem em seus módulos, com nome e tipos de domínio. Um pacote específico de domínio pode ser compartilhado; ele não se disfarça de UI genérica.

| Nível                 | Exemplo                                   | Conhecimento permitido                                       |
| --------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| Token                 | Cor semântica de ação/destruição          | Nenhum domínio de negócio.                                   |
| Primitiva             | Button, Input, Dialog                     | HTML, acessibilidade, variantes visuais e interação própria. |
| Padrão composto       | Cabeçalho de seção, moldura de painel     | Composição de primitivas e contratos visuais genéricos.      |
| Componente de domínio | Resumo de cliente, estado de uma operação | Tipos e semântica da capacidade dona.                        |
| Região de dados       | Listagem com filtros e editor             | Coordenador de dados da funcionalidade.                      |

A estrutura inicial usa `packages/ui`, conforme ADR-0011; a biblioteca de novas primitivas acessíveis será avaliada com consumidores reais. Select e SeletorDePeriodo vieram da base e foram preservados por escolha explícita do responsável. Não implementar controles complexos do zero apenas para evitar uma dependência, nem adotar um catálogo inteiro sem necessidade.

### Contratos dos componentes

- Variantes explícitas e tipadas; não usar dezenas de flags independentes.
- Um modo de controle definido para cada estado, com contratos controlled/uncontrolled quando úteis. Não proibir inputs controlados de forma geral.
- `className`/slots estilísticos com comportamento documentado, incluindo como conflitos são resolvidos.
- Classes Tailwind detectáveis no build. Variantes mapeiam para classes completas; não montar nomes dinâmicos como `bg-${color}-500` esperando detecção automática.
- Configurar a descoberta das classes nas fontes dos pacotes compartilhados conforme a versão do Tailwind e o workspace escolhido.
- Sem fetch, token de acesso, store global de domínio ou import de aplicação em uma primitiva.
- Preservar nome acessível, label, semântica, foco, teclado e retorno de foco em overlays. Composição não pode quebrar esses contratos.

A detecção de classes e de fontes compartilhadas depende da configuração do build e da versão escolhida. [Referência: detecção de classes no Tailwind](https://tailwindcss.com/docs/detecting-classes-in-source-files).

O pacote exporta os tokens por `@meuproduto/ui/styles/tokens.css` e o app declara as fontes de UI/DataBoundary no seu CSS com `@source`. Build, contraste e troca de tema com a paleta Meuproduto são verificações pendentes neste repositório. A aparência de cada campo nos dois temas e sua interação completa ainda precisam de verificação no consumidor.

Formulários são compostos por partes claras, com parsing/validação na fronteira e erros de campo tratados junto ao input. Usar formulário nativo com Actions quando suficiente; considerar biblioteca de formulário para edição complexa. Não adotar mutação manual do DOM como regra universal de máscara. Máscara, valor normalizado, registro do campo e submissão devem ter contrato testado.

Campos compostos definem também valor confirmado versus rascunho, reset nativo/Action, pending, disabled e required. Um controle visual bloqueado não deve continuar submetendo seu hidden input quando o contrato for o de campo desabilitado. Estado interno de um campo composto precisa acompanhar o reset previsto; o reset do formulário não reinicializa automaticamente todo estado React.

Os campos herdados já oferecem composição útil, mas precisam completar esses contratos, foco ao abrir o calendário e marcação do label. A origem deles está em [origem da base](../origem-da-base.md). A presença de roles/aria não substitui teste de teclado e foco.

### Tokens e temas

[tokens.css](../../packages/ui/src/styles/tokens.css) é a única fonte de cores, sombras e famílias de fonte. Os nomes semânticos vieram da base; os valores passam a ser os da identidade Meuproduto ([ADR-0022](0022-identidade-visual-meuproduto.md)). Trocar a paleta não muda nenhum nome usado pelos componentes. Não há `tailwind.config.js`: no Tailwind v4 o tema é CSS.

| Camada    | Exemplo                                              | Quem usa                   |
| --------- | ---------------------------------------------------- | -------------------------- |
| Paleta    | Tons da marca (azul-escuro, verde-água, azul, roxo)  | Somente a camada semântica |
| Semântica | `--pl-surface`, `--pl-primary`, `--pl-danger-subtle` | O `@theme`                 |
| Classes   | `bg-surface`, `text-primary`, `border-danger`        | Componentes                |

- **Um valor por tema na mesma linha:** cada token semântico usa `light-dark(claro, escuro)`. O tema segue o sistema operacional; `data-theme="light"` ou `data-theme="dark"` em qualquer elemento força um deles. O build do Next converte `light-dark()` para navegadores que não o suportam.
- **Paleta fechada:** `--color-*: initial` remove as cores padrão do Tailwind. `bg-zinc-200` ou `text-red-600` não geram CSS; um tom novo entra como token.
- **Marca em dois papéis:** `primary` é texto, ícone e contorno; `primary-solid` (com `-hover`, `-foreground` e `-border`) é preenchimento. A regra herdada para o tema escuro (preenchimento translúcido em vez de sólido) precisa ser revista com a paleta nova; ver [ADR-0022](0022-identidade-visual-meuproduto.md).
- **Feedback em três partes:** `success`, `warning`, `danger` e `info` têm cor de texto, fundo `-subtle` e `-border`.
- **Tons translúcidos** usam `color-mix()` sobre a paleta, e modificadores como `bg-primary-subtle/50` funcionam com qualquer token.
- **`dark:`** segue a mesma regra dos tokens e fica reservado ao que não é cor.

Todo par de texto e fundo precisa atingir contraste AA nos dois temas; `tokens.test.ts` é a barreira. Com a paleta nova, os pares precisam ser recalculados: verde-água (`#00C2A8`) e azul (`#3B82F6`) sobre branco ficam abaixo de 4,5:1 e servem a preenchimento, ícone ou texto grande, não a texto pequeno. `foreground-subtle` fica restrito a texto grande ou decorativo.

**Fontes:** Inter (`font-sans`), a da marca, e JetBrains Mono (`font-mono`), em versão variável. [fonts.css](../../packages/ui/src/styles/fonts.css) as importa dos pacotes `@fontsource-variable`, e cada aplicação importa esse arquivo junto de `tokens.css`. Os arquivos são servidos pela própria aplicação: o build não acessa rede e o navegador não chama CDN externo. A alternativa `next/font` otimiza pré-carregamento e métrica da fonte reserva, mas só existe no Next e baixa do Google no build; a vitrine em Vite ficaria com outro mecanismo. Itálicos não foram incluídos.

**Escala tipográfica:** densa, herdada da base. `text-base` é o corpo e vale 13px; o `body` já o aplica. A escala vai de `text-2xs` (10px) a `text-4xl` (28px) e substitui a do Tailwind: os nomes são os mesmos, os valores são menores (`text-sm` vale 12px, não 14px). Tamanhos acima de `4xl` não existem. `text-2xs` fica restrito a selos e etiquetas em maiúsculas. O mockup Meuproduto tem títulos maiores e corpo mais arejado; manter ou mudar a escala é decisão aberta do [ADR-0022](0022-identidade-visual-meuproduto.md).

**Raios por papel:** `rounded-control` (8px, campos e botões), `rounded-card` (12px, cards e painéis) e `rounded-overlay` (16px, menus, popovers e modais). A escala numérica do Tailwind continua disponível para casos pontuais.

O fundo, a cor, a fonte e o tamanho do corpo são aplicados ao `body` pelo próprio `tokens.css`, para todas as aplicações partirem da mesma base.

Fora desta etapa: pré-carregamento das fontes e espaçamento entre letras dos rótulos. As sombras do tema escuro usam a geometria do tema claro com cores próprias, porque `light-dark()` só alterna cores.

### Botões

`Botao` tem três variantes, cada uma com um papel, e duas intenções:

| Variante   | Papel                              | Aparência                                                                         |
| ---------- | ---------------------------------- | --------------------------------------------------------------------------------- |
| `solido`   | A ação principal, uma por contexto | Degradê de ação da marca (`bg-brand-gradient-action`); sobe 1px ao passar o mouse |
| `contorno` | Ações secundárias                  | Fundo da superfície com borda                                                     |
| `fantasma` | Ações de apoio                     | Só texto; ganha fundo ao passar o mouse                                           |

- `intencao="perigo"` existe nas três variantes para ações destrutivas.
- Tamanhos `xs` (28px), `sm` (36px, o padrão), `md` (44px) e `lg` (56px), pelos mesmos tokens `control-*` dos campos, para ficarem alinhados na mesma linha.
- `icone` e `iconeFinal` acompanham o tamanho do texto. `BotaoDeIcone` é o botão quadrado só com ícone e exige `rotulo`, que vira o nome acessível.
- `carregando` mostra o indicador de progresso, bloqueia novos cliques e marca `aria-busy`.
- O comportamento do sólido no tema escuro segue o [ADR-0022](0022-identidade-visual-meuproduto.md). O perigo sólido tem a mesma estrutura com os tokens `danger-*`.
- `estiloDoBotao()` devolve as classes, para um link ter a aparência de botão. Em Server Component ela vem de `@meuproduto/ui/estilos`, um ponto de entrada puro: o ponto de entrada principal do pacote é cliente, e uma função dele não pode ser chamada no servidor.
- Variantes são mapas tipados (`Record`), sem biblioteca de variantes.

`BotaoDeMenu` abre um menu de ações no padrão WAI-ARIA de menu button, com `ItemDeMenu` e `SeparadorDeMenu`. Enter, espaço ou seta abrem; setas, Home e End percorrem os itens habilitados; Esc fecha e devolve o foco. Com `somenteIcone` vira o botão de ações de uma linha de tabela.

O pacote exporta um conjunto pequeno de ícones de ação (`IconeMais`, `IconeBaixar`, `IconeLixeira` e outros), desenhados no mesmo traço. Ícones próprios de uma tela entram conforme a necessidade real. Os tokens próprios do menu lateral (`--pl-sidebar-*`) estão no [ADR-0018](0018-casca-do-sistema.md).

### Conjunto inicial de componentes

Com os campos, botões, abas e checkbox, estes fecham o conjunto mínimo para começar as telas. Daqui em diante, componente novo entra sob demanda de uma tela real.

| Componente                         | Decisão de implementação                                                                                                                                                                                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CampoDeTexto`                     | Mesma moldura e mesmos tamanhos dos demais campos. `prefixo` e `sufixo` cobrem os grupos de entrada: unidade, ícone ou botão no fim                                                                                                                                                                   |
| `GrupoDeBotoes`                    | Une `Botao`, `BotaoDeIcone` e `BotaoDeMenu` em um bloco; botão seguido de menu só com a seta forma o botão dividido                                                                                                                                                                                   |
| `Cartao`                           | Partes explícitas: `CabecalhoDoCartao`, `CorpoDoCartao` e `RodapeDoCartao`. Sem `"use client"`, serve em Server Component                                                                                                                                                                             |
| `Alerta`                           | Quatro intenções. Erro e atenção usam `role="alert"`; informação e sucesso, `role="status"`                                                                                                                                                                                                           |
| `Dialogo` e `DialogoDeConfirmacao` | `<dialog>` nativo com `showModal()`: o navegador prende o foco e bloqueia o fundo. O foco volta para quem abriu; na confirmação, começa em Cancelar. A variante `destaque` tem cabeçalho no degradê da marca com ícone, para janelas de produto; `xl` é a largura dessas janelas; o fundo é desfocado |
| `Acordeao`                         | Tipos `unico` e `multiplo`. A altura anima pela linha da grade (`0fr` a `1fr`); fechado, o conteúdo fica `inert`                                                                                                                                                                                      |
| `Esqueleto`                        | Bloco decorativo dimensionado por `className`; `EsqueletoDeTexto` anuncia o carregamento                                                                                                                                                                                                              |
| `Selo`                             | Etiqueta pequena em maiúsculas: `ok` (ATUALIZADO, PRINCIPAL) e `novo` (NOVO, VERSÃO ATUAL). Serve em Server Component                                                                                                                                                                                 |
| `Dica`                             | Aparece com atraso no mouse e na hora no foco; Esc esconde. Liga-se ao controle por `aria-describedby`                                                                                                                                                                                                |

Os componentes que a identidade Meuproduto pede (`Avatar`, `CampoDeBusca`, `CartaoDeIndicador`, `CartaoDeAcao`, `CartaoDeModelo`, `Destaque`, `EstadoVazio`, `ZonaDeArquivo` e `Etapas`) estão registrados no [ADR-0022](0022-identidade-visual-meuproduto.md).

`DialogoDeExclusao` é a exclusão em duas confirmações, para o que não pode ser desfeito:

1. A primeira caixa explica as consequências e pede a frase digitada (`confirmo a exclusão`). Colar e arrastar texto não valem; maiúsculas, acentos e espaços sobrando são tolerados, o resto precisa ser igual (`fraseConfere`, testada à parte).
2. A segunda caixa pede o Excluir final, que fica bloqueado por alguns segundos (`espera`, padrão 3) para um clique duplo não atravessar as duas etapas. O foco vai para Voltar.

Cancelar, Esc ou clique fora em qualquer ponto não excluem nada, e reabrir recomeça da primeira etapa. `aoExcluir` só é chamado depois das duas confirmações; durante `carregando` a caixa não fecha, e uma falha (`erro`) aparece na segunda caixa para tentar de novo. É uma proteção de interface: a autorização da exclusão continua sendo do servidor.

Limites conhecidos:

- A `Dica` e as caixas suspensas são posicionadas dentro do próprio contêiner, sem portal: um ancestral com `overflow: hidden` ou com rolagem pode cortá-las. O corpo do `Dialogo` rola por padrão; um formulário curto com `Select` dentro dele usa `semRolagem`. Posicionamento por âncora do CSS fica para quando o suporte dos navegadores permitir.
- O `CampoDeTexto` não aplica máscara nem formata moeda; o ADR pede contrato testado para máscara, e isso entra com o primeiro formulário real.
- Não há área de texto de várias linhas, rádio isolado nem interruptor.

### Cadastros: grade, transição e formulário em abas

O cadastro (listagem e formulário) é um conjunto de partes em `components/Cadastro`, no nível "padrão composto" da tabela acima: cada parte tem uma responsabilidade visual estável e a tela as compõe no JSX, sem um motor genérico de cadastros ([ADR-0003](0003-componentes-explicitos.md)).

| Parte                                                                                    | Papel                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GradeDeCadastro`                                                                        | A moldura: `barra` em cima, corpo que rola (a `Tabela`), `rodape` embaixo                                                                                                                                                               |
| `BarraDaGrade`, `BuscaDaGrade`, `ChipsDeFiltro`/`ChipDeFiltro`, `AcoesDaGrade`           | A barra: busca, chips de estado (`aria-pressed`) e ações; o chip ativo usa os tokens `primary-solid`                                                                                                                                    |
| `RodapeDaGrade`                                                                          | "Mostrando 1 a 6 de 6", a página e as setas; textos vêm de quem usa, para traduzir                                                                                                                                                      |
| `TextoDaLinha`, `SeloDeStatus`, `BotaoDeAcaoDaLinha`                                     | O conteúdo das células: nome com complemento, chip de estado por intenção, botão de 30px                                                                                                                                                |
| `Visoes`                                                                                 | A transição listagem ↔ formulário: a lista desliza 15% para a esquerda e some, o formulário entra pela direita (320ms/250ms, `ease-smooth`). As duas ficam montadas e a de trás fica `inert`, para busca e campos digitados continuarem |
| `BarraDoFormulario`, `CorpoDoFormulario`, `GradeDeCampos`, `RodapeDoFormulario`, `Tecla` | O formulário: voltar à listagem e título, corpo que rola, duas colunas de campos, rodapé fixo com dica (`Ctrl + S`) e ações                                                                                                             |

A `Tabela` ganhou o que a listagem precisa: `aoAbrirLinha` (clique ou Enter na linha abre o registro; cliques em controles da linha não contam), `alturaDaLinha` (64px para nome com complemento; o padrão continua 32) e `semRodape` (quando a grade já tem o seu). As `Abas` têm a variante `formulario`: sobre a faixa neutra, a ativa fica destacada com a linha da marca embaixo e o painel entra descendo (`fade-in-down`, 250ms).

O interruptor "Status do Registro" não existe ainda (a história mostra um `SeloDeStatus`). Quando o cadastro abrir em modal, o cabeçalho é o `Dialogo` em variante `destaque`; em página, o título da tela cumpre o papel. O uso nas telas do Meuproduto está no [ADR-0021](0021-paginas-de-cadastro.md).

### Escolha de tema pelo usuário

`SeletorDeTema`, em `@meuproduto/ui`, oferece Claro, Escuro e Auto no menu do usuário. Ele só apresenta e avisa a escolha; guardar e aplicar é da aplicação.

No `meuproduto-web`, a preferência fica no cookie `meuproduto-tema`. O layout raiz o lê no servidor e escreve `data-theme` no `<html>`, de modo que a página já chega no tema escolhido, sem piscar no tema errado. Na troca, o `PreferenciasProvider` grava o cookie e aplica o atributo na hora. Em Auto não há atributo e o sistema operacional decide. O tema é uma das preferências do usuário, descritas no [ADR-0017](0017-idiomas-e-preferencias.md).

- Ler cookie no layout raiz torna todas as rotas dinâmicas (renderizadas a cada requisição). Para um sistema autenticado isso já seria assim.
- A alternativa de um script embutido no `<head>` manteria páginas estáticas, mas exige liberar script inline na política de segurança de conteúdo.
- O cookie é legível pelo navegador de propósito: é preferência visual, sem dado sensível.
- O seletor fica no menu do usuário da casca ([ADR-0018](0018-casca-do-sistema.md)), ao lado do `SeletorDeIdioma`, que segue o mesmo desenho (grupo de rádios com indicador deslizante) e acrescenta o selo com o código do idioma e o estado `ocupado` enquanto a tela é refeita no idioma novo.

### Tamanho dos campos

Select, SeletorDeData e SeletorDePeriodo aceitam `tamanho`: `sm` (36px), `md` (44px) e `lg` (56px, o padrão). As alturas são tokens (`h-control-sm`, `h-control-md`, `h-control-lg`) para que botões e outros controles se alinhem aos campos. Em `lg` o label flutua dentro da caixa, acima do valor; em `sm` e `md` não há altura para duas linhas e o label flutua sobre a borda superior. O `CampoSkeleton` recebe o mesmo `tamanho`, para a tela não pular. O `cn()` declara ao tailwind-merge os tokens de altura e de raio; token novo de espaçamento ou de raio precisa entrar lá.

Variantes são mapas tipados de valor para classes, combinados com `cn()`. Uma biblioteca de variantes (`cva`) foi avaliada e adiada: só compensa quando vários componentes tiverem variantes combinadas.

### Movimento

Abrir, fechar e trocar conteúdo são animados. Os tokens ficam em `tokens.css`: a curva `ease-smooth` (`cubic-bezier(0.16, 1, 0.3, 1)`) e três animações, `animate-popover-in`, `animate-popover-out` e `animate-panel-in`. Durações são curtas (140 a 300ms) para não atrasar quem opera o sistema o dia inteiro.

- A `CaixaSuspensa` anima a entrada e a saída. Para a saída existir, o campo usa o hook interno `usePresenca`, que mantém o painel montado e inerte durante os 140ms da animação.
- Com `prefers-reduced-motion`, uma regra global reduz animações e transições a quase zero.
- Animação nova entra como token; componentes não declaram `@keyframes` próprios.

### Checkbox e Abas

`Checkbox` é o `<input type="checkbox">` nativo com a aparência do design system: teclado, foco, envio em formulário e leitor de tela vêm do navegador. Aceita modo controlado (`marcado`) ou interno (`marcadoInicial`), `indeterminado`, `descricao` e `erro`.

`Abas` segue o padrão WAI-ARIA de tabs com composição explícita: `Abas`, `ListaDeAbas`, `Aba` e `PainelDaAba`. Setas, Home e End trocam de aba pulando as desabilitadas, e a seleção acompanha o foco. Há duas variantes: `linha`, para abas de página e de formulário, e `pilula`, para alternância compacta de visão. Um indicador desliza até a aba ativa. A regra de navegação por teclado é a função pura `abaDestino`, testada à parte.

No escuro, a aba e o checkbox ativos seguem a regra de preenchimento da marca do [ADR-0022](0022-identidade-visual-meuproduto.md).

### Vitrine

[apps/design-system](../../apps/design-system/README.md) é um Storybook (React com Vite) que consome o contrato público de `@meuproduto/ui`, como qualquer aplicação; `packages/ui` não depende do Storybook. Há uma página de tokens e histórias dos estados de Select, SeletorDeData e SeletorDePeriodo, com um seletor de tema que usa o mesmo `data-theme` das aplicações.

Cada história também é um teste: `pnpm test` as renderiza em Chromium e reprova erro de renderização ou violação de acessibilidade do axe. A vitrine é ferramenta de desenvolvimento, não uma aplicação de produto; por isso não segue a diretriz de Next.js das novas aplicações.

### Evolução

O design system cresce com funcionalidades reais. Começar pelos componentes necessários à funcionalidade de referência; registrar seus estados e exemplos de uso. A vitrine ([apps/design-system](../../apps/design-system/README.md)) já existe, sem obrigar um catálogo completo antes da primeira entrega.

Novos estilos usam Tailwind e tokens. CSS específico de uma integração (por exemplo, o tema do Fumadocs no app de documentação) pode existir com escopo claro e justificativa.

## Alternativas consideradas

- CSS global compartilhado por todos os apps: simples no início, cria colisões e acoplamento.
- Copiar componentes sem contrato comum: acelera uma tela, mas causa divergência permanente.
- Construir um design system completo antecipadamente: consome tempo e cria APIs sem evidência de uso.

## Consequências

Temas e padrões visuais ganham consistência. Há custo de manutenção de contratos acessíveis e de configuração do build. Consumidores sem UI React podem compartilhar tokens e semântica, sem compartilhar componentes.

## Verificação de aderência

| Regra                                               | Evidência                                                                                        | Estado                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------- |
| Primitivas independentes do domínio                 | Imports restritos e testes com props                                                             | Planejado                         |
| Classes dos pacotes chegam ao CSS                   | Build e página consumidora em navegador real                                                     | Pendente neste repositório        |
| Interação acessível                                 | Testes de teclado, foco e labels; revisão das interações críticas                                | Planejado                         |
| Variantes e temas consistentes                      | Exemplos de estados e verificação visual pertinente                                              | Planejado                         |
| Pares de texto e fundo atingem contraste AA         | `tokens.test.ts` com a paleta Meuproduto, nos dois temas                                         | Pendente neste repositório        |
| Tema segue o sistema e pode ser forçado             | Cores computadas da página inicial em Chromium                                                   | Pendente neste repositório        |
| Escolha de tema persiste e vem pronta do servidor   | E2E `preferencias.spec.ts`: troca, recarrega e confere o HTML recebido                           | Pendente neste repositório        |
| Componentes usam só tokens                          | Build sem classes da paleta padrão; `git grep` sem `zinc`, `red`, `slate`                        | Pendente; regra de lint planejada |
| Estados dos componentes renderizam e passam no axe  | `pnpm --filter design-system test`: histórias em Chromium                                        | Pendente neste repositório        |
| Alturas dos campos seguem os tokens                 | História `Tamanhos` do Select mede 36, 44 e 56px em Chromium                                     | Pendente neste repositório        |
| Teclado das abas, checkbox, menu de ações e diálogo | Histórias com interação                                                                          | Pendente neste repositório        |
| Exclusão exige frase digitada e segunda confirmação | História `De exclusão`: colar é recusado, frase quase certa não libera, Excluir começa bloqueado | Pendente neste repositório        |
| Fontes carregam sem rede externa                    | Chromium: `document.fonts` e respostas 200 dos `.woff2` locais, no app e na vitrine              | Pendente neste repositório        |
| Escala tipográfica aplicada                         | História `Escala` mede os tamanhos e o corpo em Chromium                                         | Pendente neste repositório        |

As histórias e testes acima vieram da base junto com os componentes. Resultados obtidos lá não valem como evidência aqui, porque a paleta, a fonte e parte dos componentes mudaram.

Relacionados: [composição explícita](0003-componentes-explicitos.md) e [testes](0009-testes.md).
