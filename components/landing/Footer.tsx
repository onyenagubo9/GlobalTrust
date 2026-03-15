"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-linear-to-b from-white via-emerald-50/40 to-white border-t border-emerald-100">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10 text-sm">
        {/* Brand Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-md bg-linear-to-br from-green-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
              B
            </div>
            <div>
              <p className="font-semibold text-gray-900">Global Trust Bank</p>
              <p className="text-xs text-gray-600">Modern banking redefined</p>
            </div>
          </div>
          <p className="text-gray-600 text-xs leading-relaxed max-w-xs">
            Banking built for a digital world — simple, secure, and designed to
            help you grow your money with confidence.
          </p>

          {/* Social Links */}
          <div className="flex gap-4 mt-4">
            <Link
              href="#"
              className="text-emerald-600 hover:text-green-700 transition"
              aria-label="Facebook"
            >
              <Facebook size={18} />
            </Link>
            <Link
              href="#"
              className="text-emerald-600 hover:text-green-700 transition"
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </Link>
            <Link
              href="#"
              className="text-emerald-600 hover:text-green-700 transition"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </Link>
            <Link
              href="#"
              className="text-emerald-600 hover:text-green-700 transition"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </Link>
          </div>
        </motion.div>

        {/* Product Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h5 className="font-semibold text-gray-900 mb-3">Product</h5>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link
                href="#features"
                className="hover:text-green-600 transition-colors"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="#pricing"
                className="hover:text-green-600 transition-colors"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="#security"
                className="hover:text-green-600 transition-colors"
              >
                Security
              </Link>
            </li>
            <li>
              <Link
                href="#faqs"
                className="hover:text-green-600 transition-colors"
              >
                FAQs
              </Link>
            </li>
          </ul>
        </motion.div>

        {/* Company Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h5 className="font-semibold text-gray-900 mb-3">Company</h5>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link
                href="#"
                className="hover:text-green-600 transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="#contact"
                className="hover:text-green-600 transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-green-600 transition-colors"
              >
                Careers
              </Link>
            </li>
          </ul>
        </motion.div>

        {/* Legal Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h5 className="font-semibold text-gray-900 mb-3">Legal</h5>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link
                href="#"
                className="hover:text-green-600 transition-colors"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-green-600 transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="hover:text-green-600 transition-colors"
              >
                Cookie Policy
              </Link>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="border-t border-emerald-100 mt-10"></div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Global Trust Bank. All rights reserved.</p>
        <p className="mt-3 md:mt-0">
          Made with ❤️ by <span className="text-green-600 font-medium">Binntech Team</span>
        </p>
      </div>
    </footer>
  );
}
