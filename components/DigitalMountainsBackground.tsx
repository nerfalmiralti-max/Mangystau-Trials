"use client";

import { useEffect, useMemo } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const particleConfig = Array.from({ length: 16 }, (_, index) => ({
  size: 1 + (index % 3) * 0.5,
  opacity: 0.18 + (index % 4) * 0.08,
  left: `${(index * 6 + 8) % 100}%`,
  top: `${12 + (index * 5) % 70}%`,
  delay: index * 0.12,
}));

export default function DigitalMountainsBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const y = useSpring(mouseY, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      const halfX = window.innerWidth / 2;
      const halfY = window.innerHeight / 2;
      mouseX.set(((event.clientX - halfX) / halfX) * 18);
      mouseY.set(((event.clientY - halfY) / halfY) * 18);
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [mouseX, mouseY]);

  const gridStyle = {
    backgroundImage:
      "radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.12), transparent 18%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1), transparent 16%), linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
    backgroundSize: "180px 180px, 180px 180px, 40px 40px, 40px 40px",
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        style={{ x, y }}
        className="absolute inset-0"
        transition={{ type: "spring", stiffness: 80, damping: 24 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.16),transparent_26%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.06),transparent_24%)]" />
        <div className="absolute inset-0 opacity-70" style={gridStyle} />

        <div className="absolute left-1/2 top-[12%] h-[160px] w-[1200px] -translate-x-1/2 opacity-50">
          <svg viewBox="0 0 1200 160" className="h-full w-full stroke-current text-slate-200/20">
            <path
              d="M0 120L90 88L170 104L250 60L330 106L410 78L490 122L570 84L650 112L730 76L810 95L890 58L970 96L1050 80L1130 102L1200 64"
              fill="none"
              strokeWidth="2"
            />
            <path
              d="M0 140L80 108L150 126L230 84L310 124L380 96L460 138L530 94L610 122L690 86L770 110L840 74L920 108L990 92L1060 116L1140 90L1200 106"
              fill="none"
              strokeWidth="1.2"
              opacity="0.6"
            />
          </svg>
        </div>

        {particleConfig.map((particle, index) => (
          <div
            key={index}
            className="hero-particle absolute"
            style={{
              width: `${particle.size + 2}px`,
              height: `${particle.size + 2}px`,
              left: particle.left,
              top: particle.top,
              opacity: particle.opacity,
              animation: `pulse 4s ease-in-out ${particle.delay}s infinite`,
            }}
          />
        ))}

        <div className="absolute left-8 top-24 h-px w-52 rounded-full bg-gradient-to-r from-[#6366f1]/60 to-transparent blur-sm opacity-80" />
        <div className="absolute right-16 top-36 h-px w-64 rounded-full bg-gradient-to-r from-transparent via-[#38bdf8]/50 to-transparent blur-sm opacity-80" />
        <div className="absolute left-10 bottom-28 h-px w-40 rounded-full bg-gradient-to-r from-[#8b5cf6]/55 to-transparent blur-sm opacity-70" />
      </motion.div>
    </div>
  );
}
