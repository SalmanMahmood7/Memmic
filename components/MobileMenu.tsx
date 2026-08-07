"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { NAV_LINKS } from "@/data/nav";
import RollButton from "./RollButton";

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [openLabel, setOpenLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setOpenLabel(null);
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        data-lenis-prevent
        className={`absolute bottom-0 left-0 right-0 mx-3 mb-3 max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <nav className="mb-8 flex flex-col gap-1">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <div key={link.label}>
                <div className="flex items-center justify-between">
                  <Link
                    href={link.to}
                    onClick={onClose}
                    className="py-1 text-[28px] font-medium text-gray-900 sm:text-[32px]"
                  >
                    {link.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenLabel((prev) =>
                        prev === link.label ? null : link.label,
                      )
                    }
                    aria-label={`Toggle ${link.label} submenu`}
                    className="p-2 text-gray-500"
                  >
                    <ChevronDown
                      size={22}
                      className={`transition-transform duration-300 ${
                        openLabel === link.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openLabel === link.label
                      ? "max-h-60 pb-2 pt-1"
                      : "max-h-0"
                  }`}
                >
                  <div className="flex flex-col gap-1 pl-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.to}
                        onClick={onClose}
                        className="py-1.5 text-[17px] text-gray-500 transition-colors duration-300 hover:text-gray-900"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.to}
                onClick={onClose}
                className="py-1 text-[28px] font-medium text-gray-900 sm:text-[32px]"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <RollButton
          to="/contact"
          label="Start a project"
          buttonClassName="bg-[#111827] hover:bg-[#1f2937] text-white text-[13px] font-medium rounded-full pl-5 pr-2 py-2 gap-8 w-full justify-between"
          circleClassName="bg-white w-7 h-7"
          arrowClassName="text-[#111827]"
        />
      </div>
    </div>
  );
}
