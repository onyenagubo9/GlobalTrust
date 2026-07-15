"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import {
  Banknote,
  Loader2,
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Lock,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BankTransferPage() {
  const [user, setUser] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [recipientAcc, setRecipientAcc] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  // --- PIN State ---
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const router = useRouter();

  // ✅ Listen to user & USD balance in real-time
  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubAuth = onAuthStateChanged(auth, async (loggedUser) => {
      setLoadingUser(true);

      if (!loggedUser) {
        setUser(null);
        setAccountBalance(0);
        setLoadingUser(false);
        return;
      }

      try {
        const usersQ = query(
          collection(db, "users"),
          where("email", "==", loggedUser.email)
        );

        const snap = await getDocs(usersQ);

        if (snap.empty) {
          setUser(null);
          setAccountBalance(0);
          setLoadingUser(false);
          return;
        }

        const userDoc = snap.docs[0];
        const userRef = doc(db, "users", userDoc.id);

        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();

            setUser({
              id: docSnap.id,
              ...data,
            });

            // ✅ Read USD balance from balances object
            setAccountBalance(data.balances?.USD ?? 0);
          }

          setLoadingUser(false);
        });
      } catch (err) {
        console.error("Error loading user:", err);
        setLoadingUser(false);
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubAuth();
    };
  }, []);

  // ✅ 1. Validate Form & Trigger PIN Modal
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    if (!recipientAcc || !amount) {
      setMessage("❌ Please fill in all fields.");
      return;
    }

    const transferAmount = parseFloat(amount);

    if (isNaN(transferAmount) || transferAmount <= 0) {
      setMessage("❌ Invalid transfer amount.");
      return;
    }

    if (!user) {
      setMessage("❌ Could not find sender account.");
      return;
    }

    if (transferAmount > accountBalance) {
      setMessage("❌ Insufficient funds.");
      return;
    }

    if (recipientAcc === user.accountNumber) {
      setMessage("❌ You cannot send money to yourself.");
      return;
    }

    // Clear previous pin details and open the security modal
    setPinInput("");
    setPinError("");
    setShowPinModal(true);
  };

  // ✅ 2. Perform Real Transfer (Called after correct PIN)
  const executeTransfer = async () => {
    setProcessing(true);
    setShowPinModal(false);

    const transferAmount = parseFloat(amount);

    try {
      // ✅ Find recipient
      const recipientsQ = query(
        collection(db, "users"),
        where("accountNumber", "==", recipientAcc)
      );

      const recipientsSnap = await getDocs(recipientsQ);

      if (recipientsSnap.empty) {
        setMessage("❌ Recipient account not found.");
        setProcessing(false);
        return;
      }

      const recipientDoc = recipientsSnap.docs[0];
      const recipientId = recipientDoc.id;
      const recipientData = recipientDoc.data();

      // ✅ Firestore Transaction
      await runTransaction(db, async (transaction) => {
        const senderRef = doc(db, "users", user.id);
        const recipientRef = doc(db, "users", recipientId);

        const senderSnap = await transaction.get(senderRef);
        const recipientSnap = await transaction.get(recipientRef);

        if (!senderSnap.exists()) {
          throw new Error("Sender not found");
        }

        if (!recipientSnap.exists()) {
          throw new Error("Recipient not found");
        }

        // ✅ Read balances from nested balances object
        const senderBalance = senderSnap.data().balances?.USD ?? 0;
        const receiverBalance = recipientSnap.data().balances?.USD ?? 0;

        if (senderBalance < transferAmount) {
          throw new Error("Insufficient funds");
        }

        // ✅ Update nested USD balances
        transaction.update(senderRef, {
          "balances.USD": senderBalance - transferAmount,
        });

        transaction.update(recipientRef, {
          "balances.USD": receiverBalance + transferAmount,
        });
      });

      // ✅ Record outgoing transaction
      await addDoc(collection(db, "transactions"), {
        userId: user.id,
        type: "Transfer - Outgoing",
        to: recipientData.name ?? "Unknown User",
        accountNumber: recipientData.accountNumber ?? recipientAcc,
        amount: transferAmount,
        currency: "USD",
        note: note ?? "",
        status: "Successful",
        timestamp: serverTimestamp(),
      });

      // ✅ Record incoming transaction
      await addDoc(collection(db, "transactions"), {
        userId: recipientId,
        type: "Transfer - Incoming",
        from: user.name ?? "Unknown Sender",
        accountNumber: user.accountNumber ?? "Unknown",
        amount: transferAmount,
        currency: "USD",
        note: note ?? "",
        status: "Successful",
        timestamp: serverTimestamp(),
      });

      // ✅ Redirect
      router.push(
        `/dashboard/transfer/success?amount=${transferAmount}&recipient=${encodeURIComponent(
          recipientData.name ?? "Unknown User"
        )}&account=${recipientData.accountNumber ?? recipientAcc}`
      );
    } catch (err) {
      console.error("Transfer Error:", err);
      setMessage("❌ Transfer failed. Try again.");
      setProcessing(false);
    }
  };

  // ✅ 3. Validate entered PIN
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
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg mx-auto bg-white border border-gray-100 rounded-2xl shadow-md p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard/transfer"
            className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>

          <div className="flex items-center space-x-2 text-green-700">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm">Secure Transfer</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center mb-6">
          <Banknote className="w-6 h-6 text-green-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Bank Transfer</h1>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl shadow p-5 mb-6"
        >
          <p className="text-sm opacity-90">Available Balance</p>
          <div className="flex items-end justify-between mt-1">
            <p className="text-3xl font-bold">
              {loadingUser ? (
                <Loader2 className="w-6 h-6 animate-spin inline-block" />
              ) : (
                `$${Number(accountBalance).toLocaleString()}`
              )}
            </p>
            <CreditCard className="w-6 h-6 opacity-70" />
          </div>
        </motion.div>

        {/* Check if Transaction PIN is set up */}
        {!loadingUser && user && !user.hasTransactionPin ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center my-6">
            <p className="text-yellow-800 text-sm mb-3 font-medium">
              ⚠️ You must create a security transaction PIN before you can make transfers.
            </p>
            <Link
              href="/settings/create-pin"
              className="inline-flex items-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
            >
              <Lock className="w-4 h-4 mr-2" />
              Set Up PIN Now
            </Link>
          </div>
        ) : (
          /* Transfer Form */
          <form
            onSubmit={handleTransferSubmit}
            className="space-y-4 border-t border-gray-100 pt-4"
          >
            {/* Recipient */}
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Recipient Account Number
              </label>
              <input
                type="text"
                value={recipientAcc}
                onChange={(e) => setRecipientAcc(e.target.value)}
                placeholder="Enter recipient’s account number"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 outline-none transition"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter transfer amount"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 outline-none transition"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Note (optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a short note"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-600 outline-none transition"
              />
            </div>

            {/* Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={processing}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-sm tracking-wide shadow-md transition-all flex items-center justify-center"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Send Money"
              )}
            </motion.button>
          </form>
        )}

        {/* Status Message */}
        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-4 text-sm text-center text-red-500 font-medium"
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* --- TRANSACTON PIN MODAL OVERLAY --- */}
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
                  Enter Security PIN
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your 4-digit PIN to confirm transfer of ${Number(amount).toLocaleString()}
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