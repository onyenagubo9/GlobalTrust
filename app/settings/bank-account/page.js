"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import { Copy, CheckCircle, Wallet } from "lucide-react";

export default function BankAccountPage() {
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setAccountData({
              name: data.name || "Unknown User",
              accountNumber: data.accountNumber || "N/A",
              accountType: data.accountType || "Standard",
              currency: data.currency || "USD",
              accountStatus: data.accountStatus || "Active",
              dateCreated: data.dateCreated || "N/A",
              balance: data.balance || 0,
            });
          } else {
            setAccountData(null);
          }
          setLoading(false);
        });

        return () => unsubscribeUser();
      } else {
        setAccountData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleCopy = async () => {
    if (!accountData?.accountNumber) return;
    await navigator.clipboard.writeText(accountData.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <a
          href="/settings"
          className="text-sm text-green-600 hover:underline mb-3 inline-block"
        >
          ← Back to Settings
        </a>

        <div className="flex items-center mb-6">
          <Wallet className="w-6 h-6 text-green-600 mr-2" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Bank Account
          </h1>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading account details...</p>
        ) : !accountData ? (
          <p className="text-gray-500 text-sm">
            No account information available.
          </p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Account Info Card */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-6">
              <h2 className="text-gray-700 text-sm font-medium mb-2">
                Account Holder
              </h2>
              <p className="text-xl font-bold text-gray-800">
                {accountData.name}
              </p>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-gray-600 text-sm">Account Number</p>
                  <p className="text-lg font-semibold text-gray-900 tracking-wider">
                    {accountData.accountNumber}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium transition"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center mt-6 text-sm">
                <div>
                  <p className="text-gray-600">Account Type</p>
                  <p className="font-semibold text-gray-800">
                    {accountData.accountType}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Status</p>
                  <p
                    className={`font-semibold ${
                      accountData.accountStatus === "Active"
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {accountData.accountStatus}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Currency</p>
                  <p className="font-semibold text-gray-800">
                    {accountData.currency}
                  </p>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">
              <h2 className="text-gray-700 text-sm font-medium mb-2">
                Current Balance
              </h2>
              <p className="text-3xl font-bold text-gray-800">
                {accountData.currency}{" "}
                {Number(accountData.balance).toLocaleString()}
              </p>
            </div>

            {/* Date Created */}
            <div className="text-xs text-gray-500 text-right">
              Date Created:{" "}
              {accountData.dateCreated
                ? new Date(accountData.dateCreated).toLocaleDateString()
                : "N/A"}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
