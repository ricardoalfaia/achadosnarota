import type { Metadata } from "next";

import { DocumentoLegal } from "@/shared/casca/documento-legal";

export const metadata: Metadata = {
  title: "Política de privacidade",
  robots: { index: false },
};

/** Política de privacidade: os dados que o app usa hoje, à espera do texto jurídico. */
export default function Privacidade() {
  return (
    <DocumentoLegal titulo="Privacidade">
      <h2>Dados que pedimos</h2>
      <p>
        Para a conta: nome, e-mail e senha (guardada só como resumo
        criptográfico). Não pedimos CPF, telefone nem endereço para criar a
        conta.
      </p>
      <h2>Dados que o app guarda do seu uso</h2>
      <p>
        Os lugares que você salva como favoritos e a situação do seu passaporte.
        Só você vê esses dados; seu histórico não é vendido nem compartilhado.
      </p>
      <h2>Localização</h2>
      <p>O app não usa sua localização.</p>
      <h2>Seus direitos</h2>
      <p>
        O canal para pedir acesso, correção, portabilidade ou exclusão dos seus
        dados será publicado com a versão final desta política.
      </p>
    </DocumentoLegal>
  );
}
