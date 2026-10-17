# Marca

- [`logo.png`](logo.png): símbolo oficial, a letra A com a estrada laranja e o pin de localização.
- [`mockup-pwa.jpeg`](mockup-pwa.jpeg): mockup conceitual do PWA (Explorar, Local, Meu Passaporte).
- [`mockup-pagina.jpeg`](mockup-pagina.jpeg): mockup conceitual da página para desktop.

O protótipo navegável de alta fidelidade fica fora deste repositório, na pasta `achadosnarota-prototipo` ao lado dele (`pwa.html` e `index.html`). Ele é a referência visual das telas; não é fonte de regras de negócio, e os lugares, notas e valores dele são fictícios ([05](../05-ui-design-system.md)).

## Paleta usada no design system

A paleta do protótipo substitui a de referência do documento 05 (petróleo `#006073`, laranja `#FF8A00`), que ainda precisa ser validada contra a arte final.

| Papel                   | Cor       | Uso                                                       |
| ----------------------- | --------- | --------------------------------------------------------- |
| Laranja da Rota         | `#F15A24` | Marca, ícones, item ativo, degradê do botão central       |
| Asfalto (azul noturno)  | `#0A1E2E` | "Achados" do logotipo, títulos fortes, cartão do passaporte |
| Âmbar                   | `#F59E0B` | Estrelas, coroa da curadoria                              |
| Fundo                   | `#F8FAFC` | Fundo das telas                                           |

Os tons que levam texto branco ou viram texto sobre branco foram escurecidos para atingir contraste AA; o mapeamento está em `packages/ui/src/styles/tokens.css` e no [ADR-0022](../../adr/0022-identidade-visual-achados.md).

**Tipografia:** Plus Jakarta Sans, servida pela aplicação.
