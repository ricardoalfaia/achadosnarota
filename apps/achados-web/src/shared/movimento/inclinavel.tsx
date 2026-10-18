"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

import { useInclinacao } from "./use-inclinacao";

/**
 * Envolve um cartão para ele inclinar e brilhar sob o ponteiro, como um
 * cartão de verdade na mão. O conteúdo não muda; é só apresentação.
 */
export function Inclinavel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { parado, estilo, brilho, aoMover, aoSair } = useInclinacao();
  if (parado) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={estilo}
      onPointerMove={aoMover}
      onPointerLeave={aoSair}
      onPointerCancel={aoSair}
      onPointerUp={aoSair}
    >
      <div className="relative">
        {children}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl mix-blend-overlay"
          style={{ background: brilho }}
        />
      </div>
    </motion.div>
  );
}
