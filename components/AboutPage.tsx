import {
  Target,
  Settings2,
  Megaphone,
  Landmark,
  ShieldCheck,
  Wand2,
  ClipboardCheck,
} from "lucide-react";
import { EMMIC_STEPS, VALUES } from "@/data/about";
import { PAGE_HERO_IMAGES } from "@/data/images";
import PageHeroBackground from "./PageHeroBackground";
import Reveal from "./motion/Reveal";
import { RevealGroup, RevealItem } from "./motion/RevealGroup";
import Parallax from "./motion/Parallax";

const THESIS_IMAGE =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80";

const STEP_ICONS = [Target, Settings2, Megaphone, Landmark];
const VALUE_ICONS = [ShieldCheck, Wand2, ClipboardCheck];

function SectionEyebrow({
  index,
  label,
}: {
  index: string;
  label: string;
}) {
  return (
    <Reveal className="mb-6 flex items-center gap-3 sm:mb-8">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
        {index}
      </div>
      <div className="rounded-full border border-gray-200 px-3 py-1 text-[12px] font-medium sm:px-4 sm:py-1.5 sm:text-[13px]">
        {label}
      </div>
    </Reveal>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32">
        <PageHeroBackground image={PAGE_HERO_IMAGES.about} />
        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <p className="mb-5 text-[13px] tracking-wide text-gray-500 sm:mb-8 sm:text-[14px]">
              About — AmanorX Holdings
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="max-w-3xl text-[clamp(1.75rem,6vw,3.6rem)] font-medium leading-[1.1] tracking-[-0.03em] text-gray-900">
              The media company, built with conviction.
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:text-[16px]">
              MEMMIC is AmanorX Holdings' evaluation, management, marketplace
              and investment company for media and creative — the sector lens
              that
              builds, backs and scales the studios, products and stories
              shaping how Pakistan's brands show up.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 1. The thesis */}
      <section className="border-t border-gray-100 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <SectionEyebrow index="1" label="The thesis" />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <Parallax
              strength={40}
              className="aspect-[4/3] w-full overflow-hidden rounded-2xl lg:col-span-5"
            >
              <img
                src={THESIS_IMAGE}
                alt="MEMMIC creative work in progress"
                className="h-full w-full scale-110 object-cover"
              />
            </Parallax>

            <Reveal delay={0.1} className="lg:col-span-7">
              <h2 className="mb-6 max-w-xl text-[clamp(1.5rem,4vw,2.6rem)] font-medium leading-[1.15] tracking-[-0.02em] text-gray-900">
                Attention is the new infrastructure.
              </h2>
              <div className="max-w-xl space-y-5 text-[15px] leading-relaxed text-gray-600 sm:text-[16px]">
                <p>
                  MEMMIC builds inside it — backing the studios, products and
                  stories that help Pakistan's brands show up with craft and
                  integrity.
                </p>
                <p>
                  We evaluate what's worth making, run it to a standard, and
                  give the creative businesses that earn it room to grow. No
                  noise for its own sake — work the people behind it can
                  stand behind.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 2. The EMMIC model */}
      <section className="border-t border-gray-100 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <SectionEyebrow index="2" label="The EMMIC model" />

          <Reveal delay={0.08}>
            <h2 className="mb-6 max-w-2xl text-[clamp(1.5rem,4vw,2.6rem)] font-medium leading-[1.15] tracking-[-0.02em] text-gray-900">
              How we operate.
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mb-10 max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:mb-14 sm:text-[16px]">
              MEMMIC is the Media EMMIC — four disciplines applied to the media
              & creative sector, to one standard.
            </p>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {EMMIC_STEPS.map((step, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <RevealItem
                  key={step.number}
                  className="rounded-2xl border border-gray-200 p-6 transition-colors duration-300 hover:border-gray-300 sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <Icon
                      size={28}
                      strokeWidth={1.5}
                      className="text-gray-900"
                    />
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

      {/* 3. Creativity with conviction */}
      <section className="border-t border-gray-100 py-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <SectionEyebrow index="3" label="Creativity with conviction" />

          <Reveal delay={0.08}>
            <h2 className="mb-6 max-w-2xl text-[clamp(1.5rem,4vw,2.6rem)] font-medium leading-[1.15] tracking-[-0.02em] text-gray-900">
              What we stand for.
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mb-10 max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:mb-14 sm:text-[16px]">
              Modern digital craft, made with integrity. The differentiator
              isn't louder work — it's work you can stand behind.
            </p>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
            {VALUES.map((value, i) => {
              const Icon = VALUE_ICONS[i];
              return (
                <RevealItem
                  key={value.title}
                  className="rounded-2xl border border-gray-200 p-6 transition-colors duration-300 hover:border-gray-300 sm:p-7"
                >
                  <Icon
                    size={28}
                    strokeWidth={1.5}
                    className="text-gray-900"
                  />
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
        </div>
      </section>
    </div>
  );
}
