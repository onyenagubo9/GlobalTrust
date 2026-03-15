"use client";

import { motion, Variants } from "framer-motion";
import { ShieldCheck, Lock, Phone } from "lucide-react";
import Image from "next/image";

export default function Security() {
  // Variants (TS-safe: avoid numeric easing arrays in variants)
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.14 } },
  };

  const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  return (
    <section
      id="security"
      aria-labelledby="security-heading"
      className="relative bg-white py-20"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 items-center"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Left: Text */}
          <motion.div variants={fadeInLeft}>
            <h3 id="security-heading" className="text-3xl font-semibold text-gray-900">
              Your <span className="text-green-600">Security</span>, Our Priority
            </h3>

            <motion.p
              variants={item}
              className="mt-4 text-gray-600 leading-relaxed max-w-xl"
            >
              We protect your money with industry-grade encryption, real-time
              fraud monitoring, and biometric security features — so you’re always in control.
            </motion.p>

            <motion.ul className="mt-8 space-y-3 text-sm text-gray-700">
              <motion.li
                variants={item}
                className="flex items-center gap-3 bg-white/50 p-3 rounded-lg border border-emerald-50"
              >
                <span className="p-2 rounded-md bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                </span>
                <span>Bank-grade encryption (TLS 1.3) & secure key management</span>
              </motion.li>

              <motion.li
                variants={item}
                className="flex items-center gap-3 bg-white/50 p-3 rounded-lg border border-emerald-50"
              >
                <span className="p-2 rounded-md bg-emerald-50 text-emerald-600">
                  <Lock className="w-5 h-5" aria-hidden="true" />
                </span>
                <span>Two-factor & biometric authentication for every login</span>
              </motion.li>

              <motion.li
                variants={item}
                className="flex items-center gap-3 bg-white/50 p-3 rounded-lg border border-emerald-50"
              >
                <span className="p-2 rounded-md bg-emerald-50 text-emerald-600">
                  <Phone className="w-5 h-5" aria-hidden="true" />
                </span>
                <span>Instant card freeze and transaction alerts via mobile</span>
              </motion.li>
            </motion.ul>
          </motion.div>

          {/* Right: Image (from /public/images/security.jpg) */}
          <motion.div
            className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg"
            variants={fadeInRight}
          >
            <div className="relative w-full h-full">
              <Image
                src="/bg-hero.jpg" // <- put your file at /public/images/security.jpg
                alt="Bank staff reviewing security systems in an office"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
              {/* subtle green overlay for brand consistency */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-emerald-900/30 via-transparent to-emerald-700/10 pointer-events-none"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
