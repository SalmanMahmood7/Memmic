import CaseStudies from "./CaseStudies";
import { PAGE_HERO_IMAGES } from "../data/images";
import PageHeroBackground from "./PageHeroBackground";

export default function StudioPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32">
        <PageHeroBackground image={PAGE_HERO_IMAGES.studio} />
        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <p className="mb-5 text-[13px] tracking-wide text-gray-500 sm:mb-8 sm:text-[14px]">
            Studio
          </p>

          <h1 className="max-w-3xl text-[clamp(1.75rem,6vw,3.6rem)] font-medium leading-[1.1] tracking-[-0.03em] text-gray-900">
            Live companies underneath.
          </h1>

          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:text-[16px]">
            Unlike a holding-page, MEMMIC has live substance — the studios and
            products operating inside the MEMMIC world today.
          </p>
        </div>
      </section>

      <CaseStudies />
    </div>
  );
}
