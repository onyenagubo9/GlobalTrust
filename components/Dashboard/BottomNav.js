"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, CreditCard, Wallet, Settings } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", icon: Home, href: "/dashboard" },
    { name: "History", icon: Clock, href: "/history" },
    { name: "Cards", icon: CreditCard, href: "/cards" },
    { name: "Wallet", icon: Wallet, href: "/wallet" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <nav
      className="
        fixed bottom-0 left-0 w-full 
        bg-white/90 backdrop-blur-md
        border-t border-gray-200 shadow-lg 
        flex justify-around items-center py-3
        z-50 transition-all
      "
    >
      {navItems.map((item, i) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={i}
            href={item.href}
            className={`flex flex-col items-center transition-all ${
              isActive
                ? "text-green-600"
                : "text-gray-600 hover:text-green-700"
            }`}
          >
            <item.icon
              className={`w-5 h-5 transition-transform ${
                isActive ? "scale-110" : "scale-100"
              }`}
            />
            <span
              className={`text-[11px] font-medium mt-1 ${
                isActive ? "font-semibold" : ""
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
