"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * GlobalStats.tsx
 * - Animated counters
 * - Background image from /public/images/global-stats.jpg
 * - Framer Motion reveal (TS-safe)
 *
 * Place an image at: /public/images/global-stats.jpg
 */

type Stat = {
  id: string;
  label: string;
  value: number;
  suffix?: string;
};

const STATS: Stat[] = [
  { id: "users", label: "Active customers", value: 5200000, suffix: "+" },
  { id: "countries", label: "Countries served", value: 128 },
  { id: "volume", label: "Transactions processed", value: 87000000, suffix: "+" },
];

function formatNumber(n: number) {
  // compact display for large numbers, but show full for smaller
  if (n >= 1_000_000) return Intl.NumberFormat("en", { notation: "compact" }).format(n);
  return Intl.NumberFormat("en-US").format(n);
}

export default function GlobalStats() {
  const [counts, setCounts] = useState(() => STATS.map(() => 0));
  const startedRef = useRef(false);

  // animate function using requestAnimationFrame for smoothness
  useEffect(() => {
    let rafId: number | null = null;
    let startTime: number | null = null;
    const duration = 1500; // ms

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(1, elapsed / duration);

      // simple easeOutCubic
      const ease = 1 - Math.pow(1 - t, 3);

      setCounts(
        STATS.map((s, i) => {
          const v = Math.round(s.value * ease);
          return v;
        })
      );

      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        // ensure final values
        setCounts(STATS.map((s) => s.value));
        rafId = null;
      }
    }

    // start animation only once when component mounts (or could be tied to viewport)
    if (!startedRef.current) {
      startedRef.current = true;
      rafId = requestAnimationFrame(step);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section id="global-stats" className="relative py-20">
      {/* Background image (from public) */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg-hero.jpg" // <-- put image at /public/images/global-stats.jpg
          alt="Office and global banking operations"
          fill
          priority
          quality={90}
          className="object-cover object-center opacity-40"
        />
        {/* subtle green overlay for brand consistency */}
        <div className="absolute inset-0 bg-linear-to-b from-emerald-900/30 to-white/80 pointer-events-none" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Trusted around the world
          </h2>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Millions of customers trust GreenHarbor for secure, fast, and transparent banking.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.id}
              className="p-6 bg-white/90 rounded-2xl shadow-sm backdrop-blur-md text-center"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl sm:text-5xl font-extrabold text-green-600 leading-none">
                {formatNumber(counts[idx])}
                {stat.suffix && <span className="ml-1 text-xl text-gray-700">{stat.suffix}</span>}
              </div>
              <div className="mt-2 text-sm text-gray-700">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Optional small callout below */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <p className="text-gray-600 max-w-2xl mx-auto">
            Built for scale — from individual savers to global enterprises. <span className="text-green-600 font-semibold">Join millions</span> using GreenHarbor.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
