import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface RollButtonProps {
  label: string;
  buttonClassName: string;
  circleClassName: string;
  arrowClassName?: string;
  arrowSize?: number;
  to?: string;
}

export default function RollButton({
  label,
  buttonClassName,
  circleClassName,
  arrowClassName = "",
  arrowSize = 14,
  to,
}: RollButtonProps) {
  const content = (
    <>
      <span className="block h-[20px] overflow-hidden">
        <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
          <span className="flex h-[20px] items-center leading-none">
            {label}
          </span>
          <span className="flex h-[20px] items-center leading-none">
            {label}
          </span>
        </span>
      </span>
      <span
        className={`flex shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45 ${circleClassName}`}
      >
        <ArrowRight size={arrowSize} className={arrowClassName} />
      </span>
    </>
  );

  const className = `group inline-flex items-center transition-colors duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${buttonClassName}`;

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className}>
      {content}
    </button>
  );
}
