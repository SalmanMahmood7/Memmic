import {
  Boxes,
  Sparkles,
  Clapperboard,
  Code2,
  TrendingUp,
} from "lucide-react";
import { EMMIC_STEPS } from "../data/about";
import { PAGE_HERO_IMAGES } from "../data/images";
import PageHeroBackground from "./PageHeroBackground";

const CAPABILITIES = [
  {
    icon: Boxes,
    title: "Immersive / 3D / AR-VR",
    description:
      "Spatial experiences, real-time 3D and virtual environments that put audiences inside the work.",
  },
  {
    icon: Sparkles,
    title: "AI content & prompting",
    description:
      "Generative content and prompt engineering used with judgement — speed without losing the human hand.",
  },
  {
    icon: Clapperboard,
    title: "Production",
    description:
      "Film, podcast and photography — end-to-end production with a director's eye and an editor's discipline.",
  },
  {
    icon: Code2,
    title: "Web & app development",
    description:
      "Sites, apps and platforms engineered to ship — performance, accessibility and craft as defaults.",
  },
  {
    icon: TrendingUp,
    title: "Social & growth",
    description:
      "Channels, community and campaigns that compound — built on attention earned, not bought cheaply.",
  },
];

export default function WhatWeDoPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32">
        <PageHeroBackground image={PAGE_HERO_IMAGES.whatWeDo} />
        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <p className="mb-5 text-[13px] tracking-wide text-gray-500 sm:mb-8 sm:text-[14px]">
            What we do
          </p>

          <h1 className="max-w-3xl text-[clamp(1.75rem,6vw,3.6rem)] font-medium leading-[1.1] tracking-[-0.03em] text-gray-900">
            Four disciplines, one standard.
          </h1>

          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:text-[16px]">
            MEMMIC is the Media EMMIC — evaluation, management, marketplace
            and investment applied to the media & creative sector, so the
            studios
            and products we back grow with craft and discipline.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-100 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 lg:gap-10">
            {EMMIC_STEPS.map((step) => (
              <div key={step.number}>
                <p className="mb-3 text-[13px] font-medium text-gray-400 sm:text-[14px]">
                  {step.number}
                </p>
                <p className="mb-2 text-[18px] font-semibold text-gray-900 sm:text-[20px]">
                  {step.title}
                </p>
                <p className="text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="mb-6 flex items-center gap-3 sm:mb-8">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
              2
            </div>
            <div className="rounded-full border border-gray-200 px-3 py-1 text-[12px] font-medium sm:px-4 sm:py-1.5 sm:text-[13px]">
              The creative stack
            </div>
          </div>

          <h2 className="mb-10 max-w-2xl text-[clamp(1.5rem,4vw,2.6rem)] font-medium leading-[1.15] tracking-[-0.02em] text-gray-900 sm:mb-14">
            Capabilities across the sector.
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-200 p-6 transition-colors duration-300 hover:border-gray-300 sm:p-7"
              >
                <Icon size={28} strokeWidth={1.5} className="text-gray-900" />
                <p className="mb-2 mt-5 text-[17px] font-medium text-gray-900 sm:text-[18px]">
                  {title}
                </p>
                <p className="text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
