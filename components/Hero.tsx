"use client";

import { useRef } from "react";
import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from "shaders/react";
import { motion, useScroll, useTransform } from "framer-motion";
import RollButton from "./RollButton";
import { EASE } from "./motion/Reveal";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const shaderY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const shaderOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col overflow-hidden bg-[#EFEFEF]"
    >
      <motion.div
        style={{ y: shaderY, opacity: shaderOpacity }}
        className="pointer-events-none absolute inset-0 z-10"
      >
        <Shader className="h-full w-full" style={{ width: "100%", height: "100%" }}>
          <Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} />
          <ChromaFlow
            baseColor="#ffffff"
            downColor="#ff5f03"
            leftColor="#ff5f03"
            rightColor="#ff5f03"
            upColor="#ff5f03"
            momentum={13}
            radius={3.5}
          />
          <FlutedGlass
            aberration={0.61}
            angle={31}
            frequency={8}
            highlight={0.12}
            highlightSoftness={0}
            lightAngle={-90}
            refraction={4}
            shape="rounded"
            softness={1}
            speed={0.15}
          />
          <FilmGrain strength={0.05} />
        </Shader>
      </motion.div>

      <div className="flex-1" />

      <motion.div
        style={{ y: contentY }}
        className="relative z-20 mx-auto w-full max-w-[1440px] px-5 pb-14 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20"
      >
        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
          className="text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:text-[clamp(2.5rem,5vw,4.2rem)]"
        >
          Creative ventures, backed to grow.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          className="mt-5 max-w-xl text-[15px] leading-relaxed text-gray-600 sm:mt-6 sm:text-[16px]"
        >
          MEMMIC is AmanorX Holdings' evaluation, management, marketplace and
          investment company for media and creative across Pakistan.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.38, ease: EASE }}
          className="mt-8 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:items-center sm:gap-5"
        >
          <RollButton
            label="Start a project"
            buttonClassName="bg-[#111827] hover:bg-[#1f2937] text-white text-[13px] sm:text-[14px] font-medium rounded-full pl-5 sm:pl-6 pr-2 py-2 gap-10 sm:gap-14"
            circleClassName="bg-white w-7 h-7 sm:w-8 sm:h-8"
            arrowClassName="text-[#111827]"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
