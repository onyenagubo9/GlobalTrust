"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { Wallet, CheckCircle, Loader2 } from "lucide-react";

export default function AdminDepositPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // ✅ Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // ✅ Handle deposit
  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !amount || isNaN(amount) || amount <= 0) {
      setMessage("❌ Please select a user and enter a valid amount.");
      setSuccess(false);
      return;
    }

    setProcessing(true);
    const depositAmount = parseFloat(amount);
    try {
      const userRef = doc(db, "users", selectedUser);
      const userData = users.find((u) => u.id === selectedUser);
      const newBalance = (userData.accountBalance || 0) + depositAmount;

      // Update user balance
      await updateDoc(userRef, {
        accountBalance: newBalance,
      });

      // Record transaction
      await addDoc(collection(db, "transactions"), {
        userId: selectedUser,
        type: "Deposit",
        amount: depositAmount,
        balanceAfter: newBalance,
        note: note || "Admin Deposit",
        status: "Successful",
        timestamp: serverTimestamp(),
      });

      setMessage("✅ Deposit completed successfully!");
      setSuccess(true);
      setAmount("");
      setNote("");
      setSelectedUser("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Deposit failed. Try again.");
      setSuccess(false);
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin w-6 h-6 text-green-600" />
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
      <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="flex items-center mb-6">
          <Wallet className="w-6 h-6 text-green-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Admin Deposit</h1>
        </div>

        <form onSubmit={handleDeposit} className="space-y-5">
          {/* Select User */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-green-600 outline-none"
            >
              <option value="">-- Choose a user --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || "Unnamed"} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Deposit Amount
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

          {/* Note */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason or description"
              className="w-full border rounded-lg p-2 focus:ring-1 focus:ring-green-600 outline-none"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={processing}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all font-medium"
          >
            {processing ? "Processing..." : "Deposit Funds"}
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
            className="mt-6 flex items-center justify-center space-x-2 text-green-600"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Deposit recorded successfully!</span>
          </motion.div>
        )}
      </div>
    </main>
  );
}
