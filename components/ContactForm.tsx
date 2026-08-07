"use client";

import { useState, type FormEvent } from "react";
import Reveal from "./motion/Reveal";
import { RevealGroup, RevealItem } from "./motion/RevealGroup";
import { ApiError, fetchAllEnquiryCategories, submitEnquiry } from "@/lib/api";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm({
  formType,
  title = "Get in touch.",
  description = "Tell us a bit about what you have in mind and we'll get back to you.",
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
    const brief = String(data.get("message") ?? "").trim();

    try {
      const categories = await fetchAllEnquiryCategories();
      const category = categories.find(
        (c) => c.form_type === formType && c.is_active === 1
      );
      if (!category) {
        throw new Error(
          `No enquiry category is configured for "${formType}" yet.`
        );
      }

      await submitEnquiry({
        full_name,
        email,
        category_id: category.id,
        brief,
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
    <section className="border-t border-gray-100 bg-[#F5F5F5] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <h2 className="max-w-2xl text-[clamp(1.5rem,4vw,2.4rem)] font-medium leading-[1.15] tracking-[-0.02em] text-gray-900">
            {title}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
            {description}
          </p>
        </Reveal>

        <div className="mt-10">
          {status === "success" ? (
            <Reveal className="max-w-lg rounded-2xl border border-gray-200 bg-white p-8">
              <p className="text-[17px] font-semibold text-gray-900 sm:text-[18px]">
                Thanks — message received.
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
                We'll get back to you shortly.
              </p>
            </Reveal>
          ) : (
            <RevealGroup className="max-w-lg">
              <form onSubmit={handleSubmit} className="space-y-5">
                <RevealItem>
                  <label
                    htmlFor={`${formType}-name`}
                    className="mb-2 block text-[13px] font-medium text-gray-900 sm:text-[14px]"
                  >
                    Name
                  </label>
                  <input
                    id={`${formType}-name`}
                    name="name"
                    type="text"
                    required
                    minLength={5}
                    maxLength={50}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-900 outline-none transition-colors duration-300 focus:border-gray-900 sm:text-[15px]"
                    placeholder="Your name"
                  />
                </RevealItem>

                <RevealItem>
                  <label
                    htmlFor={`${formType}-email`}
                    className="mb-2 block text-[13px] font-medium text-gray-900 sm:text-[14px]"
                  >
                    Email
                  </label>
                  <input
                    id={`${formType}-email`}
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-900 outline-none transition-colors duration-300 focus:border-gray-900 sm:text-[15px]"
                    placeholder="you@email.com"
                  />
                </RevealItem>

                <RevealItem>
                  <label
                    htmlFor={`${formType}-message`}
                    className="mb-2 block text-[13px] font-medium text-gray-900 sm:text-[14px]"
                  >
                    Brief
                  </label>
                  <textarea
                    id={`${formType}-message`}
                    name="message"
                    required
                    minLength={8}
                    maxLength={500}
                    rows={5}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] text-gray-900 outline-none transition-colors duration-300 focus:border-gray-900 sm:text-[15px]"
                    placeholder={`Tell us a bit about your ${formType} enquiry`}
                  />
                </RevealItem>

                {status === "error" && error && (
                  <RevealItem>
                    <p className="text-[13px] text-red-600 sm:text-[14px]">
                      {error}
                    </p>
                  </RevealItem>
                )}

                <RevealItem>
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="rounded-full bg-[#111827] px-6 py-3 text-[13px] font-medium text-white transition-colors duration-300 hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[14px]"
                  >
                    {status === "submitting" ? "Sending…" : "Send enquiry"}
                  </button>
                </RevealItem>
              </form>
            </RevealGroup>
          )}
        </div>
      </div>
    </section>
  );
}
