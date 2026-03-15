"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Is my money safe with Global Trust Bank?",
    answer:
      "Absolutely. Your funds are protected with advanced encryption, biometric authentication, and 24/7 fraud monitoring. We’re also insured and regulated to meet all banking compliance standards.",
  },
  {
    question: "Do I need to visit a branch to open an account?",
    answer:
      "No physical branch visits are required. You can open your account online in just minutes with a valid ID and a few quick verification steps.",
  },
  {
    question: "Are there any hidden fees?",
    answer:
      "Never. Our pricing is fully transparent—no surprise charges, overdraft fees, or maintenance costs. You’ll always know what you’re paying for.",
  },
  {
    question: "Can I use my card internationally?",
    answer:
      "Yes! Our debit and virtual cards work globally. You can spend in any supported currency with low foreign exchange fees and instant notifications.",
  },
  {
    question: "How fast are transfers?",
    answer:
      "Domestic transfers happen instantly between GreenHarbor users. External and international transfers usually complete within minutes to hours, depending on the destination bank.",
  },
];

export default function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faqs"
      className="relative max-w-5xl mx-auto px-6 py-24 overflow-hidden"
    >
      {/* 🌿 Background gradient */}
      <div
        className="absolute inset-0 -z-10 bg-linear-to-b from-white via-emerald-50/60 to-white"
        aria-hidden="true"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-extrabold text-gray-900">
          Frequently Asked <span className="text-green-600">Questions</span>
        </h2>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          Got questions? We’ve got answers. Everything you need to know about
          banking with GlobalTrust.
        </p>
      </motion.div>

      {/* FAQ Accordion */}
      <div className="space-y-6">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="border border-emerald-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex justify-between items-center text-left p-5"
              >
                <span className="font-semibold text-gray-900 text-lg">
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-green-600 shrink-0 ml-4"
                >
                  <ChevronDown size={22} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-5 pb-5 text-gray-600 leading-relaxed text-base"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Floating glow effects */}
      <motion.div
        aria-hidden="true"
        className="absolute -top-10 -left-20 w-80 h-80 bg-green-200/30 rounded-full blur-3xl"
        animate={{ x: [0, 25, -25, 0], y: [0, -15, 15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 -right-20 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl"
        animate={{ x: [0, -20, 20, 0], y: [0, 10, -10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </section>
  );
}
