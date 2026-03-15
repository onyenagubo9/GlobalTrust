"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebaseClient";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Wallet, BarChart3 } from "lucide-react";

export default function DashboardExtras() {
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState({
    totalSent: 0,
    totalReceived: 0,
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (loggedUser) => {
      if (loggedUser) {
        setUser(loggedUser);
        await fetchRecentTransactions(loggedUser.uid);
      }
    });
    return () => unsub();
  }, []);

  const fetchRecentTransactions = async (userId) => {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(5)
    );

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTransactions(data);

    // calculate insights
    const totalSent = data
      .filter((t) => t.type?.includes("Outgoing"))
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalReceived = data
      .filter((t) => t.type?.includes("Incoming") || t.type === "Deposit")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    setInsights({ totalSent, totalReceived });
  };

  return (
    <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 🧠 Financial Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Financial Insights
          </h2>
          <BarChart3 className="w-5 h-5 text-green-600" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-gray-600 text-sm">Total Received</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              ${insights.totalReceived.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-gray-600 text-sm">Total Sent</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              ${insights.totalSent.toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 💰 Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Transactions
          </h2>
          <Wallet className="w-5 h-5 text-green-600" />
        </div>

        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">
            No transactions yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div className="flex items-center space-x-3">
                  {tx.type?.includes("Outgoing") ? (
                    <ArrowUpRight className="w-5 h-5 text-red-500" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5 text-green-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {tx.type || "Transaction"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {tx.note || tx.accountNumber || "No note provided"}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${
                    tx.type?.includes("Outgoing")
                      ? "text-red-600"
                      : "text-green-700"
                  }`}
                >
                  {tx.type?.includes("Outgoing") ? "-" : "+"}$
                  {tx.amount?.toLocaleString() || 0}
                </span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </section>
  );
}
