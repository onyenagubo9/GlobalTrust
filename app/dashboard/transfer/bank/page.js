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

  const router = useRouter();

  // ✅ Listen to user & accountBalance in real-time
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
            setUser({ id: docSnap.id, ...data });
            setAccountBalance(data.accountBalance ?? 0);
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

  // ✅ Handle transfer
  const handleTransfer = async (e) => {
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

    setProcessing(true);

    try {
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

        if (!senderSnap.exists()) throw new Error("Sender not found");
        if (!recipientSnap.exists()) throw new Error("Recipient not found");

        const senderBalance = senderSnap.data().accountBalance ?? 0;
        const receiverBalance = recipientSnap.data().accountBalance ?? 0;

        if (senderBalance < transferAmount) throw new Error("Insufficient funds");

        // Update both balances atomically
        transaction.update(senderRef, {
          accountBalance: senderBalance - transferAmount,
        });
        transaction.update(recipientRef, {
          accountBalance: receiverBalance + transferAmount,
        });
      });

      // ✅ Record both transactions
      await addDoc(collection(db, "transactions"), {
        userId: user.id,
        type: "Transfer - Outgoing",
        to: recipientData.name ?? "Unknown User",
        accountNumber: recipientData.accountNumber ?? recipientAcc,
        amount: transferAmount,
        note: note ?? "",
        status: "Successful",
        timestamp: serverTimestamp(),
      });

      await addDoc(collection(db, "transactions"), {
        userId: recipientId,
        type: "Transfer - Incoming",
        from: user.name ?? "Unknown Sender",
        accountNumber: user.accountNumber ?? "Unknown",
        amount: transferAmount,
        note: note ?? "",
        status: "Successful",
        timestamp: serverTimestamp(),
      });

      // ✅ Redirect to success page
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

  // ✅ UI Rendering
  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
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
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
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

        {/* Account Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-linear-to-r from-green-600 to-emerald-500 text-white rounded-xl shadow p-5 mb-6"
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

        {/* Transfer Form */}
        <form
          onSubmit={handleTransfer}
          className="space-y-4 border-t border-gray-100 pt-4"
        >
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

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={processing}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-sm tracking-wide shadow-md transition-all flex items-center justify-center"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              "Send Money"
            )}
          </motion.button>
        </form>

        {/* Error Message */}
        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-4 text-sm text-center text-red-500"
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
