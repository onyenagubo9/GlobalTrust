"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Database, Users, CreditCard, Settings, Activity } from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/admin", icon: Database },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Transactions", href: "/admin/transactions", icon: Activity },
    { name: "Cards", href: "/admin/cards", icon: CreditCard },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-5 flex flex-col justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-green-700 mb-8">Admin Panel</h1>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-green-100 text-green-700 font-semibold"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  <Link href={item.href}>{item.name}</Link>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
