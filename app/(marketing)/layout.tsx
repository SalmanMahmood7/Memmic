import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import ScrollToTop from "@/components/ScrollToTop";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SmoothScroll />
      <ScrollProgress />
      <ScrollToTop />
      <Navbar />
      {children}
      <SiteFooter />
    </>
  );
}
