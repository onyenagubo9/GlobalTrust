"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  Activity,
  DollarSign,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, cards: 0, tx: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const cardsSnap = await getDocs(collection(db, "cards"));
        const txSnap = await getDocs(collection(db, "transactions"));

        setStats({
          users: usersSnap.size,
          cards: cardsSnap.size,
          tx: txSnap.size,
        });
      } catch (error) {
        console.error("Error loading admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const items = [
    { label: "Total Users", value: stats.users, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Cards Issued", value: stats.cards, icon: CreditCard, color: "bg-purple-50 text-purple-600" },
    { label: "Transactions", value: stats.tx, icon: Activity, color: "bg-green-50 text-green-600" },
  ];

  const quickLinks = [
    {
      title: "Deposit Management",
      desc: "View and process all user deposit requests.",
      icon: DollarSign,
      href: "/admin/deposit",
      color: "bg-green-100 text-green-700",
      hover: "hover:bg-green-200",
    },
    {
      title: "Support Chat",
      desc: "Respond to messages from users in real-time.",
      icon: MessageCircle,
      href: "/admin/support",
      color: "bg-blue-100 text-blue-700",
      hover: "hover:bg-blue-200",
    },
    {
      title: "KYC Management",
      desc: "Review and approve users’ verification documents.",
      icon: ShieldCheck,
      href: "/admin/kyc",
      color: "bg-yellow-100 text-yellow-700",
      hover: "hover:bg-yellow-200",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">
            Admin Dashboard
          </h1>
          <p className="text-gray-500">
            Welcome back 👋 — Manage users, cards, and transactions efficiently.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {items.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex items-center transition"
            >
              <div
                className={`p-3 rounded-xl ${item.color} mr-4`}
              >
                <item.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {loading ? "..." : item.value}
                </h2>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className={`p-6 rounded-2xl border border-gray-100 bg-white shadow-sm transition-all ${link.hover}`}
              >
                <Link
                  href={link.href}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className={`p-3 rounded-full mr-4 ${link.color}`}
                    >
                      <link.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{link.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
