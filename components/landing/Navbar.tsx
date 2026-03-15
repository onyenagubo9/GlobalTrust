"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Change background on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-linear-to-br from-green-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
            G
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Global Trust Bank</h1>
            <p className="text-xs text-gray-500 -mt-1">Modern banking redefined</p>
          </div>
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-green-600 transition">Home</Link>
          <Link href="/about" className="hover:text-green-600 transition">About</Link>
          <Link href="/features" className="hover:text-green-600 transition">Features</Link>
          <Link href="/pricing" className="hover:text-green-600 transition">Pricing</Link>
          <Link href="/contact" className="hover:text-green-600 transition">Contact</Link>

          <div className="flex items-center gap-2 ml-4">
            <Link
              href="/login"
              className="px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-100"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-md bg-linear-to-r from-green-600 to-emerald-500 text-white hover:opacity-95 transition"
            >
              Get started
            </Link>
          </div>
        </nav>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg animate-slideDown">
          <nav className="flex flex-col space-y-3 p-4 text-sm font-medium">
            <Link href="/" className="hover:text-green-600" onClick={() => setOpen(false)}>Home</Link>
            <Link href="/about" className="hover:text-green-600" onClick={() => setOpen(false)}>About</Link>
            <Link href="/features" className="hover:text-green-600" onClick={() => setOpen(false)}>Features</Link>
            <Link href="/pricing" className="hover:text-green-600" onClick={() => setOpen(false)}>Pricing</Link>
            <Link href="/contact" className="hover:text-green-600" onClick={() => setOpen(false)}>Contact</Link>

            <div className="border-t pt-3 mt-3 flex flex-col gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-center rounded-md border border-gray-200 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-center rounded-md bg-linear-to-r from-green-600 to-emerald-500 text-white hover:opacity-95"
                onClick={() => setOpen(false)}
              >
                Get started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
