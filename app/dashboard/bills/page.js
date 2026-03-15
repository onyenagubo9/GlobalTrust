"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  CreditCard,
  Wifi,
  Droplets,
  Tv,
  Zap,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function BillsPage() {
  const [user, setUser] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [selectedBill, setSelectedBill] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Bill Categories
  const bills = [
    { name: "Electricity", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
    { name: "Internet", icon: Wifi, color: "bg-blue-100 text-blue-600" },
    { name: "Water", icon: Droplets, color: "bg-sky-100 text-sky-600" },
    { name: "Cable TV", icon: Tv, color: "bg-purple-100 text-purple-600" },
  ];

  // ✅ Load user info and account balance
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (loggedUser) => {
      if (loggedUser) {
        const userRef = doc(db, "users", loggedUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setUser({ id: loggedUser.uid, ...data });
          setAccountBalance(data.accountBalance ?? 0);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Handle Bill Payment
  const handlePayBill = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    if (!selectedBill) {
      setMessage("❌ Please select a bill category.");
      return;
    }
    if (!accountNumber || !amount) {
      setMessage("❌ Please fill in all fields.");
      return;
    }

    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      setMessage("❌ Invalid payment amount.");
      return;
    }

    if (payAmount > accountBalance) {
      setMessage("❌ Insufficient funds.");
      return;
    }

    setProcessing(true);

    try {
      const userRef = doc(db, "users", user.id);
      const newBalance = accountBalance - payAmount;

      // Update user's balance in Firestore
      await updateDoc(userRef, { accountBalance: newBalance });

      // Log transaction
      await addDoc(collection(db, "transactions"), {
        userId: user.id,
        type: `Bill Payment - ${selectedBill.name}`,
        amount: payAmount,
        note: `${selectedBill.name} bill payment`,
        accountNumber,
        status: "Successful",
        timestamp: serverTimestamp(),
      });

      setAccountBalance(newBalance);
      setSuccess(true);
      setMessage(`✅ ${selectedBill.name} bill payment successful!`);
      setAccountNumber("");
      setAmount("");
    } catch (error) {
      console.error("Bill payment error:", error);
      setMessage("❌ Payment failed. Try again.");
    } finally {
      setProcessing(false);
    }
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
            Pay Bills
          </h1>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-green-50 border border-green-100 rounded-xl p-5 mb-6"
        >
          <p className="text-sm text-gray-500">Available Account Balance</p>
          <div className="flex justify-between items-end mt-1">
            <p className="text-2xl font-bold text-gray-800">
              {loading ? "Loading..." : `$${accountBalance.toLocaleString()}`}
            </p>
            <CreditCard className="w-6 h-6 text-green-600" />
          </div>
        </motion.div>

        {/* Bill Categories */}
        <h2 className="text-gray-700 font-semibold text-base mb-3">
          Select a Bill Type
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {bills.map((bill, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedBill(bill)}
              className={`flex flex-col items-center justify-center py-4 rounded-xl border ${
                selectedBill?.name === bill.name
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 hover:border-green-500"
              } transition`}
            >
              <div className={`p-3 rounded-full mb-2 ${bill.color}`}>
                <bill.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-700">{bill.name}</p>
            </motion.button>
          ))}
        </div>

        {/* Bill Payment Form */}
        {selectedBill && (
          <motion.form
            onSubmit={handlePayBill}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 border-t border-gray-100 pt-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Pay {selectedBill.name} Bill
            </h3>
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Account / Meter Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={`Enter your ${selectedBill.name.toLowerCase()} account number`}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 outline-none transition"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={processing}
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-sm tracking-wide shadow-md transition-all flex items-center justify-center"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                </>
              ) : (
                `Pay ${selectedBill.name} Bill`
              )}
            </motion.button>
          </motion.form>
        )}

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`mt-4 text-sm text-center ${
                success ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Success Animation */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-6 flex flex-col items-center justify-center text-green-600"
          >
            <CheckCircle2 className="w-10 h-10 mb-2" />
            <p className="font-medium">Bill Payment Successful!</p>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
