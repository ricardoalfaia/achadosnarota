// Valida as variáveis do servidor na subida, antes da primeira requisição.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ambienteServidor } =
      await import("@/shared/config/ambiente.servidor");
    ambienteServidor();
  }
}
