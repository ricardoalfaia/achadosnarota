import { useMemo, useRef } from "react";

/** Um objeto de funções quaisquer; os tipos concretos vêm de quem chama. */
type Funcoes = Record<string, (...args: never[]) => unknown>;

/**
 * Devolve sempre o mesmo objeto, cujas funções chamam a versão mais recente das
 * recebidas. Serve para entregar ações a componentes com `memo` sem redesenhá-los
 * a cada mudança de estado de quem as define.
 *
 * `useEffectEvent` resolve o mesmo problema dentro de efeitos, mas não pode ser
 * passado a outro componente nem chamado em um evento de clique.
 */
export function useFuncoesEstaveis<F extends Funcoes>(funcoes: F): F {
  const atuais = useRef(funcoes);
  atuais.current = funcoes;

  return useMemo(() => {
    const estaveis: Funcoes = {};
    for (const nome of Object.keys(atuais.current)) {
      estaveis[nome] = (...args) => atuais.current[nome]?.(...args);
    }
    return estaveis as F;
  }, []);
}
