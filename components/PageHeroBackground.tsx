"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function PageHeroBackground({ image }: { image: string }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 160]);
  const scrollOpacity = useTransform(scrollY, [0, 500], [0.35, 0.12]);

  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-0 grayscale"
        style={{
          y,
          opacity: scrollOpacity,
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          maskImage: "linear-gradient(to left, black 20%, transparent 65%)",
          WebkitMaskImage:
            "linear-gradient(to left, black 20%, transparent 65%)",
        }}
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40"
        aria-hidden="true"
      />
    </>
  );
}
