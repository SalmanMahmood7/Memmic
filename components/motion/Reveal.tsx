"use client";

import { motion, type Transition, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
}

type RevealOwnProps = RevealProps &
  Omit<
    HTMLMotionProps<"div">,
    "children" | "className" | "initial" | "whileInView" | "viewport" | "transition"
  >;

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 32,
  duration = 0.9,
  once = true,
  amount = 0.25,
  ...rest
}: RevealOwnProps) {
  const transition: Transition = { duration, delay, ease: EASE };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={transition}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
