"use client";

import { useState, type FormEvent } from "react";
import Reveal from "./motion/Reveal";
import { RevealGroup, RevealItem } from "./motion/RevealGroup";
import { ApiError, ApplicantType, fetchAllEnquiryCategories, submitEnquiry } from "@/lib/api";

type Status = "idle" | "submitting" | "success" | "error";

const TOPIC_OPTIONS: { value: "evaluation" | "management" | "marketplace" | "investment"; label: string }[] = [
  { value: "evaluation", label: "Evaluation" },
  { value: "management", label: "Management" },
  { value: "marketplace", label: "Marketplace" },
  { value: "investment", label: "Investment" },
];

const APPLICANT_TYPE_OPTIONS: { value: ApplicantType; label: string }[] = [
  { value: "COMPANY", label: "Company / Venture" },
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "INVESTOR", label: "Investor" },
  { value: "OTHER", label: "Other" },
];

// MEMMIC-relevant categories — what the applicant's work actually is, not a
// generic startup-industry list.
export const RELATED_CATEGORY_OPTIONS: string[] = [
  "Digital Content / Video",
  "Film & TV Production",
  "Podcast & Audio",
  "Influencer / Creator Brand",
  "Talent Agency",
  "Brand / Advertiser",
  "Media Fund / Investor",
  "Platform / Marketplace",
  "Other",
];

const selectClassName =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-white/30";
const inputClassName =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-white/30";
const labelClassName = "mb-2 block text-xs uppercase tracking-[0.2em] text-white/40";

export default function ContactForm({
  formType,
  title = "Tell Us What You're Building",
  description,
}: {
  formType: "evaluation" | "management" | "marketplace" | "investment";
  title?: string;
  description?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const full_name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const topic = String(data.get("topic") ?? "") as (typeof TOPIC_OPTIONS)[number]["value"];
    const applicant_type = String(data.get("applicantType") ?? "") as ApplicantType;
    const related_category = String(data.get("category") ?? "").trim();
    const company_name = String(data.get("company") ?? "").trim();
    const brief = String(data.get("message") ?? "").trim();

    try {
      const categories = await fetchAllEnquiryCategories();
      const category = categories.find(
        (c) => c.form_type === topic && c.is_active === 1
      );
      if (!category) {
        throw new Error(`No enquiry category is configured for "${topic}" yet.`);
      }

      await submitEnquiry({
        full_name,
        email,
        category_id: category.id,
        brief,
        applicant_type,
        related_category,
        company_name,
      });

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <section className="relative flex w-full flex-col items-center overflow-hidden bg-[#070a12] px-6 py-20 md:px-12 md:py-24 lg:px-24">
      <div className="mb-12 max-w-2xl text-center md:mb-14">
        <Reveal>
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-white/40">
            Send a Message
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="text-3xl font-medium leading-[1.05] tracking-tight text-white md:text-5xl">
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-[14px] leading-relaxed text-white/50 sm:text-[15px]">
              {description}
            </p>
          )}
        </Reveal>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {status === "success" ? (
          <Reveal className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-[17px] font-semibold text-white sm:text-[18px]">
              Thanks — message received.
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-white/50 sm:text-[15px]">
              We'll get back to you shortly.
            </p>
          </Reveal>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <RevealGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <RevealItem>
                <label htmlFor={`${formType}-name`} className={labelClassName}>
                  Name
                </label>
                <input
                  id={`${formType}-name`}
                  name="name"
                  type="text"
                  required
                  minLength={5}
                  maxLength={50}
                  placeholder="Your full name"
                  className={inputClassName}
                />
              </RevealItem>

              <RevealItem>
                <label htmlFor={`${formType}-email`} className={labelClassName}>
                  Email
                </label>
                <input
                  id={`${formType}-email`}
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className={inputClassName}
                />
              </RevealItem>
            </RevealGroup>

            <RevealGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <RevealItem>
                <label htmlFor={`${formType}-topic`} className={labelClassName}>
                  What can we help with?
                </label>
                <select
                  id={`${formType}-topic`}
                  name="topic"
                  required
                  defaultValue={formType}
                  className={selectClassName}
                >
                  {TOPIC_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#0b0f1a] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </RevealItem>

              <RevealItem>
                <label htmlFor={`${formType}-applicantType`} className={labelClassName}>
                  You're applying as
                </label>
                <select
                  id={`${formType}-applicantType`}
                  name="applicantType"
                  required
                  defaultValue=""
                  className={selectClassName}
                >
                  <option value="" disabled className="bg-[#0b0f1a] text-white">
                    Select one
                  </option>
                  {APPLICANT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#0b0f1a] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </RevealItem>
            </RevealGroup>

            <RevealGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <RevealItem>
                <label htmlFor={`${formType}-category`} className={labelClassName}>
                  Related category
                </label>
                <select
                  id={`${formType}-category`}
                  name="category"
                  required
                  defaultValue=""
                  className={selectClassName}
                >
                  <option value="" disabled className="bg-[#0b0f1a] text-white">
                    Select one
                  </option>
                  {RELATED_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#0b0f1a] text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </RevealItem>

              <RevealItem>
                <label htmlFor={`${formType}-company`} className={labelClassName}>
                  Company / Venture
                </label>
                <input
                  id={`${formType}-company`}
                  name="company"
                  type="text"
                  required
                  placeholder="Where you're building this from"
                  className={inputClassName}
                />
              </RevealItem>
            </RevealGroup>

            <RevealItem>
              <label htmlFor={`${formType}-message`} className={labelClassName}>
                What are you building?
              </label>
              <textarea
                id={`${formType}-message`}
                name="message"
                required
                minLength={8}
                maxLength={500}
                rows={5}
                placeholder="What you're building, where it stands, and what you're hoping MEMMIC can evaluate, manage, market, or fund."
                className={`${inputClassName} resize-none`}
              />
            </RevealItem>

            {status === "error" && error && (
              <RevealItem>
                <p className="text-[13px] text-red-400 sm:text-[14px]">{error}</p>
              </RevealItem>
            )}

            <RevealItem>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-2 inline-flex cursor-pointer items-center justify-center self-center rounded-full border-0 bg-white px-7 py-3.5 text-sm font-medium leading-none text-black outline-none transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Send message"}
              </button>
            </RevealItem>
          </form>
        )}
      </div>
    </section>
  );
}
