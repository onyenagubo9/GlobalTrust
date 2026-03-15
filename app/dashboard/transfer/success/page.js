"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft, Banknote, User, CreditCard } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function TransferSuccessContent() {
  const params = useSearchParams();
  const amount = params.get("amount") || "0.00";
  const recipient = params.get("recipient") || "Recipient";
  const account = params.get("account") || "XXXX XXXX XXXX";

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-md p-8 sm:p-10 w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center mb-6"
        >
          <div className="bg-green-100 text-green-600 p-4 rounded-full mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Transfer Successful 🎉
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Your transaction has been processed securely.
          </p>
        </motion.div>

        {/* Transaction Summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-6 text-left space-y-3"
        >
          <div className="flex items-center space-x-3">
            <Banknote className="w-5 h-5 text-green-600" />
            <p className="text-gray-600 text-sm">
              <span className="font-medium text-gray-800">Amount:</span>{" "}
              ${parseFloat(amount).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-green-600" />
            <p className="text-gray-600 text-sm">
              <span className="font-medium text-gray-800">Recipient:</span>{" "}
              {recipient}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-green-600" />
            <p className="text-gray-600 text-sm">
              <span className="font-medium text-gray-800">Account Number:</span>{" "}
              {account}
            </p>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/history"
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all"
          >
            View Transaction History
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto border border-green-600 text-green-700 px-6 py-2.5 rounded-lg font-medium hover:bg-green-50 transition-all flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-6">
        Secured by{" "}
        <span className="font-semibold text-green-600">Honstinger</span> Banking ©{" "}
        {new Date().getFullYear()}
      </p>
    </main>
  );
}

export default function TransferSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <TransferSuccessContent />
    </Suspense>
  );
}
