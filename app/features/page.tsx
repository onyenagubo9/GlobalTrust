"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import Faqs from "@/components/landing/Faqs";
import About from "@/components/landing/About";
import Loader from "@/components/shared/Loader";
import FeaturesPage from "@/components/landing/Feature";


export default function AboutPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let fallbackTimer: NodeJS.Timeout | null = null;

    // If the page is already loaded, hide the loader soon
    if (document.readyState === "complete") {
      fallbackTimer = setTimeout(() => setLoading(false), 3000);
      return () => {
        if (fallbackTimer) clearTimeout(fallbackTimer);
      };
    }

    const onLoad = () => {
      fallbackTimer = setTimeout(() => setLoading(false), 300);
    };

    window.addEventListener("load", onLoad);

    // Safety fallback: ensure loader hides after 3s
    const forcedHide = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => {
      window.removeEventListener("load", onLoad);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      clearTimeout(forcedHide);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900 antialiased relative">
      {/* ✅ Loader Overlay */}
      {loading && (
        <div
          aria-hidden={!loading}
          className="fixed inset-0 z-9999 flex items-center justify-center bg-white/90 backdrop-blur-md transition-opacity duration-300"
        >
          <Loader />
        </div>
      )}

      {/* ✅ Page Content */}
      <div className={loading ? "pointer-events-none select-none" : ""}>
        <Navbar />
        <FeaturesPage/>
        
        <Footer />
      </div>
    </main>
  );
}
