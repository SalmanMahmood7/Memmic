"use client";

import RollButton from "./RollButton";
import Reveal from "./motion/Reveal";
import Parallax from "./motion/Parallax";

const SMALL_IMAGE =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090123_74be96d4-9c1b-40cf-932a-96f4f4babed3.png&w=1280&q=85";
const LARGE_IMAGE =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260516_090133_c157d30b-a99a-4477-bec1-a446149ec3f2.png&w=1280&q=85";

function AboutButton({ className = "" }: { className?: string }) {
  return (
    <RollButton
      to="/about"
      label="Read more about us"
      buttonClassName={`bg-[#111827] hover:bg-[#1f2937] text-white text-[13px] sm:text-[14px] font-medium rounded-full pl-5 sm:pl-6 pr-2 py-2 gap-10 sm:gap-14 ${className}`}
      circleClassName="bg-white w-7 h-7 sm:w-8 sm:h-8"
      arrowClassName="text-[#111827]"
    />
  );
}

export default function About() {
  return (
    <section className="overflow-hidden bg-white pb-12 pt-16 sm:pb-16 sm:pt-20 lg:pb-24 lg:pt-32">
      <div className="mx-auto max-w-[1440px]">
        <Reveal className="mb-6 flex items-center gap-3 px-5 sm:mb-8 sm:px-8 lg:px-12">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
            1
          </div>
          <div className="rounded-full border border-gray-200 px-3 py-1 text-[12px] font-medium sm:px-4 sm:py-1.5 sm:text-[13px]">
            About — AmanorX Holdings
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="mb-12 px-5 text-[clamp(1.5rem,4vw,3.2rem)] font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 sm:mb-16 sm:px-8 lg:mb-28 lg:px-12">
            The media company, built
            <br />
            with conviction.
          </h2>
        </Reveal>

        {/* Mobile / tablet layout */}
        <div className="px-5 sm:px-8 lg:hidden">
          <Reveal>
            <p className="text-[15px] font-medium leading-[1.6] text-gray-900 sm:text-[17px]">
              MEMMIC is AmanorX Holdings' evaluation, management, marketplace
              and investment company for media and creative — the sector lens
              that
              builds, backs and scales the studios, products and stories
              shaping how Pakistan's brands show up.
            </p>
            <div className="mt-6">
              <AboutButton />
            </div>
          </Reveal>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-5">
            <Reveal delay={0.1} y={40} className="w-full sm:w-[45%]">
              <img
                src={SMALL_IMAGE}
                alt="Memmic work sample"
                className="aspect-[438/346] w-full rounded-xl object-cover sm:rounded-2xl"
              />
            </Reveal>
            <Reveal delay={0.2} y={40} className="w-full sm:w-[55%]">
              <img
                src={LARGE_IMAGE}
                alt="Memmic work sample"
                className="aspect-[900/600] w-full rounded-xl object-cover sm:rounded-2xl"
              />
            </Reveal>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden grid-cols-[26%_1fr_48%] items-end gap-6 px-5 sm:px-8 lg:grid lg:px-12 xl:gap-8">
          <Parallax strength={30} className="aspect-[438/346] w-full self-end overflow-hidden rounded-2xl">
            <img
              src={SMALL_IMAGE}
              alt="Memmic work sample"
              className="h-[calc(100%+60px)] w-full -translate-y-[30px] object-cover"
            />
          </Parallax>

          <Reveal delay={0.15} className="flex justify-end self-start">
            <div className="max-w-[420px]">
              <p className="text-[16px] leading-[1.65] text-gray-900 xl:text-[18px]">
                MEMMIC is AmanorX Holdings' evaluation, management,
                marketplace and investment company for media and creative —
                the sector
                lens that builds, backs and scales the studios, products and
                stories shaping how Pakistan's brands show up.
              </p>
              <div className="mt-6">
                <AboutButton />
              </div>
            </div>
          </Reveal>

          <Parallax strength={50} className="aspect-[3/2] w-full self-end overflow-hidden rounded-2xl">
            <img
              src={LARGE_IMAGE}
              alt="Memmic work sample"
              className="h-[calc(100%+100px)] w-full -translate-y-[50px] object-cover"
            />
          </Parallax>
        </div>
      </div>
    </section>
  );
}
