import type { WhatWeDoDetail } from "@/data/whatWeDoDetails";
import { PAGE_HERO_IMAGES } from "@/data/images";
import PageHeroBackground from "./PageHeroBackground";
import Reveal from "./motion/Reveal";
import { RevealGroup, RevealItem } from "./motion/RevealGroup";
import ContactForm from "./ContactForm";

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

export default function WhatWeDoDetailPage({ detail }: { detail: WhatWeDoDetail }) {
  const heroImage =
    PAGE_HERO_IMAGES[detail.slug as keyof typeof PAGE_HERO_IMAGES] ??
    PAGE_HERO_IMAGES.whatWeDo;

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32">
        <PageHeroBackground image={heroImage} />
        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <p className="mb-5 text-[13px] tracking-wide text-gray-500 sm:mb-8 sm:text-[14px]">
              What we do — {detail.navLabel}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="max-w-3xl text-[clamp(1.75rem,6vw,3.6rem)] font-medium leading-[1.1] tracking-[-0.03em] text-gray-900">
              {detail.title}
            </h1>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="mt-4 max-w-2xl text-[18px] font-medium text-gray-900 sm:text-[20px]">
              {detail.tagline}
            </p>
          </Reveal>

          <Reveal delay={0.26}>
            <div className="mt-6 max-w-2xl space-y-4 text-[15px] leading-relaxed text-gray-600 sm:text-[16px]">
              {detail.intro.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {detail.sections.map((section, sectionIndex) => (
        <section
          key={section.label}
          className="border-t border-gray-100 py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <SectionEyebrow
              index={String(sectionIndex + 1)}
              label={section.label}
            />

            <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {section.items.map((item) => (
                <RevealItem
                  key={item.number}
                  className="rounded-2xl border border-gray-200 p-6 transition-colors duration-300 hover:border-gray-300 sm:p-7"
                >
                  <p className="mb-3 text-[13px] font-medium text-gray-400 sm:text-[14px]">
                    {item.number}
                  </p>
                  <p className="mb-2 text-[17px] font-semibold text-gray-900 sm:text-[18px]">
                    {item.title}
                  </p>
                  <p className="text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
                    {item.description}
                  </p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      ))}

      <section className="border-t border-gray-100 bg-[#F5F5F5] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <Reveal y={20}>
            <blockquote className="max-w-3xl border-l-2 border-gray-900 pl-6 text-[19px] font-medium italic leading-[1.5] tracking-[-0.01em] text-gray-900 sm:pl-8 sm:text-[24px] lg:text-[28px]">
              "{detail.quote}"
            </blockquote>
          </Reveal>
        </div>
      </section>

      <ContactForm
        formType={
          detail.slug as "evaluation" | "management" | "marketplace" | "investment"
        }
        title={`Start a ${detail.navLabel.toLowerCase()} enquiry.`}
        description={`Tell us a bit about what you need and our ${detail.navLabel.toLowerCase()} team will get back to you.`}
      />
    </div>
  );
}
