"use client";

import { useRef } from "react";
import { ShieldCheck, Wand2, ClipboardCheck } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { VALUES } from "@/data/about";
import RollButton from "./RollButton";
import Reveal from "./motion/Reveal";
import { RevealGroup, RevealItem } from "./motion/RevealGroup";

const VALUE_ICONS = [ShieldCheck, Wand2, ClipboardCheck];

const BACKGROUND_IMAGE = "/images/about-work-large.webp";

export default function Values() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#F5F5F5] pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-28"
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 -top-[10%] -bottom-[10%] grayscale"
        style={{
          y: bgY,
          backgroundImage: `url(${BACKGROUND_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
          maskImage:
            "linear-gradient(to left, black 20%, transparent 65%)",
          WebkitMaskImage:
            "linear-gradient(to left, black 20%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#F5F5F5] via-transparent to-[#F5F5F5]/40"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1440px]">
        <Reveal className="mb-6 flex items-center gap-3 px-5 sm:mb-8 sm:px-8 lg:px-12">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
            4
          </div>
          <div className="rounded-full border border-gray-300 px-3 py-1 text-[12px] font-medium sm:px-4 sm:py-1.5 sm:text-[13px]">
            Creativity with conviction
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="mb-6 px-5 text-[clamp(1.5rem,4vw,3.2rem)] font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 sm:px-8 lg:px-12">
            What we stand for.
          </h2>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mb-10 max-w-2xl px-5 text-[15px] leading-relaxed text-gray-600 sm:mb-14 sm:px-8 sm:text-[16px] lg:px-12">
            Modern digital craft, made with integrity. The differentiator
            isn't louder work — it's work you can stand behind.
          </p>
        </Reveal>

        <RevealGroup className="mb-10 grid grid-cols-1 gap-5 px-5 sm:mb-14 sm:grid-cols-3 sm:gap-6 sm:px-8 lg:px-12">
          {VALUES.map((value, i) => {
            const Icon = VALUE_ICONS[i];
            return (
              <RevealItem
                key={value.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition-colors duration-300 hover:border-gray-300 sm:p-7"
              >
                <Icon size={28} strokeWidth={1.5} className="text-gray-900" />
                <p className="mb-2 mt-5 text-[17px] font-semibold text-gray-900 sm:text-[18px]">
                  {value.title}
                </p>
                <p className="text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
                  {value.description}
                </p>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal delay={0.1} className="px-5 sm:px-8 lg:px-12">
          <RollButton
            to="/about"
            label="Read more about us"
            buttonClassName="bg-[#111827] hover:bg-[#1f2937] text-white text-[13px] sm:text-[14px] font-medium rounded-full pl-5 sm:pl-6 pr-2 py-2 gap-10 sm:gap-14"
            circleClassName="bg-white w-7 h-7 sm:w-8 sm:h-8"
            arrowClassName="text-[#111827]"
          />
        </Reveal>
      </div>
    </section>
  );
}
