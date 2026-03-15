"use client";

import { useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { motion } from "framer-motion";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      return setMessage("❌ New passwords do not match.");
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      return setMessage("❌ No authenticated user found.");
    }

    setLoading(true);

    try {
      // Step 1: Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Step 2: Update password
      await updatePassword(user, newPassword);

      setMessage("✅ Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      switch (error.code) {
        case "auth/wrong-password":
          setMessage("❌ Incorrect current password.");
          break;
        case "auth/weak-password":
          setMessage("❌ Password should be at least 6 characters.");
          break;
        default:
          setMessage("❌ Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-8 md:px-16 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <a
          href="/settings"
          className="text-sm text-green-600 hover:underline mb-3 inline-block"
        >
          ← Back to Settings
        </a>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Change Password
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Update your account password securely.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4 text-sm sm:text-base">
          <div>
            <label className="block text-gray-600 font-medium">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border rounded-lg p-2 mt-1 focus:ring-1 focus:ring-green-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border rounded-lg p-2 mt-1 focus:ring-1 focus:ring-green-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border rounded-lg p-2 mt-1 focus:ring-1 focus:ring-green-600 outline-none"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all shadow-sm font-medium"
          >
            {loading ? "Updating..." : "Change Password"}
          </motion.button>

          {message && (
            <p
              className={`mt-3 text-sm ${
                message.startsWith("✅")
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
