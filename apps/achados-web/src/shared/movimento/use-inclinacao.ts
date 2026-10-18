"use client";

import type { PointerEvent } from "react";
import {
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

const MOLA = { stiffness: 260, damping: 22, mass: 0.6 };

/**
 * A inclinação 3D de um cartão seguindo o ponteiro (mouse ou dedo): a posição
 * relativa vira rotação com mola e move um brilho por cima. Quem pede menos
 * movimento no sistema recebe o cartão parado.
 */
export function useInclinacao(maximoEmGraus = 10) {
  const parado = useReducedMotion() ?? false;
  // Posição do ponteiro no cartão, de 0 a 1 nos dois eixos (0,5 é o centro).
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const molaX = useSpring(x, MOLA);
  const molaY = useSpring(y, MOLA);
  const rotateY = useTransform(molaX, [0, 1], [-maximoEmGraus, maximoEmGraus]);
  const rotateX = useTransform(molaY, [0, 1], [maximoEmGraus, -maximoEmGraus]);
  const brilhoX = useTransform(molaX, [0, 1], ["0%", "100%"]);
  const brilhoY = useTransform(molaY, [0, 1], ["0%", "100%"]);
  const brilho = useMotionTemplate`radial-gradient(circle at ${brilhoX} ${brilhoY}, rgb(255 255 255 / 0.22), transparent 55%)`;

  return {
    parado,
    estilo: { rotateX, rotateY, transformPerspective: 900 },
    brilho,
    aoMover(evento: PointerEvent<HTMLElement>) {
      const caixa = evento.currentTarget.getBoundingClientRect();
      x.set((evento.clientX - caixa.left) / caixa.width);
      y.set((evento.clientY - caixa.top) / caixa.height);
    },
    aoSair() {
      x.set(0.5);
      y.set(0.5);
    },
  };
}
