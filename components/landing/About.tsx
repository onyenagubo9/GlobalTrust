"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Users, Globe, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="bg-linear-to-b from-white to-green-50 text-gray-800 overflow-hidden">
      {/* 🟢 Hero Section */}
      <section className="relative py-24 px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <h1 className="text-5xl font-extrabold text-green-700 leading-tight drop-shadow-sm">
            About <span className="text-emerald-400">GlobalTrust Bank</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Empowering people with smart, secure, and modern digital banking solutions built for the future.
          </p>
        </motion.div>

        {/* Animated background glow */}
        <motion.div
          className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-175 h-175 bg-green-300/30 rounded-full blur-3xl -z-10"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>

      {/* 🌍 Mission Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-green-700 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            We believe banking should be transparent, accessible, and empowering.
            At GlobalTrust, we’re redefining what it means to manage money —
            blending innovation with trust to help you achieve financial freedom.
          </p>
          <p className="text-gray-600">
            From simple transactions to global transfers, our mission is to
            provide seamless digital tools that simplify every part of your financial life.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <Image
            src="/royalty.webp" // add image in /public/images/
            alt="Honstinger mission teamwork"
            width={500}
            height={400}
            className="rounded-2xl shadow-lg object-cover"
          />
        </motion.div>
      </section>

      {/* 🧭 Values Section */}
      <section className="bg-green-700 text-white py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-3">Our Core Values</h2>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Built on a foundation of integrity, innovation, and inclusion — our values guide every decision we make.
          </p>
        </motion.div>

        {/* Value Cards */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "Trust & Security",
              desc: "Your privacy and safety are our top priorities. We use world-class encryption for peace of mind.",
              icon: <ShieldCheck className="w-8 h-8 text-emerald-300" />,
            },
            {
              title: "Innovation",
              desc: "We continually evolve to deliver smarter tools and faster services that simplify your life.",
              icon: <Sparkles className="w-8 h-8 text-emerald-300" />,
            },
            {
              title: "Community",
              desc: "Our mission extends beyond banking — we support people, families, and small businesses everywhere.",
              icon: <Users className="w-8 h-8 text-emerald-300" />,
            },
            {
              title: "Global Reach",
              desc: "GlobalTrust enables effortless international banking — because your money should move as freely as you do.",
              icon: <Globe className="w-8 h-8 text-emerald-300" />,
            },
          ].map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              <div className="flex justify-center mb-4">{value.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                {value.title}
              </h3>
              <p className="text-emerald-100 text-sm">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 💚 Call-to-Action Section */}
      <section className="relative bg-linear-to-r from-green-600 to-emerald-500 text-white py-20 px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-4"
        >
          Join Thousands of Happy Customers
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-lg mb-8 text-green-100"
        >
          Experience a simpler, smarter, and more secure way to bank with GlobalTrust.
        </motion.p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link
            href="/signup"
            className="bg-white text-green-700 font-semibold px-8 py-4 rounded-md shadow-md hover:bg-green-50 transition"
          >
            Get Started Today
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
