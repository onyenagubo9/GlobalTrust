"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { Globe2, CheckCircle } from "lucide-react";

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

  // Load user and balance
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (loggedUser) => {
      if (loggedUser) {
        const userRef = doc(db, "users", loggedUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUser({ id: loggedUser.uid, ...snap.data() });
          setBalance(snap.data().accountBalance || 0);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleTransfer = async (e) => {
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

    setProcessing(true);
    try {
      const userRef = doc(db, "users", user.id);
      const newBalance = balance - transferAmount;

      // Deduct balance
      await updateDoc(userRef, {
        accountBalance: newBalance,
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

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
      <div className="max-w-lg mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        <a
          href="/dashboard/transfer"
          className="text-sm text-green-600 hover:underline mb-4 inline-block"
        >
          ← Back to Transfer Options
        </a>

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
            ${balance.toLocaleString()}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleTransfer} className="space-y-4">
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
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all font-medium"
          >
            {processing ? "Processing..." : "Send Internationally"}
          </motion.button>
        </form>

        {/* Message */}
        {message && (
          <p
            className={`mt-4 text-sm ${
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
    </main>
  );
}
