import { useState, type FormEvent } from "react";
import { PAGE_HERO_IMAGES } from "../data/images";
import PageHeroBackground from "./PageHeroBackground";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32">
        <PageHeroBackground image={PAGE_HERO_IMAGES.contact} />
        <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <p className="mb-5 text-[13px] tracking-wide text-gray-500 sm:mb-8 sm:text-[14px]">
            Contact
          </p>

          <h1 className="max-w-3xl text-[clamp(1.75rem,6vw,3.6rem)] font-medium leading-[1.1] tracking-[-0.03em] text-gray-900">
            Let's talk.
          </h1>

          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:text-[16px]">
            Whether it's a project, a partnership or an investment
            conversation — tell us a bit about what you have in mind.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-100 pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          {submitted ? (
            <div className="max-w-lg rounded-2xl border border-gray-200 p-8">
              <p className="text-[17px] font-semibold text-gray-900 sm:text-[18px]">
                Thanks — message received.
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
                We'll get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-[13px] font-medium text-gray-900 sm:text-[14px]"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-gray-900 outline-none transition-colors duration-300 focus:border-gray-900 sm:text-[15px]"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[13px] font-medium text-gray-900 sm:text-[14px]"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-gray-900 outline-none transition-colors duration-300 focus:border-gray-900 sm:text-[15px]"
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-[13px] font-medium text-gray-900 sm:text-[14px]"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-[14px] text-gray-900 outline-none transition-colors duration-300 focus:border-gray-900 sm:text-[15px]"
                  placeholder="Tell us a bit about your project"
                />
              </div>

              <button
                type="submit"
                className="rounded-full bg-[#111827] px-6 py-3 text-[13px] font-medium text-white transition-colors duration-300 hover:bg-[#1f2937] sm:text-[14px]"
              >
                Send message
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
