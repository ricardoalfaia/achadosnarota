import type { Metadata } from "next";

import { DocumentoLegal } from "@/shared/casca/documento-legal";

export const metadata: Metadata = {
  title: "Termos de uso",
  robots: { index: false },
};

/** Termos de uso: o que já está decidido no produto, à espera do texto jurídico. */
export default function Termos() {
  return (
    <DocumentoLegal titulo="Termos de uso">
      <h2>O que o Achados na Rota faz</h2>
      <p>
        Mostra lugares avaliados por curadoria independente e, para quem tem o
        Passaporte, benefícios oferecidos pelos estabelecimentos parceiros.
      </p>
      <h2>Curadoria e benefícios são separados</h2>
      <p>
        Estabelecimentos não pagam por notas, selos ou posição. Cada benefício
        tem regras, limites e validade próprios, mostrados antes do resgate. A
        assinatura não garante economia.
      </p>
      <h2>Assinatura</h2>
      <p>
        As condições de pagamento, renovação, cancelamento e reembolso serão
        apresentadas antes da contratação, quando a assinatura estiver
        disponível.
      </p>
    </DocumentoLegal>
  );
}
