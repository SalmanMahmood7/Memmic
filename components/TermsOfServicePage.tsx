import { PAGE_HERO_IMAGES } from "@/data/images";
import PageHeroBackground from "./PageHeroBackground";
import Reveal from "./motion/Reveal";
import { RevealGroup, RevealItem } from "./motion/RevealGroup";

const SECTIONS = [
  {
    title: "Acceptance of terms",
    body: "By using this site, submitting an enquiry, or accessing a MEMMIC client portal, you agree to these terms. This page will host our full Terms of Service — for now it summarizes, in plain terms, the basics of how MEMMIC's site and portals may be used.",
  },
  {
    title: "Use of our services",
    body: "Enquiries submitted through our evaluation, management, marketplace and investment forms are reviewed by the MEMMIC team. Approval, portal access and any resulting engagement are at MEMMIC's discretion and, where applicable, governed by a separate signed agreement.",
  },
  {
    title: "Client portal accounts",
    body: "Credentials issued for a MEMMIC client portal are for the named applicant's use only and should be kept confidential. MEMMIC may edit or reissue credentials prior to handoff, and may suspend access for accounts found to violate these terms.",
  },
  {
    title: "Limitation of liability & contact",
    body: "MEMMIC provides this site and its portals on an as-is basis while our full terms are finalized. Questions about these terms can be sent via the contact page, or directly to afraonlineeducation@gmail.com.",
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32">
        <PageHeroBackground image={PAGE_HERO_IMAGES.about} />
        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <p className="mb-5 text-[13px] tracking-wide text-gray-500 sm:mb-8 sm:text-[14px]">
              Legal
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="max-w-3xl text-[clamp(1.75rem,6vw,3.6rem)] font-medium leading-[1.1] tracking-[-0.03em] text-gray-900">
              Terms of Service.
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:text-[16px]">
              Our full Terms of Service are coming soon. Below is a
              placeholder summary of how MEMMIC's site and client portals may
              be used — it will be replaced with the complete, legally
              reviewed terms shortly.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-gray-100 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <Reveal className="mb-12 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:mb-16">
            <p className="text-[14px] font-medium text-amber-800 sm:text-[15px]">
              Coming soon
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-amber-700 sm:text-[14px]">
              This is placeholder content pending our final, legally reviewed
              Terms of Service. Last updated: 2026.
            </p>
          </Reveal>

          <RevealGroup className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {SECTIONS.map((section) => (
              <RevealItem key={section.title} className="max-w-xl">
                <p className="mb-2 text-[17px] font-semibold text-gray-900 sm:text-[18px]">
                  {section.title}
                </p>
                <p className="text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
                  {section.body}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </div>
  );
}
