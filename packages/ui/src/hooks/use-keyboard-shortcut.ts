import { useEffect, useRef } from "react";

export type KeyboardShortcut = {
  /** `event.key`, sem diferenciar maiúscula: `"k"`, `"Enter"`, `"Escape"` */
  key: string;
  /** Ctrl ou Cmd — o atalho funciona igual no Windows e no Mac */
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
};

export type KeyboardShortcutOptions = {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  /** Não dispara com o foco num campo de texto */
  ignoreInputs?: boolean;
  enabled?: boolean;
};

const estaDigitando = (alvo: EventTarget | null): boolean =>
  alvo instanceof HTMLElement &&
  (alvo.tagName === "INPUT" ||
    alvo.tagName === "TEXTAREA" ||
    alvo.isContentEditable);

const combina = (atalho: KeyboardShortcut, evento: KeyboardEvent): boolean =>
  evento.key.toLowerCase() === atalho.key.toLowerCase() &&
  Boolean(atalho.ctrl) === (evento.ctrlKey || evento.metaKey) &&
  Boolean(atalho.alt) === evento.altKey &&
  Boolean(atalho.shift) === evento.shiftKey;

/** Chama `callback` quando o atalho é pressionado. Usa sempre o callback mais recente. */
export function useKeyboardShortcut(
  atalho: KeyboardShortcut,
  callback: (evento: KeyboardEvent) => void,
  {
    preventDefault = false,
    stopPropagation = false,
    ignoreInputs = false,
    enabled = true,
  }: KeyboardShortcutOptions = {}
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const { key, ctrl, alt, shift } = atalho;

  useEffect(() => {
    if (!enabled) return;

    function aoPressionar(evento: KeyboardEvent) {
      if (ignoreInputs && estaDigitando(evento.target)) return;
      if (!combina({ key, ctrl, alt, shift }, evento)) return;
      if (preventDefault) evento.preventDefault();
      if (stopPropagation) evento.stopPropagation();
      callbackRef.current(evento);
    }

    window.addEventListener("keydown", aoPressionar);
    return () => window.removeEventListener("keydown", aoPressionar);
  }, [
    key,
    ctrl,
    alt,
    shift,
    preventDefault,
    stopPropagation,
    ignoreInputs,
    enabled,
  ]);
}
