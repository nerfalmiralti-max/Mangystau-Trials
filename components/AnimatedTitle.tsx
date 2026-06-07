"use client";

import { motion, type Variants } from "framer-motion";

type AnimatedTitleProps = {
  text: string;
  className?: string;
};

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08,
    },
  },
};

const letter: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function AnimatedTitle({
  text,
  className = "",
}: AnimatedTitleProps) {
  return (
    <motion.h2
      className={`text-4xl font-semibold tracking-tight text-white/95 ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {Array.from(text).map((char, index) => (
        <motion.span key={`${char}-${index}`} className="inline-block" variants={letter}>
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h2>
  );
}
