"use client";

import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
        <a
          href="/settings"
          className="text-sm text-green-600 hover:underline mb-3 inline-block"
        >
          ← Back to Settings
        </a>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4"
        >
          Privacy Policy
        </motion.h1>

        <p className="text-gray-500 text-sm mb-8">
          Last updated: November 2025
        </p>

        <section className="space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base">
          <p>
            Welcome to <strong>Honstinger Bank</strong>. Your privacy is our top
            priority. This Privacy Policy explains how we collect, use, and
            protect your personal information when you use our online banking
            services, website, and mobile application.
          </p>

          <h2 className="text-lg font-semibold text-gray-800">
            1. Information We Collect
          </h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Personal data such as your name, email, and phone number.</li>
            <li>Financial information like bank account details and transactions.</li>
            <li>Device information, IP address, and browser type when using our app.</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-800">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>To create and manage your Honstinger account.</li>
            <li>To process deposits, transfers, and other financial activities.</li>
            <li>To enhance our services and prevent fraud or unauthorized access.</li>
            <li>To comply with applicable financial regulations.</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-800">
            3. Data Protection and Security
          </h2>
          <p>
            We use advanced encryption and multi-layer security protocols to
            protect your personal and financial information. All data
            transmissions are secured using SSL technology and stored in
            encrypted databases managed by trusted providers.
          </p>

          <h2 className="text-lg font-semibold text-gray-800">
            4. Sharing Your Information
          </h2>
          <p>
            We never sell or rent your data. Information may only be shared with
            government authorities, payment processors, or partners to complete
            transactions or comply with legal obligations.
          </p>

          <h2 className="text-lg font-semibold text-gray-800">
            5. Your Rights
          </h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Request access to or correction of your personal data.</li>
            <li>Withdraw consent to data processing at any time.</li>
            <li>Request account deletion subject to banking compliance rules.</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-800">
            6. Cookies and Tracking
          </h2>
          <p>
            We use cookies to enhance your browsing experience and understand
            user preferences. You can manage or disable cookies through your
            browser settings.
          </p>

          <h2 className="text-lg font-semibold text-gray-800">
            7. Updates to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. When we make
            significant changes, you will receive a notification through your
            account or email.
          </p>

          <h2 className="text-lg font-semibold text-gray-800">
            8. Contact Us
          </h2>
          <p>
            If you have questions about our Privacy Policy or data-handling
            practices, please contact us:
          </p>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-800">Honstinger Bank Support</p>
            <p>Email: <a href="mailto:info@honstinger.app" className="text-green-600 hover:underline">info@honstinger.app</a></p>
            <p>Website: <a href="https://www.honstinger.app" target="_blank" className="text-green-600 hover:underline">www.honstinger.app</a></p>
          </div>
        </section>

        <p className="text-xs text-gray-400 mt-10 text-center">
          © {new Date().getFullYear()} Honstinger Bank. All rights reserved.
        </p>
      </div>
    </main>
  );
}
