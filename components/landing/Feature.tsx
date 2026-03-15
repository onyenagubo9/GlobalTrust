"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, CreditCard, Globe, Smartphone, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
  const features = [
    {
      title: "Instant Global Transfers",
      desc: "Send money anywhere in seconds with ultra-low fees and complete transparency.",
      icon: <Globe className="w-8 h-8 text-green-600" />,
    },
    {
      title: "Virtual & Physical Cards",
      desc: "Manage multiple cards, set spending limits, and freeze cards instantly from your app.",
      icon: <CreditCard className="w-8 h-8 text-green-600" />,
    },
    {
      title: "Bank-Grade Security",
      desc: "Your transactions are protected by multi-layer encryption and 24/7 monitoring.",
      icon: <ShieldCheck className="w-8 h-8 text-green-600" />,
    },
    {
      title: "Smart Insights",
      desc: "Track your spending, set budgets, and get personalized savings recommendations.",
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
    },
    {
      title: "Mobile-First Experience",
      desc: "Designed for seamless banking on the go, with intuitive gestures and dark mode.",
      icon: <Smartphone className="w-8 h-8 text-green-600" />,
    },
    {
      title: "24/7 Support",
      desc: "Get instant help anytime from our friendly support team directly in the app.",
      icon: <Clock className="w-8 h-8 text-green-600" />,
    },
  ];

  return (
    <main className="bg-linear-to-b from-white via-green-50 to-white text-gray-800 overflow-hidden">
      {/* Hero Section */}
      <section className="text-center py-20 px-6 relative">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold text-green-700 mb-4"
        >
          Powerful Features for Smarter Banking
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-gray-600 max-w-2xl mx-auto"
        >
          Discover all the tools that make <span className="text-green-600 font-semibold">GlobalTrust</span> 
          the easiest and most secure way to manage your money.
        </motion.p>

        <motion.div
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-125 h-125 bg-green-200/30 rounded-full blur-3xl -z-10"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="p-8 bg-white rounded-2xl shadow-md hover:shadow-lg border border-green-100 hover:border-green-300 transition-all"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold text-green-700 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Visual Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-green-700 mb-4">
            Manage Everything in One App
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            The <span className="text-green-600 font-semibold">GlobalTrust</span> mobile app gives you full
            control over your finances — check balances, transfer money, manage cards, and receive insights,
            all from your fingertips.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-md font-semibold shadow hover:bg-green-700 transition"
          >
            Get Started
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <Image
            src="/bank.webp" // add this image in public/images/
            alt="firstcbu app dashboard preview"
            width={500}
            height={400}
            className="rounded-2xl shadow-lg object-cover"
          />
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-green-600 to-emerald-500 text-white text-center py-20 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-4"
        >
          Experience the Future of Banking
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-green-100 mb-8"
        >
          Create your account today and join thousands already banking with <strong>GlobalTrust</strong>.
        </motion.p>
        <Link
          href="/signup"
          className="inline-block bg-white text-green-700 font-semibold px-8 py-4 rounded-md shadow-md hover:bg-green-50 transition"
        >
          Get Started
        </Link>
      </section>
    </main>
  );
}
