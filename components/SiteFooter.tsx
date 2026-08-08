"use client";

import { useState, type FormEvent } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NAV_LINKS } from "@/data/nav";
import Reveal from "./motion/Reveal";
import { RevealGroup, RevealItem } from "./motion/RevealGroup";

const FAQS = [
  {
    question: "What does MEMMIC actually do?",
    answer:
      "We're AmanorX Holdings' evaluation, management, marketplace and investment company for media and creative — we back, run and grow studios and products across Pakistan's creative sector.",
  },
  {
    question: "Is Ilham Creatives part of MEMMIC?",
    answer:
      "Yes — Ilham Creatives is a Shariah-compliant creative & production studio operating live within the MEMMIC world, alongside its product Virtulee.",
  },
  {
    question: "Do you only invest, or do you also run studios day-to-day?",
    answer:
      "Both. The EMMIC model covers all four: we evaluate what's worth backing, manage it to a standard, market it properly, and invest capital behind it.",
  },
  {
    question: "How do you decide what to back?",
    answer:
      "Craft, conviction and the chance to last — we're looking for creative businesses that can survive being run to a standard, not just launched.",
  },
  {
    question: "How do I start a conversation with MEMMIC?",
    answer:
      "Reach out through our contact page or book a consultation — tell us about your studio, product or project and we'll take it from there.",
  },
];

const STUDIO_LINKS = [
  { label: "Ilham Creatives", href: "https://ilhamcreatives.com/", external: true },
  { label: "Virtulee", href: "https://virtulee.com/", external: true },
  { label: "About MEMMIC", href: "/about", external: false },
];

export default function SiteFooter() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [ctaHovered, setCtaHovered] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function toggle(index: number) {
    setActiveIndex((current) => (current === index ? null : index));
  }

  function handleSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubscribed(true);
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="bg-white text-[#111827]">
      <main className="py-20 max-[900px]:py-[60px]">
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-[1.6fr_1fr] items-stretch gap-[30px] max-[900px]:grid-cols-1 max-[900px]:gap-[60px]">
            <Reveal
              className="c5-animated-gradient flex flex-col items-center justify-center rounded-[24px] px-10 py-20 text-center text-white"
              style={{ boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)" }}
            >
              <h2
                className="mb-[15px] font-normal leading-[1.1]"
                style={{ fontSize: "3.5rem", letterSpacing: "-0.03em" }}
              >
                Ready to Build
                <br />
                With Conviction?
              </h2>
              <p className="mb-[30px] text-[0.9rem] font-normal opacity-85">
                Let's talk about your studio, product or campaign.
              </p>
              <button
                type="button"
                onClick={() => router.push("/contact")}
                onMouseEnter={() => setCtaHovered(true)}
                onMouseLeave={() => setCtaHovered(false)}
                className="cursor-pointer border-none bg-[#111827] text-[0.95rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  padding: "14px 32px",
                  borderRadius: "12px",
                  boxShadow: ctaHovered
                    ? "0 14px 30px rgba(0,0,0,0.4)"
                    : "0 10px 20px rgba(0,0,0,0.3)",
                }}
              >
                Start a Project
              </button>
            </Reveal>

            <RevealGroup className="flex flex-col justify-center gap-3">
              {FAQS.map((faq, index) => {
                const active = activeIndex === index;
                return (
                  <RevealItem
                    key={faq.question}
                    onClick={() => toggle(index)}
                    className="cursor-pointer rounded-[10px] border bg-white px-5 py-[18px] transition-all duration-200 hover:border-[#eaeaea]"
                    style={{
                      borderColor: active ? "#eaeaea" : "#f0f0f0",
                      boxShadow: active
                        ? "0 4px 12px rgba(0,0,0,0.04)"
                        : "0 2px 8px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div className="flex items-center justify-between text-[0.9rem] font-normal text-[#111827]">
                      <span>{faq.question}</span>
                      {active ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                    {active && (
                      <p className="mt-3 text-[0.9rem] leading-[1.6] text-[#666]">
                        {faq.answer}
                      </p>
                    )}
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </div>
        </div>
      </main>

      <footer className="bg-[#fafafa] pb-5 pt-20 max-[900px]:pt-[60px]">
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <RevealGroup className="mb-[50px] grid grid-cols-[2fr_1fr_1fr_2fr] gap-10 max-[900px]:grid-cols-2 max-[480px]:grid-cols-1">
            <RevealItem>
              <p className="mb-4 text-[26px] font-bold tracking-tight text-[#111827] sm:text-[28px]">
                MEMMIC
              </p>
              <p className="max-w-[220px] text-[0.85rem] leading-[1.6] text-[#888]">
                AmanorX Holdings' evaluation, management, marketplace and
                investment company for media and creative across Pakistan.
              </p>
            </RevealItem>

            <RevealItem>
              <h4 className="mb-5 text-[0.95rem] font-semibold text-[#111827]">
                Navigation
              </h4>
              <ul>
                {NAV_LINKS.map((link) => (
                  <li key={link.label} className="mb-3">
                    <Link
                      href={link.to}
                      className="text-[0.85rem] text-[#888] no-underline transition-colors duration-200 hover:text-[#111827]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </RevealItem>

            <RevealItem>
              <h4 className="mb-5 text-[0.95rem] font-semibold text-[#111827]">
                Studio
              </h4>
              <ul>
                {STUDIO_LINKS.map((link) => (
                  <li key={link.label} className="mb-3">
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.85rem] text-[#888] no-underline transition-colors duration-200 hover:text-[#111827]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[0.85rem] text-[#888] no-underline transition-colors duration-200 hover:text-[#111827]"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </RevealItem>

            <RevealItem>
              <h4 className="mb-5 text-[0.95rem] font-semibold text-[#111827]">
                Newsletter
              </h4>
              {subscribed ? (
                <p className="text-[0.85rem] text-[#888]">
                  You're subscribed — thanks for joining.
                </p>
              ) : (
                <>
                  <p className="mb-[15px] text-[0.85rem] text-[#888]">
                    Join our newsletter and get notified.
                  </p>
                  <form onSubmit={handleSubscribe} className="flex gap-[10px]">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email..."
                      className="flex-grow border border-[#f0f0f0] bg-white text-[0.9rem] outline-none transition-colors duration-200 focus:border-[#ccc]"
                      style={{
                        padding: "12px 16px",
                        borderRadius: "10px",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
                      }}
                    />
                    <button
                      type="submit"
                      className="cursor-pointer border-none bg-[#111827] text-[0.9rem] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        padding: "12px 28px",
                        borderRadius: "10px",
                        boxShadow: "0 12px 24px rgba(0,0,0,0.4)",
                      }}
                    >
                      Subscribe
                    </button>
                  </form>
                </>
              )}
            </RevealItem>
          </RevealGroup>

          <div className="flex flex-wrap items-center justify-between gap-[15px] border-t border-[#f0f0f0] pb-[10px] pt-[25px] text-[0.85rem] text-[#888] max-[480px]:flex-col max-[480px]:items-center">
            <span>All rights reserved. © 2026</span>
            <span className="flex items-center gap-[15px]">
              <Link
                href="/privacy-policy"
                className="no-underline transition-colors duration-200 hover:text-[#111827]"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="no-underline transition-colors duration-200 hover:text-[#111827]"
              >
                Terms of Service
              </Link>
            </span>
            <span>Part of AmanorX Holdings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
