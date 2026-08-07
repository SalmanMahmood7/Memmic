"use client";

import { useEffect } from "react";
import { initSmoothScroll, destroySmoothScroll } from "../lib/smoothScroll";

export default function SmoothScroll() {
  useEffect(() => {
    initSmoothScroll();
    return () => destroySmoothScroll();
  }, []);

  return null;
}
