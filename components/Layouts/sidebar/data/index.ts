import * as Icons from "../icons";
import type { JSX, SVGProps } from "react";

export type NavItem = {
  title: string;
  url?: string;
  icon?: any;
  items?: { title: string; url: string; items?: any[] }[];
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const NAV_DATA_ADMIN: NavSection[] = [
  {
    label: "ADMINISTRATION",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        url: "/admin"
      },
      // {
      //   title: "User Management",
      //   icon: Icons.User,
      //   url: "/admin/users"
      // },
      {
        title: "General Client Messages",
        icon: Icons.Calendar,
        url: "/admin/general/messages"
      },
      // {
      //   title: "Client Messages",
      //   icon: Icons.Calendar,
      //   url: "/admin/messages"
      // },
      {
        title: "Client Enquiries",
        icon: Icons.Calendar,
        url: "/admin/client-messages"
      },
      {
        title: "Client Portal Accounts",
        icon: Icons.User,
        url: "/admin/clients"
      },
      {
        title: "Portal Dashboards",
        icon: Icons.Table,
        url: "/admin/portal-dashboards"
      },
      {
        title: "Enquiry Categories",
        icon: Icons.Calendar,
        url: "/admin/enquiry-categories"
      },
      // {
      //   title: "System Logs",
      //   icon: Icons.FourCircle,
      //   url: "/admin/system-logs"
      // },
      // {
      //   title: "Settings",
      //   icon: Icons.Authentication,
      //   url: "/admin/settings"
      // }
    ],
  },
];

export const NAV_DATA_INVESTOR: NavSection[] = [
  {
    label: "INVESTOR PORTAL",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        url: "/investor"
      },
      {
        title: "Portfolio",
        icon: Icons.PieChart,
        url: "/investor/portfolio"
      },
      {
        title: "Investments",
        icon: Icons.FourCircle,
        url: "/investor/investments"
      },
      {
        title: "Analytics",
        icon: Icons.Table,
        url: "/investor/analytics"
      },
      {
        title: "Messages",
        icon: Icons.Calendar,
        url: "/investor/messages"
      }
    ],
  },
];

export const NAV_DATA_MANAGER: NavSection[] = [
  {
    label: "OPERATIONS",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        url: "/manager"
      },
      {
        title: "Approvals",
        icon: Icons.Authentication,
        url: "/manager/approvals"
      },
      {
        title: "Team Tasks",
        icon: Icons.Table,
        url: "/manager/tasks"
      },
      {
        title: "Reports",
        icon: Icons.FourCircle,
        url: "/manager/reports"
      },
      {
        title: "Settings",
        icon: Icons.Authentication,
        url: "/manager/settings"
      }
    ],
  },
];

export const NAV_DATA_CLIENT_EVALUATION: NavSection[] = [
  {
    label: "EVALUATION PORTAL",
    items: [
      { title: "My Services", icon: Icons.HomeIcon, url: "/portal" },
      { title: "Dashboard", icon: Icons.HomeIcon, url: "/portal/evaluation" },
      { title: "My Evaluation", icon: Icons.FourCircle, url: "/portal/evaluation/status" },
      { title: "Reports", icon: Icons.Table, url: "/portal/evaluation/reports" },
      { title: "Messages", icon: Icons.Calendar, url: "/portal/evaluation/messages" },
      { title: "Settings", icon: Icons.Authentication, url: "/portal/evaluation/settings" },
    ],
  },
];

export const NAV_DATA_CLIENT_INVESTMENT: NavSection[] = [
  {
    label: "INVESTMENT PORTAL",
    items: [
      { title: "My Services", icon: Icons.HomeIcon, url: "/portal" },
      { title: "Dashboard", icon: Icons.HomeIcon, url: "/portal/investment" },
      { title: "My Investment", icon: Icons.PieChart, url: "/portal/investment/status" },
      { title: "Documents", icon: Icons.Table, url: "/portal/investment/documents" },
      { title: "Messages", icon: Icons.Calendar, url: "/portal/investment/messages" },
      { title: "Settings", icon: Icons.Authentication, url: "/portal/investment/settings" },
    ],
  },
];

export const NAV_DATA_CLIENT_MARKETPLACE: NavSection[] = [
  {
    label: "MARKET PLACE PORTAL",
    items: [
      { title: "My Services", icon: Icons.HomeIcon, url: "/portal" },
      { title: "Dashboard", icon: Icons.HomeIcon, url: "/portal/marketplace" },
      { title: "Marketplace", icon: Icons.FourCircle, url: "/portal/marketplace/market" },
      { title: "Listings", icon: Icons.Table, url: "/portal/marketplace/listings" },
      { title: "Messages", icon: Icons.Calendar, url: "/portal/marketplace/messages" },
      { title: "Settings", icon: Icons.Authentication, url: "/portal/marketplace/settings" },
    ],
  },
];

export const NAV_DATA_CLIENT_MANAGEMENT: NavSection[] = [
  {
    label: "MANAGEMENT PORTAL",
    items: [
      { title: "My Services", icon: Icons.HomeIcon, url: "/portal" },
      { title: "Dashboard", icon: Icons.HomeIcon, url: "/portal/management" },
      { title: "Operations", icon: Icons.FourCircle, url: "/portal/management/operations" },
      { title: "Projects", icon: Icons.Table, url: "/portal/management/projects" },
      { title: "Messages", icon: Icons.Calendar, url: "/portal/management/messages" },
      { title: "Settings", icon: Icons.Authentication, url: "/portal/management/settings" },
    ],
  },
];

export function getNavDataForRole(role: string | null): NavSection[] {
  const normalizedRole = role?.toLowerCase();
  
  switch (normalizedRole) {
    case "admin":
      return NAV_DATA_ADMIN;
    case "investor":
    case "invester":
      return NAV_DATA_INVESTOR;
    case "manager":
      return NAV_DATA_MANAGER;
    case "evaluation_client":
      return NAV_DATA_CLIENT_EVALUATION;
    case "investment_client":
      return NAV_DATA_CLIENT_INVESTMENT;
    case "marketplace_client":
      return NAV_DATA_CLIENT_MARKETPLACE;
    case "management_client":
      return NAV_DATA_CLIENT_MANAGEMENT;
    default:
      return [];
  }
}