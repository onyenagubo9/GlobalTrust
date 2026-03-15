"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Banknote,
  Globe2,
  CreditCard,
  ArrowLeftRight,
  Send,
} from "lucide-react";

const transferOptions = [
  {
    title: "Bank Transfer",
    description: "Send money to other Honstinger accounts instantly.",
    icon: <Banknote className="w-6 h-6" />,
    color: "bg-green-600",
    hover: "hover:bg-green-700",
    href: "/dashboard/transfer/bank",
  },
  {
    title: "International Transfer",
    description: "Transfer funds to banks around the world.",
    icon: <Globe2 className="w-6 h-6" />,
    color: "bg-blue-500",
    hover: "hover:bg-blue-600",
    href: "/dashboard/transfer/international",
  },
  {
    title: "Card-to-Card Transfer",
    description: "Move funds directly to another debit or credit card.",
    icon: <CreditCard className="w-6 h-6" />,
    color: "bg-indigo-500",
    hover: "hover:bg-indigo-600",
    href: "/dashboard/transfer/card",
  },
  {
    title: "Between My Accounts",
    description: "Transfer between your own Honstinger accounts.",
    icon: <ArrowLeftRight className="w-6 h-6" />,
    color: "bg-emerald-500",
    hover: "hover:bg-emerald-600",
    href: "/dashboard/transfer/internal",
  },
];

export default function TransferHub() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Send className="w-6 h-6 text-green-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Transfer Money</h1>
        </div>
        <p className="text-gray-500 text-sm mb-8">
          Choose a transfer option below.
        </p>

        {/* Transfer Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {transferOptions.map((option, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white"
            >
              <Link href={option.href}>
                <div
                  className={`flex items-center space-x-3 p-5 ${option.hover} transition`}
                >
                  <div
                    className={`p-3 rounded-full text-white ${option.color} shadow-sm`}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="text-gray-800 font-semibold text-sm sm:text-base">
                      {option.title}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link
            href="/dashboard"
            className="text-green-600 hover:underline text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
