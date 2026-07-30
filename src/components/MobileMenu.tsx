import { Link } from "react-router-dom";
import { NAV_LINKS } from "../data/nav";
import RollButton from "./RollButton";

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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
        className={`absolute bottom-0 left-0 right-0 mx-3 mb-3 rounded-2xl bg-white p-6 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <nav className="mb-8 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={onClose}
              className="py-1 text-[28px] font-medium text-gray-900 sm:text-[32px]"
            >
              {link.label}
            </Link>
          ))}
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
