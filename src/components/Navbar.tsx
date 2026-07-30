import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { NAV_LINKS } from "../data/nav";
import RollButton from "./RollButton";
import MobileMenu from "./MobileMenu";

const SCROLL_THRESHOLD = 40;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

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
              to="/"
              className={`shrink-0 text-[16px] font-bold tracking-tight text-[#111827] transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] sm:text-[18px] ${
                scrolled ? "ml-0" : "ml-2 sm:ml-3"
              }`}
            >
              MEMMIC
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-[14px] text-gray-900 transition-colors duration-300 hover:text-gray-500"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <RollButton
              to="/contact"
              label="Book a consultation"
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
