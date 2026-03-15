"use client";

import { motion } from "framer-motion";
import PriceCard from "./PriceCard";

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative max-w-7xl mx-auto px-6 py-24 overflow-hidden"
    >
      {/* ✅ Background gradient */}
      <div
        className="absolute inset-0 -z-10 bg-linear-to-b from-white via-emerald-50/50 to-white"
        aria-hidden="true"
      />

      {/* 💚 Heading */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <h3 className="text-4xl font-extrabold text-gray-900">
          Simple <span className="text-green-600">Pricing</span>
        </h3>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          No hidden fees. No surprises. Choose a plan that grows with you.
        </p>
      </motion.div>

      {/* 💳 Pricing Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        viewport={{ once: true }}
        className="relative mt-16 grid gap-8 md:grid-cols-3"
      >
        <PriceCard
          title="Personal"
          price="Free"
          features={[
            "Checking & Savings accounts",
            "Virtual card",
            "Instant transfers",
          ]}
        />

        <PriceCard
          title="Pro"
          price="$9/mo"
          features={[
            "All Personal features",
            "No FX fees",
            "Priority support",
          ]}
          featured
        />

        <PriceCard
          title="Business"
          price="$49/mo"
          features={[
            "Multi-user access",
            "Advanced permissions",
            "API integrations",
          ]}
        />
      </motion.div>

      {/* Decorative shapes for depth */}
      <motion.div
        aria-hidden="true"
        className="absolute -left-16 top-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl"
        animate={{ x: [0, 30, -30, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 -right-20 w-64 h-64 bg-emerald-200/40 rounded-full blur-3xl"
        animate={{ x: [0, -25, 25, 0], y: [0, -15, 15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </section>
  );
}
