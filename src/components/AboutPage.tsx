import { EMMIC_STEPS, VALUES } from "../data/about";
import { PAGE_HERO_IMAGES } from "../data/images";
import PageHeroBackground from "./PageHeroBackground";

function SectionEyebrow({
  index,
  label,
}: {
  index: string;
  label: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3 sm:mb-8">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
        {index}
      </div>
      <div className="rounded-full border border-gray-200 px-3 py-1 text-[12px] font-medium sm:px-4 sm:py-1.5 sm:text-[13px]">
        {label}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32">
        <PageHeroBackground image={PAGE_HERO_IMAGES.about} />
        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <p className="mb-5 text-[13px] tracking-wide text-gray-500 sm:mb-8 sm:text-[14px]">
            About — AmanorX Holdings
          </p>

          <h1 className="max-w-3xl text-[clamp(1.75rem,6vw,3.6rem)] font-medium leading-[1.1] tracking-[-0.03em] text-gray-900">
            The media company, built with conviction.
          </h1>

          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:text-[16px]">
            MEMMIC is AmanorX Holdings' evaluation, management, marketplace
            and investment company for media and creative — the sector lens
            that
            builds, backs and scales the studios, products and stories
            shaping how Pakistan's brands show up.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-100 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <SectionEyebrow index="1" label="The thesis" />

          <div className="max-w-3xl space-y-5 text-[15px] leading-relaxed text-gray-600 sm:text-[16px]">
            <p>
              Attention is the new infrastructure. MEMMIC builds inside it —
              backing the studios, products and stories that help Pakistan's
              brands show up with craft and integrity.
            </p>
            <p>
              We evaluate what's worth making, run it to a standard, and give
              the creative businesses that earn it room to grow. No noise for
              its own sake — work the people behind it can stand behind.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <SectionEyebrow index="2" label="The EMMIC model" />

          <h2 className="mb-12 max-w-2xl text-[clamp(1.5rem,4vw,2.6rem)] font-medium leading-[1.15] tracking-[-0.02em] text-gray-900 sm:mb-16">
            How we operate.
          </h2>

          <p className="mb-10 max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:mb-14 sm:text-[16px]">
            MEMMIC is the Media EMMIC — four disciplines applied to the media
            & creative sector, to one standard.
          </p>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-8">
            {EMMIC_STEPS.map((step) => (
              <div key={step.number}>
                <p className="mb-3 text-[13px] font-medium text-gray-400 sm:text-[14px]">
                  {step.number}
                </p>
                <p className="mb-2 text-[17px] font-semibold text-gray-900 sm:text-[18px]">
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
          <SectionEyebrow index="3" label="The real substance" />

          <h2 className="mb-6 max-w-2xl text-[clamp(1.5rem,4vw,2.6rem)] font-medium leading-[1.15] tracking-[-0.02em] text-gray-900">
            Live companies underneath.
          </h2>

          <p className="max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:text-[16px]">
            Unlike a holding-page, MEMMIC has live substance.{" "}
            <a
              href="https://ilhamcreatives.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-900 underline underline-offset-2 transition-colors duration-300 hover:text-gray-500"
            >
              Ilham Creatives
            </a>{" "}
            — a Shariah-compliant creative & production studio — and its
            immersive virtual-tour product{" "}
            <a
              href="https://virtulee.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-900 underline underline-offset-2 transition-colors duration-300 hover:text-gray-500"
            >
              Virtulee
            </a>{" "}
            operate within the MEMMIC world. See them on the studio &
            products section, or explore{" "}
            <a
              href="https://ilhamcreatives.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-900 underline underline-offset-2 transition-colors duration-300 hover:text-gray-500"
            >
              Ilham Creatives ↗
            </a>{" "}
            and{" "}
            <a
              href="https://virtulee.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-900 underline underline-offset-2 transition-colors duration-300 hover:text-gray-500"
            >
              Virtulee ↗
            </a>{" "}
            directly.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-100 py-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <SectionEyebrow index="4" label="Creativity with conviction" />

          <h2 className="mb-6 max-w-2xl text-[clamp(1.5rem,4vw,2.6rem)] font-medium leading-[1.15] tracking-[-0.02em] text-gray-900">
            What we stand for.
          </h2>

          <p className="mb-10 max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:mb-14 sm:text-[16px]">
            Modern digital craft, made with integrity. The differentiator
            isn't louder work — it's work you can stand behind.
          </p>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
            {VALUES.map((value) => (
              <div key={value.title}>
                <p className="mb-2 text-[17px] font-semibold text-gray-900 sm:text-[18px]">
                  {value.title}
                </p>
                <p className="text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
