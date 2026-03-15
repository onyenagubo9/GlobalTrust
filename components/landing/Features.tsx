"use client";

import { motion, Variants } from "framer-motion";
import FeatureCard from "./FeatureCard";
import { ShieldCheck, CreditCard, Globe } from "lucide-react";

/**
 * TypeScript-safe Features.tsx
 * - No numeric arrays passed to `ease` inside Variants (avoids TS2322)
 * - Uses `duration` only for variant transitions
 * - Adds hover micro-interactions with spring transitions
 */

export default function Features() {
  // Container: stagger children
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.18 },
    },
  };

  // Card variants: duration only (TS-safe)
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }, // <-- no `ease` array here
    },
  };

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative max-w-7xl mx-auto px-6 py-20 overflow-hidden"
    >
      {/* Soft background gradient */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-linear-to-b from-white via-emerald-50/60 to-white" />
      </div>

      {/* Heading */}
      <motion.div
        className="relative text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }} // duration only — TS-safe
        viewport={{ once: true, amount: 0.4 }}
      >
        <h3 id="features-heading" className="text-4xl font-extrabold text-gray-900">
          Our <span className="text-green-600">Key Features</span>
        </h3>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          Discover intelligent tools crafted to simplify your modern banking
          experience — secure, fast, and designed for real people.
        </p>
      </motion.div>

      {/* Cards grid */}
      <motion.div
        className="relative mt-12 grid gap-8 md:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 220 }}
        >
          <FeatureCard
            title="Secure Accounts"
            desc="Multi-layer encryption, continuous monitoring, and instant alerts to keep your money safe."
            icon={<ShieldCheck className="h-7 w-7 text-green-600" aria-hidden="true" />}
          />
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 220 }}
        >
          <FeatureCard
            title="Smart Cards"
            desc="Create virtual cards, set limits, and freeze/replace cards instantly from your dashboard."
            icon={<CreditCard className="h-7 w-7 text-green-600" aria-hidden="true" />}
          />
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 220 }}
        >
          <FeatureCard
            title="Global Transfers"
            desc="Fast international transfers with clear, low fees and transparent exchange rates."
            icon={<Globe className="h-7 w-7 text-green-600" aria-hidden="true" />}
          />
        </motion.div>
      </motion.div>

      {/* Decorative shapes */}
      <motion.div
        aria-hidden="true"
        className="absolute top-8 -left-20 w-72 h-72 rounded-full blur-3xl bg-green-200/30"
        animate={{ x: [0, 20, -20, 0], y: [0, -8, 8, 0] }}
        transition={{ duration: 12, repeat: Infinity }} // no custom easing
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 -right-20 w-64 h-64 rounded-full blur-3xl bg-emerald-200/30"
        animate={{ x: [0, -24, 24, 0], y: [0, 8, -8, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
      />
    </section>
  );
}
