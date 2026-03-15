"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Wallet,
  Loader2,
  ArrowLeft,
  TrendingUp,
  Globe2,
} from "lucide-react";
import Link from "next/link";

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0); // base balance in USD
  const [currencyRates, setCurrencyRates] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [convertedBalance, setConvertedBalance] = useState(0);
  const [loadingRates, setLoadingRates] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayCurrencies = [
    { code: "USD", flag: "🇺🇸", name: "US Dollar", symbol: "$" },
    { code: "EUR", flag: "🇪🇺", name: "Euro", symbol: "€" },
    { code: "PHP", flag: "🇵🇭", name: "Philippine Peso", symbol: "₱" },
    { code: "GBP", flag: "🇬🇧", name: "British Pound", symbol: "£" },
    { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar", symbol: "$" },
  ];

  // ✅ Fetch user info and transactions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (loggedUser) => {
      if (!loggedUser) return;

      try {
        const userRef = doc(db, "users", loggedUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setUser({ id: loggedUser.uid, ...data });
          setAccountBalance(Number(data.accountBalance ?? data.balance ?? 0));
        }

        const q = query(
          collection(db, "transactions"),
          where("userId", "==", loggedUser.uid),
          orderBy("timestamp", "desc")
        );
        const txSnap = await getDocs(q);
        const txData = txSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTransactions(txData);
      } catch (error) {
        console.error("Error loading wallet data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Fetch live exchange rates (base: USD)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoadingRates(true);
        const response = await fetch(
          "https://api.exchangerate.host/latest?base=USD"
        );
        const data = await response.json();
        setCurrencyRates(data?.rates || {});
      } catch (err) {
        console.error("Exchange rate API error:", err);
      } finally {
        setLoadingRates(false);
      }
    };
    fetchRates();
  }, []);

  // ✅ Convert balance whenever currency changes
  useEffect(() => {
    if (!currencyRates || !accountBalance) return;
    const rate = currencyRates[selectedCurrency] || 1;
    setConvertedBalance(accountBalance * rate);
  }, [selectedCurrency, currencyRates, accountBalance]);

  const getSymbol = (code) => {
    const cur = displayCurrencies.find((c) => c.code === code);
    return cur?.symbol || "";
  };

  const randomChange = () => (Math.random() * 1 - 0.5).toFixed(2);

  const conversionSummary = () => {
    if (!currencyRates?.EUR) return null;
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-3 text-xs sm:text-sm text-white/90">
        <p>1 USD = {currencyRates.EUR?.toFixed(2)} EUR</p>
        <p>1 USD = {currencyRates.PHP?.toFixed(2)} PHP</p>
        <p>1 USD = {currencyRates.GBP?.toFixed(2)} GBP</p>
        <p>1 USD = {currencyRates.CAD?.toFixed(2)} CAD</p>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-md p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
            <Wallet className="w-5 h-5 text-green-600 mr-2" /> Wallet Overview
          </h1>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-linear-to-r from-green-600 to-emerald-500 text-white rounded-xl p-6 mb-6 shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm opacity-90">Available Account Balance</p>
            <div className="flex items-center space-x-2">
              <Globe2 className="w-4 h-4 opacity-80" />
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-white text-green-700 px-3 py-1 text-sm rounded-lg focus:ring-2 focus:ring-white/70 outline-none"
              >
                {displayCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading || loadingRates ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          ) : (
            <motion.p
              key={selectedCurrency}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-3xl font-bold mt-2 tracking-tight"
            >
              {getSymbol(selectedCurrency)}{" "}
              {convertedBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </motion.p>
          )}

          {conversionSummary()}
        </motion.div>

        {/* Trading Indices */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" /> Current Trading Indices
          </h2>

          {loadingRates ? (
            <div className="flex items-center justify-center py-6 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading rates...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-100 rounded-xl">
                <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                  <tr>
                    <th className="py-3 px-4 text-left">Currency</th>
                    {displayCurrencies.map((cur) => (
                      <th key={cur.code} className="py-3 px-4 text-center">
                        {cur.code}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayCurrencies.map((row) => (
                    <tr key={row.code} className="border-b border-gray-100">
                      <td className="py-3 px-4 flex items-center space-x-2">
                        <span className="text-lg">{row.flag}</span>
                        <span className="font-semibold text-gray-800">
                          {row.code}
                        </span>
                      </td>
                      {displayCurrencies.map((col) => {
                        const rate1 = currencyRates[col.code];
                        const rate2 = currencyRates[row.code];
                        const valid = rate1 && rate2;
                        const change = randomChange();
                        const isPositive = change > 0;
                        return (
                          <td
                            key={col.code}
                            className={`py-3 px-4 text-center font-medium ${
                              isPositive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {row.code === col.code
                              ? "-"
                              : valid
                              ? `${(rate1 / rate2).toFixed(2)} (${change}%)`
                              : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
