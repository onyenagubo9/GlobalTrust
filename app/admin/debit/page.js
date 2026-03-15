"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { motion } from "framer-motion";
import {
  Search,
  UserPlus,
  CreditCard,
  DollarSign,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

/**
 * AdminDebitPage
 * - Search users by account number or email
 * - Display selected user info
 * - Debit amount atomically using runTransaction
 * - Log transaction to `transactions` collection
 *
 * IMPORTANT:
 * - Ensure Firestore rules allow admins to perform this (or run from server/admin SDK).
 * - Use this page only for trusted admin accounts.
 */
export default function AdminDebitPage() {
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const [overrideInsufficient, setOverrideInsufficient] = useState(false);

  // search by accountNumber or email
  const handleSearch = async (e) => {
    e && e.preventDefault();
    setMessage(null);
    setSuccess(false);

    const term = (q || "").trim();
    if (!term) {
      setMessage({ type: "error", text: "Please enter account number or email." });
      return;
    }

    setSearching(true);
    setResults([]);
    setSelected(null);

    try {
      // Try accountNumber first
      const usersCol = collection(db, "users");

      // If looks like an email use email search, else accountNumber search.
      const isEmail = term.includes("@");
      let snap;
      if (isEmail) {
        const qEmail = query(usersCol, where("email", "==", term));
        snap = await getDocs(qEmail);
      } else {
        const qAcc = query(usersCol, where("accountNumber", "==", term));
        snap = await getDocs(qAcc);
      }

      if (snap.empty) {
        // fallback: partial matches by name (case-insensitive) - note Firestore doesn't support contains, so basic fallback omitted
        setMessage({ type: "error", text: "No users found with that account number or email." });
        setResults([]);
      } else {
        const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setResults(users);
        if (users.length === 1) setSelected(users[0]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setMessage({ type: "error", text: "Search failed. Check console for details." });
    } finally {
      setSearching(false);
    }
  };

  // choose result
  const pickUser = (user) => {
    setSelected(user);
    setMessage(null);
    setSuccess(false);
  };

  // perform debit using a transaction
  const handleDebit = async (e) => {
    e && e.preventDefault();
    setMessage(null);
    setSuccess(false);

    if (!selected) {
      setMessage({ type: "error", text: "Please select a user first." });
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setMessage({ type: "error", text: "Enter a valid amount greater than zero." });
      return;
    }

    setProcessing(true);

    try {
      const userRef = doc(db, "users", selected.id);

      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error("User not found during transaction.");

        const userData = userSnap.data();
        // prefer accountBalance field; fallback to balance or 0
        const currentBal = Number(userData.accountBalance ?? userData.balance ?? 0);

        if (currentBal < amt && !overrideInsufficient) {
          throw new Error("INSUFFICIENT_FUNDS");
        }

        const newBal = currentBal - amt;

        transaction.update(userRef, {
          accountBalance: newBal,
          balance: newBal, // keep both consistent if you use both fields
        });
      });

      // write audit log (outside transaction)
      await addAdminTransaction({
        userId: selected.id,
        userName: selected.name ?? selected.email ?? "Unknown",
        accountNumber: selected.accountNumber ?? "—",
        amount: amt,
        note: note,
        type: "Admin Debit",
        status: "Successful",
      });

      // update UI selected balance
      setSelected((s) => (s ? { ...s, accountBalance: Number(s.accountBalance ?? s.balance ?? 0) - amt } : s));
      setMessage({ type: "success", text: `✅ Debited ${amt.toLocaleString()} successfully.` });
      setSuccess(true);
      setAmount("");
      setNote("");
      setOverrideInsufficient(false);
    } catch (err) {
      console.error("Debit error:", err);
      if (err && err.message === "INSUFFICIENT_FUNDS") {
        setMessage({ type: "error", text: "User has insufficient funds. Enable override to force debit." });
      } else {
        setMessage({ type: "error", text: "Debit failed. Check console for details." });
      }
    } finally {
      setProcessing(false);
    }
  };

  // helper: add transaction doc
  const addAdminTransaction = async ({ userId, userName, accountNumber, amount, note, type, status }) => {
    try {
      const txCol = collection(db, "transactions");
      await txCol && (await txCol); // noop to hint
    } catch (e) {
      // nothing - placeholder so lint doesn't complain
    }

    try {
      // we use addDoc but keep import inline to avoid missing import; import at top if needed
      const { addDoc } = await import("firebase/firestore");
      await addDoc(collection(db, "transactions"), {
        userId,
        userName,
        accountNumber,
        amount,
        note: note || "",
        type,
        status,
        performedBy: "admin", // you can add admin id/email if available
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to log transaction:", err);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin — Debit User Account</h1>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="flex-1">
            <label className="text-sm text-gray-600">Search (Account Number or Email)</label>
            <div className="mt-1 flex">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="e.g. 100200300 or user@example.com"
                className="w-full px-3 py-2 border rounded-l-lg outline-none"
              />
              <button
                type="submit"
                disabled={searching}
                className="px-4 bg-green-600 text-white rounded-r-lg flex items-center gap-2"
              >
                {searching ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                <span className="text-sm">Search</span>
              </button>
            </div>
          </div>
        </form>

        {/* Results */}
        {message && (
          <div
            className={`mb-4 p-3 rounded ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
          >
            {message.text}
          </div>
        )}

        {results.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Search results:</p>
            <div className="grid gap-2">
              {results.map((u) => (
                <button
                  key={u.id}
                  onClick={() => pickUser(u)}
                  className={`text-left p-3 border rounded-lg hover:shadow-sm flex justify-between items-center ${
                    selected?.id === u.id ? "bg-green-50 border-green-200" : "bg-white"
                  }`}
                >
                  <div>
                    <p className="font-semibold">{u.name || u.email}</p>
                    <p className="text-xs text-gray-500">{u.email} • {u.accountNumber || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${Number(u.accountBalance ?? u.balance ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Balance</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected user */}
        {selected ? (
          <section className="bg-white p-4 rounded-lg border mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                  <UserPlus className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold">{selected.name || selected.email}</p>
                  <p className="text-xs text-gray-500">{selected.email}</p>
                  <p className="text-xs text-gray-400">Account: {selected.accountNumber || "—"}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-lg font-bold">${Number(selected.accountBalance ?? selected.balance ?? 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Debit form */}
            <form onSubmit={handleDebit} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Amount to debit (USD)</label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 50.00"
                  inputMode="decimal"
                  className="w-full px-3 py-2 border rounded-lg mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Note (optional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Reason for debit (ex: fee, correction)"
                  className="w-full px-3 py-2 border rounded-lg mt-1"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={overrideInsufficient}
                    onChange={(e) => setOverrideInsufficient(e.target.checked)}
                  />
                  <span>Allow debit even if insufficient funds (override)</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  {processing ? <Loader2 className="animate-spin w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  <span>Debit Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    setResults([]);
                    setAmount("");
                    setNote("");
                    setMessage(null);
                    setSuccess(false);
                    setOverrideInsufficient(false);
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
              </div>

              {success && (
                <div className="mt-2 text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Debit recorded successfully.
                </div>
              )}
            </form>
          </section>
        ) : (
          <div className="mb-6 p-4 rounded border bg-white text-sm text-gray-500">
            Search for a user and select them to debit their account.
          </div>
        )}

        <div className="text-xs text-gray-400">
          <AlertTriangle className="inline-block w-4 h-4 mr-1 align-middle" /> Use this tool carefully — actions are immediate. Consider implementing an approval workflow for production.
        </div>
      </div>
    </main>
  );
}
