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
  const words = text.split(" ");

  return (
    <motion.h2
      className={`text-4xl font-semibold text-white/95 ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap">
          {Array.from(word).map((char, charIndex) => (
            <motion.span
              key={`${char}-${wordIndex}-${charIndex}`}
              className="inline-block"
              variants={letter}
            >
              {char}
            </motion.span>
          ))}
          {wordIndex < words.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </motion.h2>
  );
}
