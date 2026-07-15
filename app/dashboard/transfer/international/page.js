"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { Globe2, CheckCircle, ShieldCheck, Lock, X, Loader2 } from "lucide-react";
import Link from "next/link";

export default function InternationalTransferPage() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [recipientName, setRecipientName] = useState("");
  const [recipientBank, setRecipientBank] = useState("");
  const [iban, setIban] = useState("");
  const [swift, setSwift] = useState("");
  const [country, setCountry] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  // --- PIN State ---
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Load user and balance
  useEffect(() => {
    setLoadingUser(true);
    const unsubscribe = onAuthStateChanged(auth, async (loggedUser) => {
      if (loggedUser) {
        const userRef = doc(db, "users", loggedUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const userData = snap.data();
          setUser({ id: loggedUser.uid, ...userData });
          // ✅ Read nested USD balance from balances object
          setBalance(userData.balances?.USD ?? 0);
        }
      }
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  // ✅ 1. Validate Form & Trigger PIN Modal
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    if (
      !recipientName ||
      !recipientBank ||
      !iban ||
      !swift ||
      !country ||
      !amount
    ) {
      setMessage("❌ Please fill in all required fields.");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setMessage("❌ Invalid amount.");
      return;
    }

    if (transferAmount > balance) {
      setMessage("❌ Insufficient funds.");
      return;
    }

    // Clear previous PIN details and open modal
    setPinInput("");
    setPinError("");
    setShowPinModal(true);
  };

  // ✅ 2. Perform Real Transfer (Called after correct PIN authorization)
  const executeTransfer = async () => {
    setProcessing(true);
    setShowPinModal(false);

    const transferAmount = parseFloat(amount);

    try {
      const userRef = doc(db, "users", user.id);
      const newBalance = balance - transferAmount;

      // ✅ Deduct nested balance using dot notation
      await updateDoc(userRef, {
        "balances.USD": newBalance,
      });

      // Record transfer (pending for admin review)
      await addDoc(collection(db, "transactions"), {
        userId: user.id,
        type: "International Transfer",
        amount: transferAmount,
        recipientName,
        recipientBank,
        iban,
        swift,
        country,
        note: note || "",
        status: "Pending Review",
        timestamp: serverTimestamp(),
      });

      // Update UI
      setBalance(newBalance);
      setRecipientName("");
      setRecipientBank("");
      setIban("");
      setSwift("");
      setCountry("");
      setAmount("");
      setNote("");
      setMessage("✅ International transfer submitted for review.");
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setMessage("❌ Transfer failed. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ✅ 3. Validate PIN correctness
  const handlePinSubmit = (e) => {
    e.preventDefault();
    setPinError("");

    if (pinInput.length !== 4) {
      setPinError("PIN must be 4 digits.");
      return;
    }

    if (pinInput !== user?.transactionPin) {
      setPinError("Incorrect security PIN. Please try again.");
      return;
    }

    // PIN is correct, execute transaction
    executeTransfer();
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8 relative">
      <div className="max-w-lg mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        
        {/* Header navigation and indicators */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/dashboard/transfer"
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Transfer Options
          </Link>

          <div className="flex items-center space-x-1.5 text-green-700">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-medium">Fully Encrypted</span>
          </div>
        </div>

        <div className="flex items-center mb-6">
          <Globe2 className="w-6 h-6 text-green-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">
            International Transfer
          </h1>
        </div>

        {/* Balance */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
          <p className="text-gray-500 text-sm">Available Balance</p>
          <p className="text-2xl font-bold text-gray-800">
            {loadingUser ? (
              <Loader2 className="w-5 h-5 animate-spin inline-block text-green-600" />
            ) : (
              `$${balance.toLocaleString()}`
            )}
          </p>
        </div>

        {/* Check if transaction PIN has been set up */}
        {!loadingUser && user && !user.hasTransactionPin ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center my-6">
            <p className="text-yellow-800 text-sm mb-3 font-medium">
              ⚠️ You must set up a transaction PIN before executing international transfers.
            </p>
            <Link
              href="/settings/create-pin"
              className="inline-flex items-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
            >
              <Lock className="w-4 h-4 mr-2" />
              Create Your PIN Now
            </Link>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleTransferSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Recipient Full Name
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-green-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Recipient Bank Name
              </label>
              <input
                type="text"
                value={recipientBank}
                onChange={(e) => setRecipientBank(e.target.value)}
                placeholder="e.g. Barclays Bank"
                className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-green-600 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  IBAN
                </label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="Enter IBAN"
                  className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-green-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  SWIFT/BIC
                </label>
                <input
                  type="text"
                  value={swift}
                  onChange={(e) => setSwift(e.target.value)}
                  placeholder="Enter SWIFT/BIC"
                  className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-green-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United Kingdom"
                  className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-green-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-green-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Note (optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for this transfer"
                className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-green-600 outline-none"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={processing}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center justify-center cursor-pointer"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Send Internationally"
              )}
            </motion.button>
          </form>
        )}

        {/* Message */}
        {message && (
          <p
            className={`mt-4 text-sm font-medium ${
              success ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        {/* Success Animation */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-4 flex items-center justify-center space-x-2 text-green-600"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Transfer Submitted Successfully!</span>
          </motion.div>
        )}
      </div>

      {/* --- TRANSACTION PIN MODAL OVERLAY --- */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPinModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-10"
            >
              <button
                onClick={() => setShowPinModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <Lock className="w-10 h-10 mx-auto text-green-600 mb-2" />
                <h3 className="text-lg font-bold text-gray-800">
                  Enter Transaction PIN
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Authorize international wire of ${Number(amount).toLocaleString()} to {recipientName}
                </p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  autoFocus
                  value={pinInput}
                  onChange={(e) =>
                    setPinInput(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full border rounded-lg px-4 py-3 text-center text-2xl tracking-[10px] focus:ring-2 focus:ring-green-600 outline-none"
                  placeholder="****"
                />

                {pinError && (
                  <p className="text-red-500 text-xs text-center font-medium">
                    {pinError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold text-sm transition"
                >
                  Confirm Authorization
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}