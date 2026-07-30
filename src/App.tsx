import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import CaseStudies from "./components/CaseStudies";
import EmmicModel from "./components/EmmicModel";
import Values from "./components/Values";
import AboutPage from "./components/AboutPage";
import WhatWeDoPage from "./components/WhatWeDoPage";
import StudioPage from "./components/StudioPage";
import ContactPage from "./components/ContactPage";
import SiteFooter from "./components/SiteFooter";

function Home() {
  return (
    <>
      <Hero />
      <About />
      <CaseStudies />
      <EmmicModel />
      <Values />
    </>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/what-we-do" element={<WhatWeDoPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <SiteFooter />
    </>
  );
}

export default App;
