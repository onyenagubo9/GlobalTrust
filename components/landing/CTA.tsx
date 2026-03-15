"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function CTA() {
  return (
    <motion.section
      id="cta"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="relative overflow-hidden text-white py-20"
    >
      {/* 🏦 Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg-hero.jpg" // ✅ Your image from /public/images/
          alt="Bank staff working together in a modern office"
          fill
          priority
          quality={90}
          className="object-cover object-center"
        />
        {/* 🟢 Fixed green overlay (no fading) */}
        <div className="absolute inset-0 bg-linear-to-r from-emerald-900/80 via-green-700/70 to-emerald-800/80" />
      </div>

      {/* 🌿 Floating decorative animation (still moving softly) */}
      <motion.div
        className="absolute -bottom-20 -right-20 w-96 h-96 bg-green-400/25 rounded-full blur-3xl"
        animate={{ x: [0, 30, -30, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ✨ Content */}
      <div className="relative max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        {/* Left text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h4 className="text-3xl md:text-4xl font-extrabold leading-snug drop-shadow-lg">
            Ready to experience{" "}
            <span className="text-emerald-300">modern banking</span>?
          </h4>
          <p className="mt-3 text-emerald-100 text-lg max-w-md">
            Open an account today and take full control of your finances with
            confidence and simplicity.
          </p>
        </motion.div>

        {/* Glowing Button */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Glowing ring around button (pulsing only) */}
          <motion.div
            className="absolute inset-0 rounded-md blur-lg bg-green-400/40"
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <Link
            href="/signup"
            className="relative inline-block bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-md shadow-lg hover:shadow-2xl transition-all"
          >
            Get Started
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
