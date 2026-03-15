"use client";

import { useState, useEffect } from "react";
import Sidebar from "../Dashboard/Sidebar";
import BottomNav from "../Dashboard/BottomNav";
import Loader from "../shared/Loader";

export default function DashboardLayout({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000); // simulate data load
    return () => clearTimeout(timeout);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>

      {/* Bottom navigation for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0">
        <BottomNav />
      </div>
    </div>
  );
}
