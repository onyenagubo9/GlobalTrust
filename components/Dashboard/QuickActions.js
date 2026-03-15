"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Send,
  ArrowDownCircle,
  Receipt,
  CreditCard,
  Globe,
  HelpCircle,
  History,
  Link2,
} from "lucide-react";

const actions = [
  {
    title: "Transfer Funds",
    icon: <Send className="w-5 h-5" />,
    color: "bg-green-600",
    hover: "hover:bg-green-700",
    href: "/dashboard/transfer", // Link to transfer page
  },
  {
    title: "Deposit Money",
    icon: <ArrowDownCircle className="w-5 h-5" />,
    color: "bg-emerald-500",
    hover: "hover:bg-emerald-600",
    href: "/dashboard/deposit", // Link to deposit page
  },
  {
    title: "Pay Bills",
    icon: <CreditCard className="w-5 h-5" />,
    color: "bg-blue-500",
    hover: "hover:bg-blue-600",
    href: "/dashboard/bills", // Link to bills page
  },
  {
    title: "View Statements",
    icon: <Receipt className="w-5 h-5" />,
    color: "bg-indigo-500",
    hover: "hover:bg-indigo-600",
    href: "/dashboard/statements", // Link to statements page
  },
  {
    title: "Linked Accounts",
    icon: <Link2 className="w-5 h-5" />,
    color: "bg-yellow-500",
    hover: "hover:bg-yellow-600",
    href: "/dashboard/linked-accounts", // Link to linked accounts page
  },
  {
    title: "International Transfer",
    icon: <Globe className="w-5 h-5" />,
    color: "bg-purple-500",
    hover: "hover:bg-purple-600",
    href: "/dashboard/transfer/international", // Link to international transfer
  },
  {
    title: "Transaction History",
    icon: <History className="w-5 h-5" />,
    color: "bg-teal-500",
    hover: "hover:bg-teal-600",
    href: "/history", // Link to transaction history page
  },
  {
    title: "Help & Support",
    icon: <HelpCircle className="w-5 h-5" />,
    color: "bg-gray-500",
    hover: "hover:bg-gray-600",
    href: "/dashboard/support", // Link to support page
  },
];

export default function QuickActions() {
  return (
    <section className="mt-6">
      <h2 className="text-base font-semibold text-gray-800 mb-3">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <Link
              href={action.href}
              className={`flex flex-col items-center justify-center space-y-2 
                ${action.color} ${action.hover} text-white py-3 rounded-xl shadow-sm transition-all`}
            >
              <div className="p-2 bg-white/10 rounded-full">
                {action.icon}
              </div>
              <p className="text-xs font-medium text-center">
                {action.title}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
