"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebaseClient";
import {
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Plus,
  Trash2,
  Building2,
  CreditCard,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function LinkedAccountsPage() {
  const [user, setUser] = useState(null);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ Load user and linked accounts
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (loggedUser) => {
      if (loggedUser) {
        setUser(loggedUser);
        await fetchLinkedAccounts(loggedUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const fetchLinkedAccounts = async (userId) => {
    const q = query(collection(db, "linkedAccounts"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const accounts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setLinkedAccounts(accounts);
  };

  // ✅ Add Linked Account
  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!bankName || !accountNumber || !accountType) return;

    setSaving(true);
    try {
      await addDoc(collection(db, "linkedAccounts"), {
        userId: user.uid,
        bankName,
        accountNumber,
        accountType,
        timestamp: serverTimestamp(),
      });
      setBankName("");
      setAccountNumber("");
      setAccountType("");
      setShowModal(false);
      fetchLinkedAccounts(user.uid);
    } catch (error) {
      console.error("Error adding account:", error);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Delete Linked Account
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to remove this linked account?")) {
      await deleteDoc(doc(db, "linkedAccounts", id));
      fetchLinkedAccounts(user.uid);
    }
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
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">
            Linked Accounts
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Account
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading Accounts...
          </div>
        ) : linkedAccounts.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-sm">
            You have no linked accounts yet. Click “Add Account” to link a bank or card.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {linkedAccounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm relative"
              >
                <div className="flex items-center space-x-3 mb-2">
                  {account.accountType === "Card" ? (
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Building2 className="w-6 h-6 text-green-600" />
                  )}
                  <h3 className="text-gray-800 font-semibold text-sm sm:text-base">
                    {account.bankName}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Account Type:</span>{" "}
                  {account.accountType}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  <span className="font-medium">Account Number:</span>{" "}
                  {account.accountNumber}
                </p>

                <button
                  onClick={() => handleDelete(account.id)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-600 transition"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Account Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Add Linked Account
              </h2>
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. GTBank, Access, Chase"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">
                    Account Type
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600 outline-none"
                  >
                    <option value="">Select Type</option>
                    <option value="Bank">Bank</option>
                    <option value="Card">Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    {saving ? "Saving..." : "Add Account"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
