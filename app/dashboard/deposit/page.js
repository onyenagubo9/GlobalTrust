"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Copy, Check, Wallet } from "lucide-react";
import Link from "next/link";

export default function DepositPage() {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // ✅ Get user and their info
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Copy Account Number to Clipboard
  const handleCopy = () => {
    if (!userData?.accountNumber) return;
    navigator.clipboard.writeText(userData.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-md p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">
            Deposit Information
          </h1>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading account details...</p>
        ) : !userData ? (
          <p className="text-gray-500 text-sm">No account found.</p>
        ) : (
          <>
            {/* Account Information */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-green-50 border border-green-100 rounded-xl p-5 mb-6"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-gray-500 text-sm">Account Holder</p>
                  <p className="text-lg font-bold text-gray-800">
                    {userData.name || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">Account Number</p>
                  <div className="flex items-center justify-end space-x-2">
                    <p className="text-lg font-bold text-gray-800">
                      {userData.accountNumber || "—"}
                    </p>
                    <button
                      onClick={handleCopy}
                      className="text-green-600 hover:text-green-700 transition"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-700" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-700 mt-2">
                <div>
                  <p>Account Type</p>
                  <p className="font-semibold text-gray-800">
                    {userData.accountType || "—"}
                  </p>
                </div>
                <div>
                  <p>Status</p>
                  <p
                    className={`font-semibold ${
                      userData.accountStatus === "Active"
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {userData.accountStatus || "—"}
                  </p>
                </div>
                <div>
                  <p>Currency</p>
                  <p className="font-semibold text-gray-800">
                    {userData.currency || "USD"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Balance Display */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 mb-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {userData.currency || "USD"}{" "}
                    {Number(userData.accountBalance || 0).toLocaleString()}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-green-600" />
              </div>
            </motion.div>

            {/* Deposit Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-green-50 border border-green-100 rounded-xl p-5"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                How to Fund Your Account
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                You cannot deposit funds manually through this platform.
                To add funds to your account, please contact our{" "}
                <span className="font-semibold text-green-700">
                  Honstinger Support Team
                </span>{" "}
                or your account manager.  
                <br />
                Once your transfer is confirmed, your balance will update
                automatically.
              </p>

              <div className="mt-4 bg-white border border-gray-200 rounded-lg p-3 text-sm">
                <p className="font-semibold text-gray-700">
                  Bank Name:{" "}
                  <span className="text-gray-900">FirstCBU Financial</span>
                </p>
                <p className="font-semibold text-gray-700">
                  Account Number:{" "}
                  <span className="text-gray-900">
                    {userData.accountNumber || "—"}
                  </span>
                </p>
                <p className="font-semibold text-gray-700">
                  Beneficiary:{" "}
                  <span className="text-gray-900">{userData.name || "N/A"}</span>
                </p>
              </div>
            </motion.div>

            <AnimatePresence>
              {copied && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-green-600 text-center text-sm mt-4"
                >
                  ✅ Account number copied!
                </motion.p>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </main>
  );
}
