"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, CreditCard, Banknote } from "lucide-react";

export default function AnimatedHero() {
  const words = [
    "Banking that’s simple, secure & built for you.",
    "Your money. Your control. Your future.",
    "Modern banking for modern people.",
  ];

  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);
  const [speed, setSpeed] = useState(120);

  // Typewriter effect logic
  useEffect(() => {
    const currentWord = words[index];
    if (!deleting && subIndex === currentWord.length) {
      setTimeout(() => setDeleting(true), 1500);
      return;
    }
    if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }
    const timeout = setTimeout(
      () => setSubIndex((prev) => prev + (deleting ? -1 : 1)),
      deleting ? 50 : speed
    );
    return () => clearTimeout(timeout);
  }, [subIndex, deleting, index]);

  // Cursor blinking effect
  useEffect(() => {
    const blinkTimeout = setTimeout(() => setBlink((prev) => !prev), 500);
    return () => clearTimeout(blinkTimeout);
  }, [blink]);

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[80vh] px-6 text-center text-white overflow-hidden"
      style={{
        backgroundImage: "url('/bg-hero.jpg')", // ✅ from /public folder
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Floating animated icons */}
      <motion.div
        className="absolute top-10 left-10 hidden sm:flex flex-col gap-6 text-green-400"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <ShieldCheck className="w-10 h-10 animate-bounce" />
        <CreditCard className="w-10 h-10 animate-pulse" />
        <Banknote className="w-10 h-10 animate-spin-slow" />
      </motion.div>

      {/* Animated text */}
      <div className="relative z-10 mt-10 sm:mt-0">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-snug mb-4"
        >
          {words[index].substring(0, subIndex)}
          <span
            className={`text-green-400 ${blink ? "opacity-100" : "opacity-0"}`}
          >
            |
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-gray-200 max-w-2xl mx-auto text-base sm:text-lg md:text-xl"
        >
          Experience world-class digital banking with real-time control,
          security, and simplicity.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-4"
        >
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all">
            Get Started
          </button>
          <button className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Learn More
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// Optional: Add slow-spin animation in globals.css
// .animate-spin-slow {
//   animation: spin 6s linear infinite;
// }
