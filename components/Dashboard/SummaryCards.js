"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";

export default function AccountBalance() {
  const [showBalance, setShowBalance] = useState(true);
  const [balances, setBalances] = useState({});
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  // 🔁 Convert UI state
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("");

  // ✅ Format money
  const formatMoney = (amount, currency) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount || 0);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const rateRef = doc(db, "rates", "exchangeRates");

        // 👤 User data
        const unsubUser = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setBalances(data.balances || {});
            setCurrency(data.currency || "USD");
          }
          setLoading(false);
        });

        // 💱 Rates
        const unsubRates = onSnapshot(rateRef, (snap) => {
          if (snap.exists()) {
            setRates(snap.data());
          }
        });

        return () => {
          unsubUser();
          unsubRates();
        };
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Display balance (based on selected currency)
  const baseCurrency = "USD";
  const baseBalance = balances?.[baseCurrency] ?? 0;

  const convertedBalance =
    currency === baseCurrency
      ? baseBalance
      : baseBalance * (rates?.[currency] || 1);

  // 💱 Handle currency change (persist)
  const handleCurrencyChange = async (newCurrency) => {
    setCurrency(newCurrency);

    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      currency: newCurrency,
    });
  };

  // 🔥 REAL CONVERSION FUNCTION
  const convertCurrency = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const amt = Number(amount);

    // 🛑 Safety checks
    if (!amt || amt <= 0) return alert("Enter valid amount");

    if ((balances[fromCurrency] || 0) < amt) {
      return alert("Insufficient balance");
    }

    const rateFrom = rates?.[fromCurrency];
    const rateTo = rates?.[toCurrency];

    if (!rateFrom || !rateTo) {
      return alert("Rates unavailable");
    }

    // 🔁 Convert via USD base
    const amountInUSD = amt / rateFrom;
    const convertedAmount = amountInUSD * rateTo;

    const newBalances = {
      ...balances,
      [fromCurrency]: (balances[fromCurrency] || 0) - amt,
      [toCurrency]: (balances[toCurrency] || 0) + convertedAmount,
    };

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      balances: newBalances,
    });

    // reset input
    setAmount("");
  };

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-6">
      
      {/* 🔹 Balance Section */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Available Balance</p>

          <div className="flex items-center space-x-2 mt-1">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.p className="text-2xl text-gray-400">
                  Loading...
                </motion.p>
              ) : showBalance ? (
                <motion.p className="text-3xl font-bold text-gray-800">
                  {formatMoney(convertedBalance, currency)}
                </motion.p>
              ) : (
                <motion.p className="text-3xl font-bold">
                  ••••••••
                </motion.p>
              )}
            </AnimatePresence>

            <button onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* 💱 Rate display */}
          <p className="text-xs text-gray-400 mt-1">
            1 USD = {rates?.[currency] || "..."} {currency}
          </p>
        </div>

        {/* 🌍 Currency selector */}
        <select
          value={currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className="border rounded-lg px-2 py-1 text-sm"
        >
          {Object.keys(rates).map((cur) => (
            <option key={cur}>{cur}</option>
          ))}
        </select>
      </div>

     
    </div>
  );
}
