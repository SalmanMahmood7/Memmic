"use client";

import { Target, Settings2, Megaphone, Landmark } from "lucide-react";
import { EMMIC_STEPS } from "@/data/about";
import Reveal from "./motion/Reveal";
import { RevealGroup, RevealItem } from "./motion/RevealGroup";

const STEP_ICONS = [Target, Settings2, Megaphone, Landmark];

export default function EmmicModel() {
  return (
    <section className="bg-white pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-28">
      <div className="mx-auto max-w-[1440px]">
        <Reveal className="mb-6 flex items-center gap-3 px-5 sm:mb-8 sm:px-8 lg:px-12">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
            3
          </div>
          <div className="rounded-full border border-gray-200 px-3 py-1 text-[12px] font-medium sm:px-4 sm:py-1.5 sm:text-[13px]">
            The EMMIC model
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="mb-6 px-5 text-[clamp(1.5rem,4vw,3.2rem)] font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 sm:px-8 lg:px-12">
            How we operate.
          </h2>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mb-10 max-w-2xl px-5 text-[15px] leading-relaxed text-gray-600 sm:mb-14 sm:px-8 sm:text-[16px] lg:px-12">
            MEMMIC is the Media EMMIC — four disciplines applied to the media &
            creative sector, to one standard.
          </p>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-5 px-5 sm:grid-cols-2 sm:gap-6 sm:px-8 lg:grid-cols-4 lg:px-12">
          {EMMIC_STEPS.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <RevealItem
                key={step.number}
                className="rounded-2xl border border-gray-200 p-6 transition-colors duration-300 hover:border-gray-300 sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <Icon size={28} strokeWidth={1.5} className="text-gray-900" />
                  <p className="text-[13px] font-medium text-gray-400 sm:text-[14px]">
                    {step.number}
                  </p>
                </div>
                <p className="mb-2 mt-5 text-[17px] font-semibold text-gray-900 sm:text-[18px]">
                  {step.title}
                </p>
                <p className="text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
                  {step.description}
                </p>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
