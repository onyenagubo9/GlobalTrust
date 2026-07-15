"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  ShieldCheck,
  Lock,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreatePinPage() {
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreatePin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");

    if (!pin || !confirmPin) {
      setMessage("❌ Please fill in all fields.");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setMessage("❌ PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      setMessage("❌ PINs do not match.");
      return;
    }

    setLoading(true);

    try {
      const currentUser = await new Promise<any>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
      });

      if (!currentUser) {
        setMessage("❌ User not logged in.");
        setLoading(false);
        return;
      }

      const usersQuery = query(
        collection(db, "users"),
        where("email", "==", currentUser.email)
      );

      const userSnap = await getDocs(usersQuery);

      if (userSnap.empty) {
        setMessage("❌ User account not found.");
        setLoading(false);
        return;
      }

      const userDoc = userSnap.docs[0];

      await updateDoc(doc(db, "users", userDoc.id), {
        transactionPin: pin,
        hasTransactionPin: true,
      });

      setMessage("✅ Transaction PIN created successfully.");

      setTimeout(() => {
        router.push("/dashboard/transfer");
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to create PIN.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/settings"
            className="flex items-center text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>

          <ShieldCheck className="w-6 h-6 text-green-600" />
        </div>

        <div className="text-center mb-8">
          <Lock className="w-12 h-12 mx-auto text-green-600 mb-3" />

          <h1 className="text-2xl font-bold">
            Create Transaction PIN
          </h1>

          <p className="text-gray-500 mt-2 text-sm">
            This PIN will be required every time you
            make a transfer.
          </p>
        </div>

        <form
          onSubmit={handleCreatePin}
          className="space-y-5"
        >
          <div>
            <label className="block mb-2 font-medium">
              Enter 4-Digit PIN
            </label>

            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, ""))
              }
              className="w-full border rounded-lg px-4 py-3 text-center text-2xl tracking-[10px] focus:ring-2 focus:ring-green-600 outline-none"
              placeholder="****"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Confirm PIN
            </label>

            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) =>
                setConfirmPin(
                  e.target.value.replace(/\D/g, "")
                )
              }
              className="w-full border rounded-lg px-4 py-3 text-center text-2xl tracking-[10px] focus:ring-2 focus:ring-green-600 outline-none"
              placeholder="****"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-semibold transition flex justify-center items-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating PIN...
              </>
            ) : (
              "Create PIN"
            )}
          </button>
        </form>

        {message && (
          <p
            className={`mt-5 text-center text-sm ${
              message.startsWith("✅")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </motion.div>
    </main>
  );
}