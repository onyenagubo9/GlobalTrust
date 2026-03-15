"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";

export default function AccountBalance() {
  const [showBalance, setShowBalance] = useState(true);
  const [accountBalance, setAccountBalance] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔐 Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);

        // 📡 Real-time Firestore listener
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setAccountBalance(userData.accountBalance ?? 0);
            setCurrency(userData.currency ?? "USD");
          } else {
            setAccountBalance(0);
          }
          setLoading(false);
        });

        return () => unsubscribeUser();
      } else {
        setAccountBalance(0);
        setCurrency("USD");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">Available Balance</p>

        <div className="flex items-center space-x-2 mt-1">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.p
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-semibold text-gray-400 tracking-tight"
              >
                Loading...
              </motion.p>
            ) : showBalance ? (
              <motion.p
                key="visible"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-bold text-gray-800 tracking-tight"
              >
                {currency} {Number(accountBalance).toLocaleString()}
              </motion.p>
            ) : (
              <motion.p
                key="hidden"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-bold text-gray-800 tracking-tight"
              >
                ••••••••
              </motion.p>
            )}
          </AnimatePresence>

          {/* 👁️ Toggle Visibility */}
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="ml-2 text-gray-500 hover:text-green-600 transition"
            aria-label="Toggle balance visibility"
          >
            {showBalance ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* 💰 Optional: Add Funds Button */}
      <button className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition">
        Add Funds
      </button>
    </div>
  );
}
