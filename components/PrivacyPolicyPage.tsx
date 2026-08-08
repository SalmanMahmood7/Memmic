import { PAGE_HERO_IMAGES } from "@/data/images";
import PageHeroBackground from "./PageHeroBackground";
import Reveal from "./motion/Reveal";
import { RevealGroup, RevealItem } from "./motion/RevealGroup";

const SECTIONS = [
  {
    title: "Overview",
    body: "MEMMIC (AmanorX Holdings' evaluation, management, marketplace and investment company for media and creative) respects the privacy of everyone who visits this site, submits an enquiry, or uses a MEMMIC client portal. This page will host our full Privacy Policy — for now it summarizes, in plain terms, the categories of data we handle and how to reach us about it.",
  },
  {
    title: "Information we collect",
    body: "When you submit an enquiry or contact form, we collect the details you provide — name, email, company/venture, and the brief you share about your project. If you're issued a client portal account, we also hold account credentials and activity related to the services you've applied for.",
  },
  {
    title: "How we use it",
    body: "Enquiry details are used to review and respond to your application, route it to the right MEMMIC team (evaluation, management, marketplace or investment), and — if approved — to set up and manage your client portal account. We do not sell personal data to third parties.",
  },
  {
    title: "Contact",
    body: "Questions about this policy or your data can be sent to us via the contact page, or directly to afraonlineeducation@gmail.com.",
  },
];

export default function PrivacyPolicyPage() {
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
              Privacy Policy.
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:text-[16px]">
              Our full Privacy Policy is coming soon. Below is a placeholder
              summary of how MEMMIC handles the information you share with us
              — it will be replaced with the complete, legally reviewed
              policy shortly.
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
              Privacy Policy. Last updated: 2026.
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
