export interface NavChildLink {
  label: string;
  to: string;
}

export interface NavLink {
  label: string;
  to: string;
  children?: NavChildLink[];
}

export const NAV_LINKS: NavLink[] = [
  { label: "About", to: "/about" },
  {
    label: "What we do",
    to: "/what-we-do",
    children: [
      { label: "Evaluation", to: "/what-we-do/evaluation" },
      { label: "Management", to: "/what-we-do/management" },
      { label: "Marketplace", to: "/what-we-do/marketplace" },
      { label: "Investment", to: "/what-we-do/investment" },
    ],
  },
  { label: "Studio", to: "/studio" },
  { label: "Contact", to: "/contact" },
];
