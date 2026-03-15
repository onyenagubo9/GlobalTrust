"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebaseClient";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Gauge, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AccountLimitPage() {
  const [limitData, setLimitData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setLimitData({
              dailyLimit: data.dailyLimit || 10000,
              monthlyLimit: data.monthlyLimit || 100000,
              usedToday: data.usedToday || 2500,
              usedThisMonth: data.usedThisMonth || 45000,
              accountType: data.accountType || "Basic",
            });
          } else {
            setLimitData(null);
          }
          setLoading(false);
        });

        return () => unsubscribeUser();
      } else {
        setLimitData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const calcPercentage = (used, limit) =>
    Math.min(Math.round((used / limit) * 100), 100);

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <a
          href="/settings"
          className="text-sm text-green-600 hover:underline mb-3 inline-block"
        >
          ← Back to Settings
        </a>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Account Limit
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          View your transaction and withdrawal limits.
        </p>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading your limits...</p>
        ) : !limitData ? (
          <p className="text-gray-500 text-sm">No data available.</p>
        ) : (
          <>
            {/* Account Type Card */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-5 mb-8">
              <p className="text-gray-700 font-medium">
                Account Type:{" "}
                <span className="font-semibold text-green-700">
                  {limitData.accountType}
                </span>
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Upgrade your account for higher limits.
              </p>
            </div>

            {/* Daily Limit Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  Daily Limit
                </h2>
                <p className="text-sm text-gray-600">
                  Used:{" "}
                  <span className="font-semibold text-gray-800">
                    ${limitData.usedToday.toLocaleString()}
                  </span>{" "}
                  / ${limitData.dailyLimit.toLocaleString()}
                </p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-green-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${calcPercentage(
                      limitData.usedToday,
                      limitData.dailyLimit
                    )}%`,
                  }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {calcPercentage(limitData.usedToday, limitData.dailyLimit)}% used
              </p>
            </section>

            {/* Monthly Limit Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  Monthly Limit
                </h2>
                <p className="text-sm text-gray-600">
                  Used:{" "}
                  <span className="font-semibold text-gray-800">
                    ${limitData.usedThisMonth.toLocaleString()}
                  </span>{" "}
                  / ${limitData.monthlyLimit.toLocaleString()}
                </p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-green-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${calcPercentage(
                      limitData.usedThisMonth,
                      limitData.monthlyLimit
                    )}%`,
                  }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {calcPercentage(limitData.usedThisMonth, limitData.monthlyLimit)}%
                used
              </p>
            </section>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <ArrowUpRight className="text-green-600 w-5 h-5" />
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Daily Remaining
                  </h3>
                </div>
                <p className="text-xl font-bold text-green-700">
                  $
                  {(
                    limitData.dailyLimit - limitData.usedToday
                  ).toLocaleString()}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <ArrowDownRight className="text-green-600 w-5 h-5" />
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Monthly Remaining
                  </h3>
                </div>
                <p className="text-xl font-bold text-green-700">
                  $
                  {(
                    limitData.monthlyLimit - limitData.usedThisMonth
                  ).toLocaleString()}
                </p>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
