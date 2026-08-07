"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Target,
  Settings2,
  Megaphone,
  Landmark,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/data/nav";
import RollButton from "./RollButton";
import MobileMenu from "./MobileMenu";

const CHILD_ICONS: Record<string, typeof Target> = {
  Evaluation: Target,
  Management: Settings2,
  Marketplace: Megaphone,
  Investment: Landmark,
};

const SCROLL_THRESHOLD = 40;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <>
      <div
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          scrolled
            ? "border-b border-gray-100 bg-white p-0 shadow-sm"
            : "bg-transparent p-2 sm:p-3"
        }`}
      >
        <nav
          className={`mx-auto flex max-w-[1440px] items-center justify-between gap-4 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:gap-6 lg:gap-10 ${
            scrolled
              ? "px-5 py-3 sm:px-8 lg:px-12"
              : "rounded-full bg-white p-[5px] shadow-lg"
          }`}
        >
          <div className="flex items-center gap-3 md:gap-8">
            <Link
              href="/"
              className={`shrink-0 text-[16px] font-bold tracking-tight text-[#111827] transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] sm:text-[18px] ${
                scrolled ? "ml-0" : "ml-2 sm:ml-3"
              }`}
            >
              MEMMIC
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div key={link.label} className="group relative">
                    <Link
                      href={link.to}
                      className="flex items-center gap-1 text-[14px] text-gray-900 transition-colors duration-300 hover:text-gray-500"
                    >
                      {link.label}
                      <ChevronDown
                        size={14}
                        className="transition-transform duration-300 group-hover:rotate-180"
                      />
                    </Link>

                    <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 ease-out group-hover:visible group-hover:opacity-100">
                      <div className="w-60 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                        {link.children.map((child) => {
                          const Icon = CHILD_ICONS[child.label];
                          return (
                            <Link
                              key={child.label}
                              href={child.to}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
                            >
                              {Icon && (
                                <Icon
                                  size={17}
                                  strokeWidth={1.5}
                                  className="shrink-0 text-gray-400"
                                />
                              )}
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={link.to}
                    className="text-[14px] text-gray-900 transition-colors duration-300 hover:text-gray-500"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <RollButton
              to="/signin"
              label="Sign in"
              buttonClassName="bg-[#111827] hover:bg-[#1f2937] text-white text-[13px] font-medium rounded-full pl-5 pr-2 py-2 gap-8"
              circleClassName="bg-white w-6 h-6"
              arrowClassName="text-[#111827]"
              arrowSize={12}
            />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full bg-[#111827] py-2 pl-4 pr-3 text-[13px] font-medium text-white md:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </nav>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
