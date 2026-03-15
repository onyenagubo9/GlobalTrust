"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, X } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      desc: "Perfect for personal use and simple banking needs.",
      features: [
        "No monthly fees",
        "Instant transfers",
        "Virtual debit card",
        "24/7 support",
      ],
      notIncluded: ["Multi-currency accounts", "Priority support"],
      button: "Get Started",
      popular: false,
    },
    {
      name: "Premium",
      price: "$9.99/mo",
      desc: "For users who want faster, smarter, and more flexible banking.",
      features: [
        "All Starter features",
        "Multi-currency wallets",
        "Advanced analytics",
        "Priority customer support",
      ],
      notIncluded: ["Business tools"],
      button: "Upgrade Now",
      popular: true,
    },
    {
      name: "Business",
      price: "$29.99/mo",
      desc: "Advanced tools for teams and entrepreneurs.",
      features: [
        "All Premium features",
        "Team accounts",
        "Bulk payments",
        "API integrations",
      ],
      notIncluded: [],
      button: "Get Business Plan",
      popular: false,
    },
  ];

  const comparison = [
    {
      feature: "Instant Transfers",
      starter: true,
      premium: true,
      business: true,
    },
    {
      feature: "Virtual Debit Cards",
      starter: true,
      premium: true,
      business: true,
    },
    {
      feature: "Multi-Currency Wallets",
      starter: false,
      premium: true,
      business: true,
    },
    {
      feature: "Advanced Analytics",
      starter: false,
      premium: true,
      business: true,
    },
    {
      feature: "Team Accounts",
      starter: false,
      premium: false,
      business: true,
    },
    {
      feature: "Priority Support",
      starter: false,
      premium: true,
      business: true,
    },
    {
      feature: "API Integrations",
      starter: false,
      premium: false,
      business: true,
    },
  ];

  return (
    <main className="bg-linear-to-b from-white via-green-50 to-white text-gray-800 overflow-hidden">
      {/* 🌿 Hero Section */}
      <section className="text-center py-24 px-6 relative">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold text-green-700 mb-4"
        >
          Choose the Plan That Fits You
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-gray-600 max-w-2xl mx-auto"
        >
          Simple and transparent pricing for individuals, professionals, and teams.
        </motion.p>

        <motion.div
          className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-200/30 rounded-full blur-3xl -z-10"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>

      {/* 💸 Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`relative p-8 rounded-3xl border shadow-md transition-all duration-300 ${
              plan.popular
                ? "border-green-500 bg-linear-to-b from-white to-green-50 shadow-green-200"
                : "border-gray-200 bg-white"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 right-4 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                Most Popular
              </div>
            )}

            <h3 className="text-2xl font-bold text-green-700">{plan.name}</h3>
            <p className="text-gray-500 mt-2 mb-6">{plan.desc}</p>
            <div className="text-4xl font-extrabold text-green-700 mb-6">
              {plan.price}
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-600" />
                  {feature}
                </li>
              ))}
              {plan.notIncluded.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-gray-400 line-through"
                >
                  <X className="w-5 h-5 text-gray-400" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className={`block w-full text-center py-3 rounded-lg font-semibold transition-all duration-300 ${
                plan.popular
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-100 text-green-700 hover:bg-green-100"
              }`}
            >
              {plan.button}
            </Link>
          </motion.div>
        ))}
      </section>

      {/* 📊 Comparison Table */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-green-700 text-center mb-8"
        >
          Compare All Plans
        </motion.h2>

        <div className="overflow-x-auto rounded-2xl shadow-md border border-green-100 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-green-100 text-green-700 font-semibold">
              <tr>
                <th className="px-6 py-4">Features</th>
                <th className="px-6 py-4 text-center">Starter</th>
                <th className="px-6 py-4 text-center">Premium</th>
                <th className="px-6 py-4 text-center">Business</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((item, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-100 hover:bg-green-50/40 transition"
                >
                  <td className="px-6 py-4 font-medium">{item.feature}</td>
                  <td className="text-center px-6 py-4">
                    {item.starter ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                  <td className="text-center px-6 py-4">
                    {item.premium ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                  <td className="text-center px-6 py-4">
                    {item.business ? (
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 🏢 Enterprise Plan */}
      <section className="bg-green-700 text-white py-20 text-center px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-4"
        >
          Need a Custom Enterprise Plan?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-green-100 mb-8"
        >
          Large teams or fintech partners can request a tailored solution with custom limits,
          APIs, and dedicated support.
        </motion.p>
        <Link
          href="/contact"
          className="inline-block bg-white text-green-700 font-semibold px-8 py-4 rounded-md shadow-md hover:bg-green-50 transition"
        >
          Contact Sales
        </Link>
      </section>
    </main>
  );
}
