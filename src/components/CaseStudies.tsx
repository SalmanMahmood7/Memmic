import { ArrowRight } from "lucide-react";
import LinkIcon from "../icons/LinkIcon";

const ILHAM_IMAGE =
  "https://images.unsplash.com/photo-1632187981988-40f3cbaeef5e?auto=format&fit=crop&w=1200&q=80";
const VIRTULEE_IMAGE =
  "https://images.unsplash.com/photo-1696861080288-0cc2f1cd48d5?auto=format&fit=crop&w=1200&q=80";

export default function CaseStudies() {
  return (
    <section className="bg-[#F5F5F5] pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-28 lg:pt-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-6 flex items-center gap-3 px-5 sm:mb-8 sm:px-8 lg:px-12">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
            2
          </div>
          <div className="rounded-full border border-gray-300 px-3 py-1 text-[12px] font-medium sm:px-4 sm:py-1.5 sm:text-[13px]">
            Featured client work
          </div>
        </div>

        <h2 className="mb-10 px-5 text-[clamp(1.75rem,7vw,4.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:mb-14 sm:px-8 sm:text-[clamp(2.5rem,5vw,4.2rem)] lg:mb-16 lg:px-12">
          Studio & Products
        </h2>

        <div className="grid grid-cols-1 gap-5 px-5 sm:gap-6 sm:px-8 md:grid-cols-2 lg:gap-7 lg:px-12">
          {/* Card 1: Ilham Creatives */}
          <div>
            <div className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl bg-[#1a1d2e]">
              <img
                src={ILHAM_IMAGE}
                alt="Ilham Creatives production set"
                className="h-full w-full object-cover"
              />
              <a
                href="https://ilhamcreatives.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 flex h-9 w-9 items-center gap-2 overflow-hidden rounded-full bg-[#111827] pl-[11px] pr-4 transition-all duration-300 ease-in-out group-hover:w-[230px]"
              >
                <LinkIcon className="shrink-0 -rotate-45 text-white transition-transform duration-300 group-hover:rotate-0" />
                <span className="whitespace-nowrap text-[13px] font-medium text-white opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100">
                  Explore ilham Creatives
                </span>
              </a>
            </div>
            <p className="mt-4 text-[13px] font-medium text-gray-500 sm:text-[14px]">
              Creative & production studio · live
            </p>
            <p className="mt-1 text-[16px] font-semibold text-gray-900 sm:text-[18px]">
              Ilham Creatives
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-600 sm:text-[14px]">
              A Shariah-compliant creative & production studio — strategy,
              production, immersive 3D, AI content and development. Operating
              within the MEMMIC world.
            </p>
          </div>

          {/* Card 2: Virtulee */}
          <div>
            <div className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl bg-[#6b6b6b]">
              <img
                src={VIRTULEE_IMAGE}
                alt="Virtulee immersive virtual tour"
                className="h-full w-full object-cover"
              />
              <a
                href="https://virtulee.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 flex h-9 w-9 items-center gap-2 overflow-hidden rounded-full bg-[#111827] pl-[11px] transition-all duration-300 ease-in-out group-hover:w-[168px]"
              >
                <ArrowRight
                  size={14}
                  className="shrink-0 -rotate-45 text-white transition-transform duration-300 group-hover:rotate-0"
                />
                <span className="whitespace-nowrap text-[13px] font-medium text-white opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100">
                  Visit Virtulee ↗
                </span>
              </a>
            </div>
            <p className="mt-4 text-[13px] font-medium text-gray-500 sm:text-[14px]">
              Product · by Ilham Creatives
            </p>
            <p className="mt-1 text-[16px] font-semibold text-gray-900 sm:text-[18px]">
              Virtulee
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-gray-600 sm:text-[14px]">
              Immersive virtual tours that let anyone walk through a space
              from anywhere — real estate, retail, venues and beyond.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
